from pydantic import BaseModel
from typing import Optional, Dict, Any

class ErrorResponse(BaseModel):
    error: str
    detail: str
    context: Optional[Dict[str, Any]] = None
