from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AssetResponse(BaseModel):
    id: str
    asset_type: str
    name: str
    status: str
    location: Optional[dict] = None # { lat: float, lng: float }
    driver: Optional[str] = None
    speed_kmh: Optional[int] = 0
    stream_url: Optional[str] = None

class AssetCreateRequest(BaseModel):
    asset_type: str
    name: str

class AssetStatusUpdateRequest(BaseModel):
    status: str

class AssetStatusUpdateResponse(BaseModel):
    status: str
    updated_at_utc: datetime
