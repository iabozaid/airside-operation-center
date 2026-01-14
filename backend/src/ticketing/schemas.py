from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class TicketResponse(BaseModel):
    id: str
    incident_id: str
    status: str
    priority: str = "medium"
    title: str = "Ticket"
    sla_deadline_utc: datetime
    assignee_id: Optional[str] = None
    created_at_utc: Optional[datetime] = None

class TicketCreateRequest(BaseModel):
    incident_id: str
