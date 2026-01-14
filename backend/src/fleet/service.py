from datetime import datetime, timezone
from typing import Dict, Any, List
from src.fleet.repository import AssetRepository
from src.shared.event_bus import event_bus
import uuid

class FleetService:
    def __init__(self, repository: AssetRepository = None):
        self.repository = repository or AssetRepository()

    async def list_assets(self) -> List[Dict[str, Any]]:
        return await self.repository.get_all_assets()

    async def register_asset(self, asset_type: str, name: str) -> Dict[str, Any]:
        """
        Creates a new asset and emits event.
        """
        raw_id = str(uuid.uuid4())
        
        payload = {
            'id': raw_id,
            'type': asset_type,
            'name': name,
            'status': 'idle'
        }
        
        # Upsert
        db_id = await self.repository.upsert_asset(payload)
        
        # Publish
        await event_bus.publish(
             event_type="fleet.asset.created",
             source_context="fleet", 
             correlation_id=str(uuid.uuid4()),
             entity_refs={"assetId": raw_id},
             payload={"asset_id": raw_id, "name": name, "type": asset_type}
        )
        
        return {"id": raw_id, "db_id": db_id, "name": name, "asset_type": asset_type, "status": "idle", "last_heartbeat_utc": None}

    async def update_asset_status(self, asset_id: str, status: str) -> Dict[str, Any]:
        """
        Updates status, history, and emits event.
        """
        # Call new Repo method
        await self.repository.update_status_with_history(asset_id, status)
        
        # Publish
        await event_bus.publish(
            event_type="fleet.asset.status_changed",
            source_context="fleet",
            correlation_id=str(uuid.uuid4()),
            entity_refs={"assetId": asset_id},
            payload={"asset_id": asset_id, "status": status}
        )
        
        return {"status": status, "updated_at_utc": datetime.now(timezone.utc)}

    async def process_telemetry(self, event_type: str, payload: Dict[str, Any]):
        """
        Handles telemetry events from consumers.
        """
        # For now, just log or no-op as this seems to be for demo visualization/updates
        # The consumer expects this method to exist.
        pass
