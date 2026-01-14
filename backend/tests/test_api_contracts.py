import pytest
import json
import asyncio
from typing import Dict

from httpx import AsyncClient, ASGITransport
from asgi_lifespan import LifespanManager

from src.main import app

# Import Schemas
from src.soc.schemas import IncidentResponse
from src.fleet.schemas import AssetResponse, AssetStatusUpdateResponse
from src.ticketing.schemas import TicketResponse
from src.baggage.schemas import BaggageStatsResponse
from src.visitors.schemas import VisitorDensityResponse


AUTH_LOGIN_PATH = "/auth/login"
SSE_STREAM_PATH = "/stream/ops"
SIM_OVERSPEED_PATH = "/simulation/fleet/overspeed"


async def login(ac: AsyncClient) -> Dict[str, str]:
    """
    Logs in as admin and returns Authorization header.
    Asserts login success.
    """
    response = await ac.post(AUTH_LOGIN_PATH, json={"username": "admin", "password": "admin"})
    assert response.status_code == 200, f"Login failed: {response.text}"
    token = response.json().get("access_token")
    assert token, "No access token returned"
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_api_contracts():
    transport = ASGITransport(app=app)

    async with LifespanManager(app):
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            # 1. Login (Mandatory)
            headers = await login(ac)

            # -----------------------------------------------------------------
            # SOC Context
            # -----------------------------------------------------------------
            response = await ac.get("/incidents", headers=headers)
            assert response.status_code == 200
            data = response.json()
            assert isinstance(data, list)

            # Validate subset to stay performant
            for item in data[:10]:
                validated = IncidentResponse(**item)
                assert validated.id == item["id"]

            # -----------------------------------------------------------------
            # Fleet Context
            # -----------------------------------------------------------------
            response = await ac.get("/fleet/assets", headers=headers)
            assert response.status_code == 200
            data = response.json()
            assert isinstance(data, list)

            for item in data[:10]:
                AssetResponse(**item)

            # -----------------------------------------------------------------
            # Ticketing Context
            # -----------------------------------------------------------------
            response = await ac.get("/tickets", headers=headers)
            assert response.status_code == 200
            data = response.json()
            assert isinstance(data, list)

            for item in data[:10]:
                TicketResponse(**item)

            # -----------------------------------------------------------------
            # Baggage Context (Mock)
            # -----------------------------------------------------------------
            response = await ac.get("/baggage/stats", headers=headers)
            assert response.status_code == 200
            BaggageStatsResponse(**response.json())

            # -----------------------------------------------------------------
            # Visitors Context (Mock)
            # -----------------------------------------------------------------
            response = await ac.get("/visitors/density", headers=headers)
            assert response.status_code == 200
            VisitorDensityResponse(**response.json())


@pytest.mark.asyncio
async def test_fleet_lifecycle():
    transport = ASGITransport(app=app)

    async with LifespanManager(app):
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            headers = await login(ac)

            # 1. Create Asset
            payload = {"asset_type": "vehicle", "name": "ContractTest-Lifecycle"}
            resp = await ac.post("/fleet/assets", json=payload, headers=headers)
            assert resp.status_code in (200, 201), resp.text

            created = AssetResponse(**resp.json())
            assert created.name == "ContractTest-Lifecycle"
            asset_id = created.id

            # 2. Update Status
            status_payload = {"status": "maintenance"}
            resp = await ac.patch(
                f"/fleet/assets/{asset_id}/status",
                json=status_payload,
                headers=headers,
            )
            assert resp.status_code == 200, resp.text

            updated = AssetStatusUpdateResponse(**resp.json())
            assert updated.status == "maintenance"
            assert updated.updated_at_utc is not None


@pytest.mark.asyncio
@pytest.mark.xfail(reason="Flaky under in-memory event bus (DEMO_NO_REDIS); SSE correctness validated in test_sse.py", strict=False)
async def test_sse_sanity():
    """
    Connects to SSE stream and waits for a single event to verify envelope.
    Deterministically triggers an event first to ensure stream has data.
    """
    transport = ASGITransport(app=app)

    async with LifespanManager(app):
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            headers = await login(ac)

            # 1. Trigger Simulation Event (Overspeed)
            sim_resp = await ac.post(SIM_OVERSPEED_PATH, headers=headers)
            assert sim_resp.status_code == 200, f"Simulation trigger failed: {sim_resp.text}"

            # 2. Connect and Read with Timeout
            # Use query param to force replay (since=0) as header might be finicky in test transport
            async def read_sse() -> bool:
                async with ac.stream("GET", f"{SSE_STREAM_PATH}?since=0", headers=headers) as response:
                    assert response.status_code == 200
                    assert response.headers.get("content-type", "").startswith("text/event-stream")

                    async for line in response.aiter_lines():
                        # Robust parsing: handle 'data:' with or without space
                        if line.startswith("data:"):
                            payload_json = line[5:].strip()
                            if not payload_json:
                                continue

                            try:
                                data = json.loads(payload_json)
                            except json.JSONDecodeError:
                                continue

                            keys = data.keys()

                            # Identify keys
                            event_type = data.get("event_type") or data.get("eventType") or data.get("type")
                            correlation_id = data.get("correlation_id") or data.get("correlationId")

                            has_timestamp = any(k in keys for k in [
                                "timestamp", "timestamp_utc", "timestampUtc",
                                "created_at_utc", "createdAtUtc"
                            ])

                            # Verification Logic
                            if event_type:
                                # Wait for specific event if typed
                                if event_type == "fleet.overspeed_detected":
                                    return True
                                # Otherwise ignore other events
                                continue

                            # If untyped, accept any valid envelope shape
                            if correlation_id and has_timestamp:
                                return True

                return False

            try:
                # 5 second timeout for deterministic failure
                success = await asyncio.wait_for(read_sse(), timeout=5.0)
                assert success, "Stream stayed open but no valid target event received"
            except asyncio.TimeoutError:
                pytest.fail("SSE Stream timed out after 5 seconds")
