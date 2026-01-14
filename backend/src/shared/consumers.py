import asyncio
import json
import logging
import uuid
from typing import Any, Dict
from src.shared.event_bus import event_bus
from src.infrastructure.settings import settings
from src.infrastructure.database import db
from src.fleet.service import FleetService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def generate_uuid_from_string(val: str) -> str:
    try:
        return str(uuid.UUID(val))
    except (ValueError, TypeError):
        return str(uuid.uuid5(uuid.NAMESPACE_DNS, str(val)))

def normalize_message(message_data: Dict[Any, Any]) -> Dict[str, Any]:
    normalized = {}
    if not message_data:
        return normalized

    for k, v in message_data.items():
        if k is None: k = ""
        if v is None: v = ""
        if isinstance(k, bytes): k = k.decode("utf-8")
        k = str(k)
        if isinstance(v, bytes): v_str = v.decode("utf-8")
        else: v_str = str(v)
        
        if k in ["payload", "entity_refs"]:
            try:
                if isinstance(v, (dict, list)): v_parsed = v
                else: v_parsed = json.loads(v_str)
            except (json.JSONDecodeError, TypeError):
                v_parsed = {}
            normalized[k] = v_parsed
        else:
            normalized[k] = v_str
    return normalized

def get_any(payload, keys, default=None):
    if not payload: return default
    for k in keys:
        if k in payload: return payload[k]
    return default

class ConsumerManager:
    # Do NOT init list/locks at class level to avoid loop binding issues
    def __init__(self):
        self.fleet_service = FleetService()
        self._tasks = []
        self._running = False

    async def process_event(self, raw_event_data):
        event_data = normalize_message(raw_event_data)
        event_type = (event_data.get("event_type") or "").strip()
        payload = event_data.get("payload", {})
        
        # Ensure pool is ready (should be lazily handled by db.get_pool but good to know)
        pool = await db.get_pool()

        try:
            if event_type == "incident.created":
                inc_id = get_any(payload, ["id", "incidentId", "incident_id"])
                if not inc_id: raise ValueError("Missing ID")
                
                inc_type = get_any(payload, ["type", "incidentType"], "UNKNOWN")
                severity = get_any(payload, ["severity"], "info")
                state = get_any(payload, ["state"], "New")
                corr_id = get_any(payload, ["correlation_id", "correlationId"]) or str(uuid.uuid4())
                
                db_id = generate_uuid_from_string(inc_id)
                db_corr_id = generate_uuid_from_string(corr_id)

                await pool.execute("""
                    INSERT INTO incidents (id, type, severity, state, correlation_id, created_at)
                    VALUES ($1, $2, $3, $4, $5, NOW())
                    ON CONFLICT (id) DO NOTHING
                """, db_id, inc_type, severity, state, db_corr_id)

            elif event_type == "incident.state_changed":
                inc_id = get_any(payload, ["incident_id", "incidentId", "id"])
                to_state = get_any(payload, ["to_state", "toState", "state"])
                if not inc_id or not to_state: raise ValueError("Missing ID or State")
                
                db_id = generate_uuid_from_string(inc_id)
                await pool.execute("UPDATE incidents SET state = $1 WHERE id = $2", to_state, db_id)

            elif event_type in ["fleet.asset_status_changed", "fleet.asset.status_changed"]:
                await self.fleet_service.process_telemetry(event_type, payload)
            
            elif event_type in ["fleet.robot_patrol_started"]:
                await self.fleet_service.process_telemetry(event_type, payload)

        except Exception as e:
            logger.debug(f"Process failed for {event_type}: {e}")
            raise

    async def consume_demo_loop(self):
        current_id = "0-0"
        while self._running:
            try:
                result = await event_bus.read_next_for_sse(last_id=current_id, block_ms=2000)
                if result:
                    msg_id, msg_data = result
                    current_id = msg_id
                    try:
                        await self.process_event(msg_data)
                    except Exception as e:
                         logger.error(f"[DEMO] Message {msg_id} failed: {e}")
                else:
                    await asyncio.sleep(0.1)
            except Exception as e:
                logger.error(f"[DEMO Consumers] Loop error: {e}")
                await asyncio.sleep(1)

    async def consume_loop(self, group_name: str, consumer_name: str, stream_key: str):
        try:
             r = await event_bus.get_redis()
        except Exception:
             return

        try:
             # Just in case stream doesn't exist yet
             pass 
        except: pass

        while self._running:
            try:
                resp = await r.xreadgroup(group_name, consumer_name, {stream_key: ">"}, count=5, block=2000)
                if resp:
                    for stream, messages in resp:
                        for message_id, message_data in messages:
                            try:
                                await self.process_event(message_data)
                                await r.xack(stream, group_name, message_id)
                            except Exception as e:
                                logger.error(f"Message {message_id} failed: {e}")
            except Exception as e:
                if self._running:
                    logger.error(f"Consumer loop error: {e}")
                    await asyncio.sleep(1)

    async def start(self):
        if self._running:
            return
        logger.info("Starting consumers...")
        self._running = True
        
        # Reset tasks list to avoid accumulating stale tasks
        self._tasks = []

        if settings.DEMO_NO_REDIS:
            logger.warning("[DEMO MODE] Starting In-Memory Consumers (No Redis).")
            self._tasks.append(asyncio.create_task(self.consume_demo_loop()))
        else:
            self._tasks.append(
                asyncio.create_task(self.consume_loop("cg:read-models", "worker-1", event_bus.GLOBAL_STREAM))
            )
            self._tasks.append(
                asyncio.create_task(self.consume_loop("cg:soc-core", "worker-1", event_bus.SIMULATION_STREAM))
            )

    async def stop(self):
        logger.info("Stopping consumers...")
        self._running = False
        for task in self._tasks:
            task.cancel()
        if self._tasks:
            await asyncio.gather(*self._tasks, return_exceptions=True)
        self._tasks = []

consumer_manager = ConsumerManager()
