import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch
from src.shared.consumers import consumer_manager, normalize_message, generate_uuid_from_string

def test_normalize_message_bytes():
    # Test Redis-like bytes structure
    raw = {
        b"event_type": b"test.event",
        b"payload": b'{"key": "value"}',
        b"entity_refs": b'{"ref": 1}',
        b"other": b"ignored_json"
    }
    normalized = normalize_message(raw)
    assert normalized["event_type"] == "test.event"
    assert normalized["payload"] == {"key": "value"}
    assert normalized["entity_refs"] == {"ref": 1}
    assert normalized["other"] == "ignored_json" # Should NOT be json loaded

def test_normalize_message_strings():
    raw = {
        "event_type": "test.event",
        "payload": '{"key": "value"}'
    }
    normalized = normalize_message(raw)
    assert normalized["payload"] == {"key": "value"}

@pytest.mark.asyncio
async def test_process_event_missing_incident_id_raises():
    mock_pool = AsyncMock()
    with patch("src.infrastructure.database.db.get_pool", return_value=mock_pool):
        event = {
            "event_type": "incident.created",
            "payload": {"type": "TEST"} # No ID
        }
        # Should raise ValueError, preventing ACK
        with pytest.raises(ValueError) as exc:
            await consumer_manager.process_event(event)
        assert "Missing ID" in str(exc.value)

@pytest.mark.asyncio
async def test_process_event_missing_state_raises():
    mock_pool = AsyncMock()
    with patch("src.infrastructure.database.db.get_pool", return_value=mock_pool):
        event = {
            "event_type": "incident.state_changed",
            "payload": {"id": "123"} # No State
        }
        with pytest.raises(ValueError):
            await consumer_manager.process_event(event)

@pytest.mark.asyncio
async def test_process_event_missing_asset_id_raises():
    mock_pool = AsyncMock()
    with patch("src.infrastructure.database.db.get_pool", return_value=mock_pool):
        event = {
            "event_type": "fleet.asset_status_changed",
            "payload": {"status": "OK"}
        }
        # FleetService logs warning and returns (ACKs message as poison pill)
        # Should NOT raise ValueError
        await consumer_manager.process_event(event)
        # Assert no DB call (mock_pool matches patch return)
        mock_pool.execute.assert_not_called()

@pytest.mark.asyncio
async def test_process_event_fleet_status():
    """Test fleet status update delegated to FleetService"""
    
    # Mock the FleetService instance on the logic
    mock_service = AsyncMock()
    
    with patch.object(consumer_manager, 'fleet_service', mock_service), \
         patch("src.infrastructure.database.db.get_pool") as mock_pool:
        payload = {
            "assetId": "V-001",
            "status": "active",
            "location": {"lat": 24.0, "lon": 46.0}
        }
        
        await consumer_manager.process_event({
            "event_type": "fleet.asset_status_changed",
            "payload": payload
        })
        
        # Verify delegation
        mock_service.process_telemetry.assert_called_once()
        args, _ = mock_service.process_telemetry.call_args
        assert args[0] == "fleet.asset_status_changed"
        assert args[1]['assetId'] == "V-001"
