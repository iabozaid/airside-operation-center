from fastapi import APIRouter
from typing import List
from datetime import datetime, timezone
import random
import uuid
from src.robots.schemas import RobotResponse
from src.infrastructure.demo import is_demo_mode

router = APIRouter(tags=["Robots"])

@router.get("/robots", response_model=List[RobotResponse])
async def get_robots():
    # 1. Demo Mode Gate
    if is_demo_mode():
        now = datetime.now(timezone.utc)
        base_lat, base_lng = 24.9633, 46.6977
    
        mock_data = [
            {"name": "Cleaner-01", "type": "cleaner", "status": "active", "battery": 78},
            {"name": "Cleaner-02", "type": "cleaner", "status": "charging", "battery": 15},
            {"name": "SecBot-Alpha", "type": "security", "status": "active", "battery": 92},
            {"name": "SecBot-Beta", "type": "security", "status": "idle", "battery": 88},
            {"name": "Insp-X1", "type": "inspection", "status": "active", "battery": 45},
            {"name": "Delivery-05", "type": "delivery", "status": "moving", "battery": 60},
        ]
    
        results = []
        for m in mock_data:
            # Random noise for location
            lat = base_lat + (random.random() - 0.5) * 0.005 # Tight cluster inside terminal?
            lng = base_lng + (random.random() - 0.5) * 0.005
            
            results.append(RobotResponse(
                id=str(uuid.uuid4()),
                name=m["name"],
                type=m["type"],
                status=m["status"],
                battery_level=m["battery"],
                last_heartbeat_utc=now,
                location={"lat": lat, "lng": lng}
            ))
    
        return results

    # 2. Real Logic Fallback (No connection usually)
    return []
