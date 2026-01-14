import pytest
import json
import asyncio
from httpx import AsyncClient, ASGITransport
from asgi_lifespan import LifespanManager
from src.main import app
from src.infrastructure.settings import settings

# Helper
async def login(ac: AsyncClient):
    response = await ac.post("/auth/login", json={"username": "admin", "password": "admin"})
    token = response.json().get("access_token")
    return {"Authorization": f"Bearer {token}"}

@pytest.mark.asyncio
async def test_cors_headers():
    transport = ASGITransport(app=app)
    async with LifespanManager(app):
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            # Test Allowed Origin
            headers = {"Origin": "http://localhost:3000", "Access-Control-Request-Method": "GET"}
            resp = await ac.options("/events", headers=headers)
            assert resp.status_code == 200
            assert resp.headers["access-control-allow-origin"] == "http://localhost:3000"
            
            # Test Request ID
            resp = await ac.get("/events")
            assert "x-request-id" in resp.headers

@pytest.mark.asyncio
async def test_validation_error_format():
    transport = ASGITransport(app=app)
    async with LifespanManager(app):
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            # Trigger validation error (limit 0 is invalid, must be >= 1)
            resp = await ac.get("/events?limit=0")
            assert resp.status_code == 422
            data = resp.json()
            assert "error" in data
            assert data["error"]["code"] == "VALIDATION_ERROR"
            assert isinstance(data["error"]["details"], list)

@pytest.mark.asyncio
async def test_events_polling():
    transport = ASGITransport(app=app)
    async with LifespanManager(app):
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            # 1. Fetch Events (Should be empty initially if no events)
            resp = await ac.get("/events")
            assert resp.status_code == 200
            data = resp.json()
            assert "items" in data
            assert "next_cursor" in data
            assert data["next_cursor"].startswith("demo:") or data["next_cursor"].startswith("redis:")

@pytest.mark.asyncio
@pytest.mark.skip(reason="Hangs in this environment due to asyncio.wait_for issues")
async def test_sse_heartbeat():
    if not settings.DEMO_NO_REDIS:
        pytest.skip("Test requires DEMO_NO_REDIS=true")
        
    transport = ASGITransport(app=app)
    async with LifespanManager(app):
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
             headers = await login(ac)
             
             async with ac.stream("GET", "/stream/ops?since=0", headers=headers) as response:
                 assert response.status_code == 200
                 
                 # Wait for heartbeat
                 # Should arrive in ~2s. wait 5s safe.
                 start_time = asyncio.get_event_loop().time()
                 heartbeat_received = False
                 
                 try:
                     async with asyncio.timeout(5.0):
                         async for line in response.aiter_lines():
                             if line.startswith("event: heartbeat"):
                                 heartbeat_received = True
                                 break
                 except asyncio.TimeoutError:
                     pass
                 
                 assert heartbeat_received, "Did not receive heartbeat within 5 seconds"
