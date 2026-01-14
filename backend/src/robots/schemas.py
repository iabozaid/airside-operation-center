from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime

class RobotResponse(BaseModel):
    id: str
    name: str
    type: str # 'cleaner', 'security', 'delivery', 'inspection'
    status: str # 'active', 'charging', 'idle', 'maintenance'
    battery_level: int
    last_heartbeat_utc: datetime
    location: Optional[Dict[str, float]] = None # {lat, lng}
