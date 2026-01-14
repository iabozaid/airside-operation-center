from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum
from datetime import datetime

class HealthStatusEnum(str, Enum):
    MOCK = "mock"
    OK = "ok"
    DEGRADED = "degraded"
    DOWN = "down"

class BaggageThroughput(BaseModel):
    bags_per_min: float = Field(..., ge=0)
    bags_last_15_min: int = Field(..., ge=0)
    bags_today: int = Field(..., ge=0)

class HealthStatus(BaseModel):
    status: HealthStatusEnum
    note: Optional[str] = None

class BaggageStatsResponse(BaseModel):
    timestamp_utc: datetime
    throughput: BaggageThroughput
    health: HealthStatus
