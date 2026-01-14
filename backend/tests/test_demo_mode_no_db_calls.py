import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
import os
import sys

# Force Demo Mode Env Vars (Best Effort)
os.environ["DEMO_MODE"] = "true"
os.environ["DEMO_NO_REDIS"] = "true"

from src.main import app
from src.infrastructure import database
# Import settings instance to patch it directly
from src.infrastructure.settings import settings

client = TestClient(app)

def test_demo_mode_guardrails_all_contexts():
    """
    Principal Engineer Regression Gate:
    1. Force Demo Mode.
    2. Mock DB to explode on access.
    3. FORCE settings.DEMO_NO_REDIS = True (to prevent EventBus crash).
    4. Call representative endpoint for EVERY context.
    5. Assert Success (200) + Schema presence.
    """
    
    # PATCH SETTINGS: Ensure EventBus knows we are in No-Redis mode
    original_redis_setting = settings.DEMO_NO_REDIS
    settings.DEMO_NO_REDIS = True
    
    try:
        with patch.object(database.db, 'get_pool', side_effect=Exception("FATAL: DB Access attempted in Demo Mode!")) as mock_db:
            
            # 1. Analytics
            resp_analytics = client.get("/analytics/summary")
            assert resp_analytics.status_code == 200
            assert "incidents_by_severity" in resp_analytics.json()
            
            # 2. Fleet
            resp_fleet = client.get("/fleet/assets")
            assert resp_fleet.status_code == 200
            assets = resp_fleet.json()
            assert isinstance(assets, list)
            if len(assets) > 0:
                assert "speed_kmh" in assets[0]
                assert "driver" in assets[0]
            
            # 3. Robots
            resp_robots = client.get("/robots")
            assert resp_robots.status_code == 200
            robots = resp_robots.json()
            assert isinstance(robots, list)
            if len(robots) > 0:
                assert "battery_level" in robots[0]

            # 4. Tickets
            resp_tickets = client.get("/tickets")
            assert resp_tickets.status_code == 200
            tickets = resp_tickets.json()
            assert isinstance(tickets, list)
            if len(tickets) > 0:
                assert "sla_deadline_utc" in tickets[0]

            # 5. SOC (Incidents)
            resp_soc = client.get("/incidents")
            assert resp_soc.status_code == 200
            incidents = resp_soc.json()
            assert isinstance(incidents, list) 
            
            # 6. Simulation
            resp_sim = client.post("/simulation/start")
            assert resp_sim.status_code == 200
            assert "scenario_run_id" in resp_sim.json()

            # Final Check: DB never touched
            mock_db.assert_not_called()
    
    finally:
        # Cleanup
        settings.DEMO_NO_REDIS = original_redis_setting
