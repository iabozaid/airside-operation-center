from pydantic import BaseModel
from typing import List, Optional

class VisitorZone(BaseModel):
    zone_id: str
    name: str
    density: float
    unit: str = "pax_per_m2"
    count: int

class HealthStatus(BaseModel):
    status: str
    note: Optional[str] = None

class VisitorDensityResponse(BaseModel):
    timestamp_utc: str
    zones: List[VisitorZone]
    health: HealthStatus
