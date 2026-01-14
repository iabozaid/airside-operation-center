import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch

# IMPORTANT: Do not import app at top-level to avoid binding before patch
# from src.main import app 

@pytest.fixture
def demo_client():
    # Patch where it is USED in the module under test
    # src.dashboard.adapters.api imports is_demo_mode from src.infrastructure.demo
    # So we should patch src.dashboard.adapters.api.is_demo_mode
    # However, since we re-import app inside the fixture, patching the source might be enough if app re-imports module?
    # No, FastAPI routers are often imported at import time.
    # Safe Strategy: Patch the source `src.infrastructure.demo.is_demo_mode` BEFORE any app import if possible, 
    # OR patch the usage in `src.dashboard.adapters.api.is_demo_mode`.
    
    with patch("src.infrastructure.demo.is_demo_mode", return_value=True):
        # We also need to patch usage in api.py if it did `from ... import is_demo_mode`
        with patch("src.dashboard.adapters.api.is_demo_mode", return_value=True):
             with patch("src.infrastructure.database.db.get_pool", side_effect=Exception("DB Access Forbidden in Demo Mode")):
                 from src.main import app
                 yield TestClient(app)

def test_dashboard_flights_demo(demo_client):
    response = demo_client.get("/dashboard/flights")
    assert response.status_code == 200
    data = response.json()
    assert "error" not in data, "Endpoint returned concealed error"
    assert "active_count" in data
    assert "recent_flights" in data

def test_dashboard_gates_demo(demo_client):
    response = demo_client.get("/dashboard/gates")
    assert response.status_code == 200
    data = response.json()
    assert "error" not in data
    assert "gates_monitored" in data

def test_dashboard_crew_demo(demo_client):
    response = demo_client.get("/dashboard/crew")
    assert response.status_code == 200
    data = response.json()
    assert "error" not in data
    assert "total_crew" in data

def test_dashboard_weather_demo(demo_client):
    response = demo_client.get("/dashboard/weather")
    assert response.status_code == 200
    data = response.json()
    assert "error" not in data
    # Weather is allowed to be null/None or dict
    if data is not None:
        assert "temp_c" in data

def test_dashboard_timeline_demo(demo_client):
    response = demo_client.get("/dashboard/timeline")
    assert response.status_code == 200
    data = response.json()
    assert "error" not in data
    assert "events" in data

def test_dashboard_notifications_demo(demo_client):
    response = demo_client.get("/dashboard/notifications")
    assert response.status_code == 200
    data = response.json()
    assert "error" not in data
    assert "items" in data

def test_dashboard_nondemo_not_implemented():
    # Ensure this test is isolated and doesn't rely on existing app import
    # We use a fresh patch context
    with patch("src.infrastructure.demo.is_demo_mode", return_value=False):
        # We need to re-import app to pick up the patch if we want to be super strict,
        # but is_demo_mode is checked at request time, so patching the function strictly is enough.
        # However, due to previous imports, we must patch where it's used.
        with patch("src.dashboard.adapters.api.is_demo_mode", return_value=False):
            from src.main import app
            client = TestClient(app)
            response = client.get("/dashboard/flights")
            assert response.status_code == 501

def test_router_integrity(demo_client):
    """
    Ensure no duplicate routes are registered and all dashboard endpoints exist.
    """
    app = demo_client.app
    
    # Extract all route paths
    routes = [r.path for r in app.routes]
    
    # Filter for dashboard routes
    dashboard_routes = [r for r in routes if r.startswith("/dashboard")]
    
    # Check for duplicates
    assert len(dashboard_routes) == len(set(dashboard_routes)), f"Duplicate dashboard routes detected: {dashboard_routes}"
    
    # Ensure all expected endpoints are present
    expected_endpoints = [
        "/dashboard/flights",
        "/dashboard/gates",
        "/dashboard/crew",
        "/dashboard/weather",
        "/dashboard/timeline",
        "/dashboard/notifications"
    ]
    
    for endpoint in expected_endpoints:
        assert endpoint in routes, f"Missing expected dashboard route: {endpoint}"
