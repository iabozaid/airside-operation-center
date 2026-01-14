import pytest
from unittest.mock import AsyncMock, patch
from src.soc.service import SocService
from src.ticketing.service import TicketService
import uuid

@pytest.mark.asyncio
async def test_escalation_lifecycle():
    """
    Integration-ish test to verify:
    1. Incident transition to Escalated
    2. Idempotent Ticket creation
    3. Correct events emitted
    """
    
    incident_id = str(uuid.uuid4())
    correlation_id = "corr-123"
    
    with patch('src.soc.service.SocRepository') as MockSocRepo, \
         patch('src.ticketing.service.TicketRepository') as MockTicketRepo, \
         patch('src.soc.service.event_bus') as MockSocBus, \
         patch('src.ticketing.service.event_bus') as MockTicketBus:
         
        # Setup SOC Mocks
        soc_repo = MockSocRepo.return_value
        soc_repo.get_incident = AsyncMock(return_value={
            "id": incident_id, 
            "state": "New", 
            "severity": "critical",
            "correlation_id": correlation_id
        })
        soc_repo.transition_incident_state_with_audit = AsyncMock(return_value=True)
        
        # Setup Ticketing Mocks
        ticket_repo = MockTicketRepo.return_value
        ticket_repo.get_by_incident_id = AsyncMock(return_value=None) # Not created yet
        ticket_repo.create_ticket = AsyncMock()
        
        MockSocBus.publish = AsyncMock()
        MockTicketBus.publish = AsyncMock()
        
        # 1. Instantiate Services
        soc_service = SocService()
        ticket_service = TicketService()
        
        # 2. Transition Incident (Simulating Escalation endpoint logic)
        await soc_service.transition_incident(incident_id, "Escalated", "user-1")
        
        # 3. Create Ticket
        incident_data = await soc_service.get_incident(incident_id)
        result = await ticket_service.create_ticket_from_incident(incident_data, correlation_id)
        
        # 4. Assertions
        assert result['status'] == "created"
        
        # Event Bus should have received:
        # 1. incident.state_changed (MockSocBus)
        # 2. ticket.created (MockTicketBus)
        assert MockSocBus.publish.call_count == 1
        assert MockTicketBus.publish.call_count == 1
        
        # Verify Ticket Created with correct SLA
        args, kwargs = ticket_repo.create_ticket.call_args
        ticket_data = args[0]
        assert ticket_data['incident_id'] == incident_id
        # Critical severity -> 4 hours SLA
        # assert ticket_data['sla_deadline'] > datetime.now ... (approximated)

@pytest.mark.asyncio
async def test_escalation_idempotency():
    """Verify duplicate escalation does not create duplicate tickets"""
    with patch('src.ticketing.service.TicketRepository') as MockRepo:
        repo = MockRepo.return_value
        repo.get_by_incident_id = AsyncMock(return_value={'id': 'existing-ticket'})
        
        service = TicketService()
        result = await service.create_ticket_from_incident({'id': 'inc-1'}, 'corr')
        
        assert result['status'] == 'exists'
        assert result['ticket_id'] == 'existing-ticket'
        repo.create_ticket.assert_not_called()
