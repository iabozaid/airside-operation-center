from fastapi import APIRouter, Depends, HTTPException
from typing import List
from datetime import datetime, timedelta, timezone
from src.ticketing.service import TicketService
from src.ticketing.schemas import TicketResponse, TicketCreateRequest
from src.infrastructure.demo import is_demo_mode
import uuid

router = APIRouter(tags=["Ticketing"])

def get_ticket_service():
    return TicketService()

@router.get("/tickets", response_model=List[TicketResponse])
async def get_tickets():
    # 1. Demo Mode Gate
    if is_demo_mode():
        now = datetime.now(timezone.utc)
        
        mock_tickets = [
            TicketResponse(
                id=str(uuid.uuid4()),
                incident_id=str(uuid.uuid4()),
                title="Escalated: Unauthorized Access Gate 4",
                status="open",
                priority="critical",
                sla_deadline_utc=now + timedelta(hours=4),
                assignee_id="operator-1",
                created_at_utc=now - timedelta(minutes=10)
            ),
            TicketResponse(
                id=str(uuid.uuid4()),
                incident_id=str(uuid.uuid4()),
                title="Maintenance: Conveyor Belt T2",
                status="in_progress",
                priority="high",
                sla_deadline_utc=now + timedelta(hours=24),
                assignee_id="tech-leads",
                created_at_utc=now - timedelta(hours=2)
            ),
            TicketResponse(
                id=str(uuid.uuid4()),
                incident_id=str(uuid.uuid4()),
                title="Inspection: Calibration Error",
                status="open",
                priority="medium",
                sla_deadline_utc=now + timedelta(days=2),
                assignee_id=None,
                created_at_utc=now - timedelta(days=1)
            ),
            TicketResponse(
                id=str(uuid.uuid4()),
                incident_id=str(uuid.uuid4()),
                title="Security Check: Badge Validation",
                status="resolved",
                priority="low",
                sla_deadline_utc=now - timedelta(hours=1),
                assignee_id="security-ops",
                created_at_utc=now - timedelta(days=3)
            )
        ]
        return mock_tickets

    # 2. Real Logic Fallback (No DB logic implemented yet)
    return []

@router.post("/tickets", response_model=TicketResponse)
async def create_ticket(
    request: TicketCreateRequest,
    service: TicketService = Depends(get_ticket_service)
):
    # 1. Demo Mode Gate
    if is_demo_mode():
        now = datetime.now(timezone.utc)
        return TicketResponse(
            id=str(uuid.uuid4()),
            incident_id=request.incident_id,
            title="Manual Ticket (Demo)",
            status="open",
            priority="medium",
            sla_deadline_utc=now + timedelta(days=1),
            assignee_id="operator-1",
            created_at_utc=now
        )
    
    # 2. Real Logic
    fake_incident = {"id": request.incident_id} 
    correlation_id = str(uuid.uuid4())
    
    result = await service.create_ticket_from_incident(fake_incident, correlation_id)
    
    return TicketResponse(
        id=result['ticket_id'],
        incident_id=result['incident_id'],
        status=result['status'],
        sla_deadline_utc=datetime.fromisoformat(result['sla_deadline']),
        assignee_id=None
    )
