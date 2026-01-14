import pytest
from unittest.mock import AsyncMock, patch
from src.ticketing.service import TicketService, InvalidTransitionError, UnknownStateError, ConcurrentModificationError
import datetime

@pytest.mark.asyncio
async def test_create_ticket_sla_critical():
    """Test that critical severity gets 4 hour deadline in UTC"""
    with patch('src.ticketing.service.TicketRepository') as MockRepo, \
         patch('src.ticketing.service.event_bus') as MockBus:
        
        repo = MockRepo.return_value
        # Mock create_ticket side effect to populate ID if needed, 
        # but pure check of call args is enough.
        mock_repo = repo
        repo.get_by_incident_id = AsyncMock(return_value=None)
        repo.create_ticket = AsyncMock()
        MockBus.publish = AsyncMock()
        
        service = TicketService()
        incident = {'id': 'inc-1', 'severity': 'Critical'}
        # inc-1 maps to specific UUID
        
        await service.create_ticket_from_incident(incident, "corr-1")
        
        # Validate Event Emission
        event_args = MockBus.publish.call_args[1]
        
        # Entity Refs
        assert event_args['entity_refs']['ticketId'] is not None
        assert event_args['entity_refs']['incidentId'] == "inc-1"
        assert event_args['entity_refs']['incidentDbId'] == service._generate_uuid_from_string("inc-1")
        
        # Payload
        assert event_args['payload']['incident_id'] == "inc-1"
        assert event_args['payload']['incident_db_id'] == service._generate_uuid_from_string("inc-1")
        assert event_args['payload']['status'] == "Open"
        
        # Validate Repo Call
        repo_args, _ = mock_repo.create_ticket.call_args
        ticket_data = repo_args[0]
        
        # Check DB ID
        expected_db_id = service._generate_uuid_from_string("inc-1")
        assert ticket_data['incident_id'] == expected_db_id
        
        # Verify SLA (Timezone Aware)
        now_utc = datetime.datetime.now(datetime.timezone.utc)
        expected_deadline = now_utc + datetime.timedelta(hours=4)
        delta = abs(ticket_data['sla_deadline'] - expected_deadline)
        assert delta.total_seconds() < 10 
        assert ticket_data['sla_deadline'].tzinfo == datetime.timezone.utc

@pytest.mark.asyncio
async def test_strict_transitions():
    """Test strict Valid and Invalid transitions"""
    with patch('src.ticketing.service.TicketRepository') as MockRepo, \
         patch('src.ticketing.service.event_bus') as MockBus:
        
        repo = MockRepo.return_value
        repo.get_ticket = AsyncMock(return_value={"id": "t-1", "status": "Open", "incident_id": "inc-1"})
        repo.transition_ticket_state_with_audit = AsyncMock(return_value=True)
        MockBus.publish = AsyncMock()
        
        service = TicketService()
        
        # 1. Valid: Open -> InProgress
        await service.transition_ticket("t-1", "InProgress", "u-1", "c-1")
        repo.transition_ticket_state_with_audit.assert_called_with("t-1", "Open", "InProgress", "u-1")
        
        # 2. Invalid: Open -> Closed (Skip InProgress/Resolved)
        with pytest.raises(InvalidTransitionError):
            await service.transition_ticket("t-1", "Closed", "u-1", "c-1")
            
@pytest.mark.asyncio
async def test_unknown_state_error():
    service = TicketService()
    with pytest.raises(UnknownStateError):
        await service.transition_ticket("t-1", "FakeState", "u-1", "c-1")

@pytest.mark.asyncio
async def test_concurrent_modification():
    with patch('src.ticketing.service.TicketRepository') as MockRepo:
        repo = MockRepo.return_value
        repo.get_ticket = AsyncMock(return_value={"id": "t-1", "status": "Open"})
        repo.transition_ticket_state_with_audit = AsyncMock(return_value=False) # Failed
        
        service = TicketService()
        with pytest.raises(ConcurrentModificationError):
            await service.transition_ticket("t-1", "InProgress", "u-1", "c-1")
