from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_baggage_stats_contract():
    """Validates GET /baggage/stats schema"""
    response = client.get("/baggage/stats")
    assert response.status_code == 200
    data = response.json()
    
    # Check Top Level
    assert "timestamp_utc" in data
    assert isinstance(data["timestamp_utc"], str)
    assert "throughput" in data
    assert "health" in data
    
    # Check Throughput
    tp = data["throughput"]
    assert isinstance(tp["bags_per_min"], (int, float))
    assert isinstance(tp["bags_last_15_min"], int)
    assert isinstance(tp["bags_today"], int)
    
    # Check Health
    health = data["health"]
    assert health["status"] == "mock"
    assert "note" in health

def test_visitors_density_contract():
    """Validates GET /visitors/density schema"""
    response = client.get("/visitors/density")
    assert response.status_code == 200
    data = response.json()
    
    # Check Top Level
    assert "timestamp_utc" in data
    assert isinstance(data["timestamp_utc"], str)
    assert "zones" in data
    assert isinstance(data["zones"], list)
    assert len(data["zones"]) >= 3
    
    # Check Zone Structure
    zone = data["zones"][0]
    assert isinstance(zone["zone_id"], str)
    assert isinstance(zone["name"], str)
    assert isinstance(zone["density"], (int, float))
    assert zone["unit"] == "pax_per_m2"
    assert isinstance(zone["count"], int)
    
    # Check Health
    health = data["health"]
    assert health["status"] == "mock"
