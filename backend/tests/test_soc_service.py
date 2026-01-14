import pytest
from unittest.mock import AsyncMock, patch
from src.soc.service import SocService, InvalidTransitionError, ConcurrentModificationError, UnknownStateError
import uuid

@pytest.mark.asyncio
async def test_transition_valid():
    """Test valid transition from New -> Triage"""
    with patch('src.soc.service.SocRepository') as MockRepo, \
         patch('src.soc.service.event_bus') as MockBus:
        
        repo = MockRepo.return_value
        repo.get_incident = AsyncMock(return_value={"id": "1", "state": "New", "correlation_id": "corr-123"})
        repo.transition_incident_state_with_audit = AsyncMock(return_value=True)
        
        MockBus.publish = AsyncMock()
        
        service = SocService()
        result = await service.transition_incident("1", "Triage", "user")
        
        assert result["status"] == "success"
        repo.transition_incident_state_with_audit.assert_called_with("1", "New", "Triage", "user")
        MockBus.publish.assert_called_once()
        
        # Verify envelope contents
        args, kwargs = MockBus.publish.call_args
        assert kwargs['correlation_id'] == "corr-123"
        assert kwargs['entity_refs'] == {"incidentId": "1"}

@pytest.mark.asyncio
async def test_transition_invalid():
    """Test invalid transition from New -> Resolved"""
    with patch('src.soc.service.SocRepository') as MockRepo:
        repo = MockRepo.return_value
        repo.get_incident = AsyncMock(return_value={"id": "1", "state": "New"})
        
        service = SocService()
        
        with pytest.raises(InvalidTransitionError):
            await service.transition_incident("1", "Resolved", "user")

@pytest.mark.asyncio
async def test_transition_unknown_state():
    """Test transition to unknown state raises UnknownStateError"""
    service = SocService()
    
    with pytest.raises(UnknownStateError) as exc:
        await service.transition_incident("1", "NonExistentState", "user")
    
    assert "Unknown incident state 'NonExistentState'" in str(exc.value)

@pytest.mark.asyncio
async def test_transition_current_state_unknown():
    """Test when DB has an unknown state for the incident"""
    with patch('src.soc.service.SocRepository') as MockRepo:
        repo = MockRepo.return_value
        # Simulate corrupt DB state
        repo.get_incident = AsyncMock(return_value={"id": "1", "state": "CorruptState"})
        
        service = SocService()
        
        with pytest.raises(UnknownStateError) as exc:
            await service.transition_incident("1", "Triage", "user")
        
        assert "Unknown incident state 'CorruptState'" in str(exc.value)

@pytest.mark.asyncio
async def test_transition_none_input():
    """Test transition with None/Empty input raises UnknownStateError"""
    service = SocService()
    
    with pytest.raises(UnknownStateError): # to_state is None
        await service.transition_incident("1", None, "user")
        
    with pytest.raises(UnknownStateError): # to_state is Empty
        await service.transition_incident("1", "   ", "user")

@pytest.mark.asyncio
async def test_transition_idempotent():
    """Test idempotent transition Triage -> Triage"""
    with patch('src.soc.service.SocRepository') as MockRepo:
        repo = MockRepo.return_value
        repo.get_incident = AsyncMock(return_value={"id": "1", "state": "Triage"})
        
        service = SocService()
        result = await service.transition_incident("1", "Triage", "user")
        
        assert result["status"] == "success"
        repo.transition_incident_state_with_audit.assert_not_called()

@pytest.mark.asyncio
async def test_transition_concurrency_failure():
    """Test that concurrent modification raises ConcurrentModificationError"""
    with patch('src.soc.service.SocRepository') as MockRepo:
        repo = MockRepo.return_value
        repo.get_incident = AsyncMock(return_value={"id": "1", "state": "New"})
        repo.transition_incident_state_with_audit = AsyncMock(return_value=False) # Update Failed
        
        service = SocService()
        
        with pytest.raises(ConcurrentModificationError):
            await service.transition_incident("1", "Triage", "user")
