from fastapi import FastAPI, Request, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from src.infrastructure.database import db
from src.infrastructure.settings import settings
from src.shared.event_bus import event_bus
from src.shared.consumers import consumer_manager
from src.identity.bootstrap import seed_admin_if_enabled
from src.infrastructure.demo import is_demo_mode

# Import Routers
from src.identity.adapters.api import router as identity_router
from src.soc.adapters.api import router as soc_router
from src.tickets.adapters.api import router as tickets_router
from src.fleet.adapters.api import router as fleet_router
from src.robots.adapters.api import router as robots_router
from src.simulation.adapters.api import router as simulation_router
from src.simulation.control_router import router as simulation_control_router
from src.analytics.adapters.api import router as analytics_router
from src.baggage.router import router as baggage_router
from src.visitors.router import router as visitors_router
from src.dashboard.adapters.api import router as dashboard_router

import asyncio
import json
import uuid
import datetime

from fastapi.exceptions import RequestValidationError
from starlette.requests import Request
from starlette.responses import JSONResponse

app = FastAPI(title="ATSS Matarat Backend")

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Invalid request parameters",
                "details": exc.errors()
            }
        },
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": "HTTP_ERROR",
                "message": exc.detail,
            }
        },
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    print(f"Unhandled Error: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An unexpected error occurred.",
            }
        },
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_request_id_header(request: Request, call_next):
    request_id = request.headers.get("X-Request-Id") or str(uuid.uuid4())
    # Store in state for logs if needed, but definitely echo back
    response = await call_next(request)
    response.headers["X-Request-Id"] = request_id
    return response

@app.on_event("startup")
async def startup_event():
    print("Startup: Initializing...")
    try:
        # 1. Init Database Pool (PROD ONLY)
        if not is_demo_mode():
            await db.init_pool()
            print("Startup: DB Initialized")
        else:
            print("Startup: DB Init SKIPPED (Demo Mode)")

        # 2. Auto-Migrate (PROD ONLY)
        if not is_demo_mode() and settings.AUTO_MIGRATE:
             try:
                 await db.init_schema()
             except FileNotFoundError as e:
                 print(f"[WARN] AUTO_MIGRATE enabled but schema.sql not found: {e}")

        # 3. Init Streams (ALWAYS - handles Demo/Redis internally)
        await event_bus.init_streams()
        print("Startup: EventBus Initialized (Demo/Redis aware)")

        # 4. Bootstrap & Start Consumers
        await seed_admin_if_enabled()
        
        if not is_demo_mode():
            await consumer_manager.start()
            print("Startup: Consumer Manager Started")
        else:
            print("Startup: Consumer Manager SKIPPED (Demo Mode)")
        
    except Exception as e:
        print(f"Startup Error: {e}")
        # In strict prod, we might raise, but for demo resilience we log
        if not is_demo_mode():
            raise e

@app.on_event("shutdown")
async def shutdown_event():
    await consumer_manager.stop()
    await db.close()

# Streaming Endpoint
@app.get("/stream/ops")
async def stream_ops(request: Request, since: str = "$"):
    # Support resuming via query param 'since' or Header 'Last-Event-ID'
    last_id = request.headers.get("Last-Event-ID", since)

    async def event_generator():
        current_id = last_id
        
        while True:
            if await request.is_disconnected():
                break

            try:
                # Use abstraction (works for Redis or Demo/Memory)
                # block_ms=2000 to allow for heartbeats (every ~2s)
                print(f"DEBUG: calling read_next_for_sse last_id={current_id}")
                result = await event_bus.read_next_for_sse(last_id=current_id, block_ms=2000)
                print(f"DEBUG: read_next_for_sse returned {result}")
                
                if result:
                    message_id, message_data = result
                    current_id = message_id
                    
                    event_type = (message_data.get("event_type") or "")
                    
                    yield f"id: {message_id}\n"
                    yield f"event: {event_type}\n"
                    yield f"data: {json.dumps(message_data)}\n\n"
                    
                else:
                    # Timeout (Start/Keep-Alive) logic
                    if settings.DEMO_NO_REDIS:
                         # In Demo Mode, emit explicit heartbeat to keep connection healthy
                         heartbeat = {
                             "timestamp": datetime.datetime.utcnow().isoformat(),
                             "mode": "demo"
                         }
                         yield f"event: heartbeat\n"
                         yield f"data: {json.dumps(heartbeat)}\n\n"
                    else:
                        # Keep-Alive comment to prevent connection close on some proxies
                        yield ": keep-alive\n\n"
                    
            except Exception as e:
                print(f"Stream error: {e}")
                await asyncio.sleep(1)

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.get("/events")
async def get_events(since: str = Query(None, description="Cursor for pagination (demo:<idx> or redis:<id>)"), 
                     limit: int = Query(50, ge=1, le=1000)):
    items, next_cursor = await event_bus.list_events(cursor=since, limit=limit)
    return {
        "items": items,
        "next_cursor": next_cursor
    }

# Include Routers
app.include_router(identity_router)
app.include_router(soc_router)
app.include_router(tickets_router)
app.include_router(fleet_router)
app.include_router(robots_router)
app.include_router(simulation_router)
app.include_router(simulation_control_router)
app.include_router(analytics_router)
app.include_router(baggage_router)
app.include_router(visitors_router)
app.include_router(dashboard_router)

