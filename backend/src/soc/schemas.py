from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class IncidentResponse(BaseModel):
    id: str
    type: str
    severity: str
    state: str
    created_at_utc: datetime
    correlation_id: str
    location: Optional[dict] = None

class IncidentTransitionRequest(BaseModel):
    to_state: str
    triggered_by: str

class IncidentTransitionResponse(BaseModel):
    id: str
    state: str
    updated_at_utc: datetime = datetime.utcnow()

class EscalationResponse(BaseModel):
    status: str
    incident_id: str
    ticket_id: str
    ticket_status: str

class EvidenceItem(BaseModel):
    id: str
    type: str
    label: str
    url: Optional[str] = None
    timestamp: datetime
    source: str

class ClaimResponse(BaseModel):
    success: bool
    assignee: str
