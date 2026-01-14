from src.infrastructure.settings import settings
import json
import uuid
from datetime import datetime
import asyncio
from typing import Optional, Tuple, Dict, Any, List
import logging

try:
    import redis.asyncio as redis
except ImportError:
    redis = None

logger = logging.getLogger(__name__)

class EventBus:
    _redis = None
    GLOBAL_STREAM = "stream:events:global"
    SIMULATION_STREAM = "stream:events:simulation"
    
    CONSUMER_GROUPS = [
        "cg:soc-core",
        "cg:read-models",
        "cg:audit",
        "cg:analytics",
        "cg:frontend-fanout",
    ]

    # In-memory storage for Demo Mode
    # _demo_cond: Used for notifying waiters (Conditions are loop-bound, must init in loop)
    # _demo_events: History (append-only)
    _demo_cond: Optional[asyncio.Condition] = None
    _demo_events: List[Tuple[str, Dict[str, Any]]] = []
    _is_demo_mode: bool = False

    @classmethod
    async def get_redis(cls):
        if cls._is_demo_mode:
             raise RuntimeError("Redis is disabled in DEMO_NO_REDIS mode.")
             
        if not redis and not settings.DEMO_NO_REDIS:
             raise RuntimeError("Redis package missing but DEMO_NO_REDIS is False.")

        if cls._redis is None:
            cls._redis = redis.from_url(settings.REDIS_URL, decode_responses=True)
        return cls._redis

    @classmethod
    def _should_use_redis(cls) -> bool:
        return not settings.DEMO_NO_REDIS

    @classmethod
    async def init_streams(cls):
        # Reset State (Safe for tests/re-init)
        cls._redis = None
        cls._demo_events = []
        cls._demo_cond = None
        cls._is_demo_mode = False

        if not cls._should_use_redis():
            cls._is_demo_mode = True
            # Condition must be created on the current running loop
            cls._demo_cond = asyncio.Condition()
            logger.warning("[DEMO MODE] Redis disabled. Using In-Memory Event Bus.")
            return

        # Redis Init
        try:
            r = await cls.get_redis()
            for stream in [cls.GLOBAL_STREAM, cls.SIMULATION_STREAM]:
                for group in cls.CONSUMER_GROUPS:
                    try:
                        await r.xgroup_create(stream, group, id="0", mkstream=True)
                    except redis.ResponseError as e:
                        if "BUSYGROUP" not in str(e) and "unknown command" not in str(e).lower():
                            raise
        except Exception as e:
            # Fallback only if strictly requested, but here we enforce consistent config
            if settings.DEMO_NO_REDIS:
                 # Should have been caught by _should_use_redis logic, but strictly safe:
                 cls._is_demo_mode = True
                 cls._demo_cond = asyncio.Condition()
                 return
            logger.error(f"Failed to init Redis Streams: {e}")
            raise e

    @classmethod
    def _generate_demo_id(cls) -> str:
        # Use simple numeric timestamp-sequence for ordering
        ts = int(datetime.utcnow().timestamp() * 1000)
        return f"{ts}-{len(cls._demo_events)}"

    @classmethod
    async def publish(cls, event_type: str, payload: dict, source_context: str, severity: str = "info", correlation_id: str = None, entity_refs: dict = None, stream: str = GLOBAL_STREAM):
        event_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat()
        if not correlation_id:
            correlation_id = str(uuid.uuid4())

        envelope = {
            "event_id": event_id,
            "event_type": event_type,
            "source_context": source_context,
            "severity": severity,
            "timestamp": timestamp,
            "correlation_id": correlation_id,
            "entity_refs": json.dumps(entity_refs or {}),
            "payload": json.dumps(payload),
        }

        # --- DEMO MODE ---
        if cls._is_demo_mode:
            stream_id = cls._generate_demo_id()
            
            # Lock condition to safely modify state and notify
            if cls._demo_cond:
                async with cls._demo_cond:
                    cls._demo_events.append((stream_id, envelope))
                    cls._demo_cond.notify_all()
            else:
                 # Should not happen if init_streams called
                 cls._demo_events.append((stream_id, envelope))

            return stream_id

        # --- REDIS MODE ---
        r = await cls.get_redis()
        return await r.xadd(stream, envelope)

    @classmethod
    async def read_next_for_sse(cls, last_id: str = "$", block_ms: int = 5000) -> Optional[Tuple[str, Dict[str, Any]]]:
        # --- DEMO MODE ---
        if cls._is_demo_mode:
            if cls._demo_cond is None:
                return None
            
            async with cls._demo_cond:
                # 1. Determine Start Index based on last_id
                start_index = 0
                if last_id and last_id != "$":
                    # Simple linear search logic for demo (performance invalid for prod, fine for demo)
                    found = False
                    for i, (eid, _) in enumerate(cls._demo_events):
                        if eid == last_id:
                            start_index = i + 1
                            found = True
                            break
                    if not found:
                         # Client sent unknown ID? Start from beginning or end? 
                         # Standard Redis behavior: if ID too old/unknown, might error or just give new.
                         # For demo: assume "beginning" if unknown is safest for data visibility, 
                         # OR "end" if strictly "give me NEW things". 
                         # Let's assume start form 0 (replay/catchup safe).
                         start_index = 0
                elif last_id == "$":
                    start_index = len(cls._demo_events)

                # 2. Check if event available immediately
                if start_index < len(cls._demo_events):
                    return cls._demo_events[start_index]

                # 3. Wait (if blocking allowed)
                if block_ms > 0:
                    try:
                        # Wait for notification
                        print(f"DEBUG: EventBus waiting on cond for {block_ms}ms")
                        await asyncio.wait_for(cls._demo_cond.wait(), timeout=block_ms / 1000.0)
                        print(f"DEBUG: EventBus woke up")
                        
                        # Woke up: Re-check list
                        # Note: start_index is based on OLD length. 
                        # If new items added, len increasing. 
                        # We just check if we have something at start_index now.
                        if start_index < len(cls._demo_events):
                             return cls._demo_events[start_index]
                    except asyncio.TimeoutError:
                        return None
            
            return None

        # --- REDIS MODE ---
        r = await cls.get_redis()
        try:
             streams = {cls.GLOBAL_STREAM: last_id}
             resp = await r.xread(streams, count=1, block=block_ms)
             if resp:
                 for _, messages in resp:
                     for msg_id, msg_data in messages:
                         return msg_id, msg_data
        except (redis.ConnectionError, redis.TimeoutError):
             return None
        return None

    @classmethod
    async def list_events(cls, cursor: str = None, limit: int = 50) -> Tuple[List[Dict[str, Any]], str]:
        """
        Lists events handling 'demo:<index>' or 'redis:<id>' cursors.
        Returns (events, next_cursor).
        """
        if cls._is_demo_mode:
            # Parse Cursor
            start_index = 0
            if cursor and cursor.startswith("demo:"):
                try:
                    start_index = int(cursor.split(":")[1])
                except ValueError:
                    start_index = 0
            
            # If cursor is None/Empty, default to "latest N" for demo friendly usage
            # BUT specific requirement: "return latest N events or return from beginning"
            # Plan said: "If since is missing: Return latest limit events"
            if not cursor:
                 start_index = max(0, len(cls._demo_events) - limit)

            sliced = cls._demo_events[start_index : start_index + limit]
            
            # Extract envelopes
            results = []
            for _, envelope in sliced:
                results.append(envelope)
            
            next_index = start_index + len(sliced)
            # If we reached the end, next cursor is purely the index
            # If there are NO events, next cursor is 0 (or start_index)
            
            return results, f"demo:{next_index}"

        else:
            # Redis Mode
            r = await cls.get_redis()
            # Redis XREAD/XRANGE logic
            # cursor format 'redis:<id>'
            
            redis_cursor = "-"
            if cursor and cursor.startswith("redis:"):
                redis_cursor = cursor.split(":", 1)[1]
            elif not cursor:
                # If missing, we want latest N? 
                # XRANGE is not great for "latest N" efficiently without REVRANGE.
                # XREVRANGE stream + + COUNT limit
                # But common polling pattern: 
                # If no cursor -> Give me from NOW? Or give me last N?
                # Requirement: "If since is missing: Return latest limit events"
                # using XREVRANGE
                try:
                    # Get last N in reverse
                    rev_items = await r.xrevrange(cls.GLOBAL_STREAM, count=limit)
                    # Reverse back to chronological
                    items = sorted(rev_items, key=lambda x: x[0])
                    
                    results = []
                    last_id = "0-0"
                    for msg_id, msg_data in items:
                        results.append(msg_data)
                        last_id = msg_id
                    
                    return results, f"redis:{last_id}"
                except Exception:
                     return [], "redis:0-0"

            # Normal forward range if cursor provided
            # XRANGE stream start end COUNT limit
            # Note: XRANGE start is inclusive. If we use valid ID, we might see it again.
            # Usually we use "(" for exclusive but XRANGE syntax varies.
            # Safe bet: XREAD count block=0 ? No, we want history.
            # XRANGE stream start + COUNT limit
            
            try:
                # We need exclusive start. Redis < 6.2 doesn't support exclusive range operator easily in all clients?
                # Standard pattern: (last_id
                start_id = "(" + redis_cursor if redis_cursor != "-" else "-"
                
                # If cursor is 0-0, we want from start
                if redis_cursor == "0-0":
                     start_id = "-"
                
                items = await r.xrange(cls.GLOBAL_STREAM, min=start_id, max="+", count=limit)
                
                results = []
                last_id = redis_cursor
                for msg_id, msg_data in items:
                    results.append(msg_data)
                    last_id = msg_id
                    
                return results, f"redis:{last_id}"
            except Exception as e:
                logger.error(f"Redis list_events error: {e}")
                return [], f"redis:{redis_cursor}"

event_bus = EventBus
