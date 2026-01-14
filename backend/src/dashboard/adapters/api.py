from fastapi import APIRouter, HTTPException
from src.infrastructure.demo import is_demo_mode
from datetime import datetime, timedelta
import random

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/flights")
async def get_flights():
    if not is_demo_mode():
        raise HTTPException(status_code=501, detail="Live data not implemented")
        
    # Mock Data
    return {
        "active_count": 142,
        "breakdown": {
            "arriving": 45,
            "departing": 89,
            "delayed": 12,
            "critical": 3
        },
        "recent_flights": [
            {"id": "SV102", "airline": "Saudia", "status": "Landed", "eta": "10:05"},
            {"id": "XY334", "airline": "Flynas", "status": "Final Approach", "eta": "10:12"},
            {"id": "BA263", "airline": "British Airways", "status": "Delayed", "eta": "10:45"},
            {"id": "SV882", "airline": "Saudia", "status": "Boarding", "eta": "11:00"},
        ]
    }

@router.get("/gates")
async def get_gates():
    if not is_demo_mode():
        raise HTTPException(status_code=501, detail="Live data not implemented")
        
    return {
        "gates_monitored": [
            {"id": "G12", "status": "occupied", "aircraft": "SV102", "utilization": 85},
            {"id": "G14", "status": "available", "aircraft": None, "utilization": 42},
            {"id": "G15", "status": "occupied", "aircraft": "XY334", "utilization": 91},
            {"id": "G18", "status": "maintenance", "aircraft": None, "utilization": 0},
        ],
        "average_utilization": 76
    }

@router.get("/crew")
async def get_crew():
    if not is_demo_mode():
        raise HTTPException(status_code=501, detail="Live data not implemented")

    return {
        "total_crew": 340,
        "deployed": 215,
        "available": 125,
        "allocation": {
            "ground_handling": 85,
            "security": 60,
            "maintenance": 40,
            "passenger_services": 30
        }
    }

@router.get("/weather")
async def get_weather():
    if not is_demo_mode():
        raise HTTPException(status_code=501, detail="Live data not implemented")

    # Option 1: Implement null behavior (~10% chance)
    if random.random() < 0.1:
        return None

    return {
        "temp_c": 34,
        "wind_kph": 18,
        "visibility_km": 10,
        "condition": "Clear Sky"
    }

@router.get("/timeline")
async def get_timeline():
    if not is_demo_mode():
        raise HTTPException(status_code=501, detail="Live data not implemented")

    now = datetime.now()
    return {
        "events": [
            {"time": (now + timedelta(minutes=15)).strftime("%H:%M"), "type": "peak_traffic", "ref_id": "MSG-001", "description": "Predicted high traffic flow"},
            {"time": (now + timedelta(hours=1)).strftime("%H:%M"), "type": "vip_arrival", "ref_id": "FLT-vip-01", "description": "VIP Protocol Active"},
            {"time": (now + timedelta(hours=2, minutes=30)).strftime("%H:%M"), "type": "maintenance", "ref_id": "RWY-23L", "description": "Runway 23L Scheduled Maintenance"},
        ]
    }

@router.get("/notifications")
async def get_notifications():
    if not is_demo_mode():
        raise HTTPException(status_code=501, detail="Live data not implemented")

    return {
        "items": [
            {"severity": "CRITICAL", "message": "Gate G12 Baggage Belt Malfunction", "timestamp": "2 mins ago", "action": "Dispatch Tech"},
            {"severity": "ATTENTION", "message": "Shift Change in 15 mins", "timestamp": "5 mins ago", "action": "Acknowledge"},
            {"severity": "INFO", "message": "Daily Report Generated", "timestamp": "1 hour ago", "action": "View"},
        ]
    }
