from typing import List, Optional, Dict, Any
from src.infrastructure.database import db
import uuid
import datetime

class AssetRepository:
    """
    Persistence Adapter for Fleet Context.
    Handles SQL for Assets and Asset Status History.
    """

    def _generate_uuid_from_string(self, val: str) -> str:
        """
        Deterministic ID mapping helper.
        """
        try:
            return str(uuid.UUID(str(val)))
        except (ValueError, TypeError):
            return str(uuid.uuid5(uuid.NAMESPACE_DNS, str(val)))

    def _serialize_row(self, row: Any) -> Dict[str, Any]:
        """Convert asyncpg Row to dict and stringify UUIDs."""
        record = dict(row)
        for key, val in record.items():
            if isinstance(val, uuid.UUID):
                record[key] = str(val)
        return record

    async def upsert_asset(self, asset_data: Dict[str, Any]) -> str:
        """
        Inserts or Updates an asset.
        """
        pool = await db.get_pool()
        
        # Mapping
        # Input might act as a DTO, expect 'id' (public)
        raw_id = str(asset_data.get('id', ''))
        db_id = self._generate_uuid_from_string(raw_id)
        
        asset_type = asset_data.get('type', 'Unknown')
        name = asset_data.get('name', raw_id)
        status = asset_data.get('status', 'Unknown')
        
        await pool.execute(
            """
            INSERT INTO assets (id, asset_type, name, status, last_heartbeat, created_at)
            VALUES ($1, $2, $3, $4, NOW(), NOW())
            ON CONFLICT (id) DO UPDATE
            SET status = EXCLUDED.status,
                last_heartbeat = NOW(),
                name = EXCLUDED.name
            """,
            db_id, asset_type, name, status
        )
        return db_id

    async def update_heartbeat(self, asset_id: str, status: Optional[str] = None) -> None:
        """
        Lightweight heartbeat update.
        """
        pool = await db.get_pool()
        db_id = self._generate_uuid_from_string(asset_id)
        
        if status:
             await pool.execute(
                "UPDATE assets SET last_heartbeat = NOW(), status = $1 WHERE id = $2",
                status, db_id
             )
        else:
             await pool.execute(
                "UPDATE assets SET last_heartbeat = NOW() WHERE id = $1",
                db_id
             )

    async def get_asset(self, asset_id: str) -> Optional[Dict[str, Any]]:
        pool = await db.get_pool()
        db_id = self._generate_uuid_from_string(asset_id)
        row = await pool.fetchrow("SELECT * FROM assets WHERE id = $1", db_id)
        return self._serialize_row(row) if row else None
        
    async def get_all_assets(self) -> List[Dict[str, Any]]:
         pool = await db.get_pool()
         rows = await pool.fetch("SELECT * FROM assets")
         return [self._serialize_row(row) for row in rows]
    async def update_status_with_history(self, asset_id: str, status: str) -> None:
        """
        Updates status and logs history.
        """
        pool = await db.get_pool()
        db_id = self._generate_uuid_from_string(asset_id)
        
        # 1. Update Asset
        await pool.execute(
            "UPDATE assets SET status = $1, last_heartbeat = NOW() WHERE id = $2",
            status, db_id
        )
        
        # 2. Insert History
        hist_id = str(uuid.uuid4())
        await pool.execute(
            """
            INSERT INTO asset_status_history (id, asset_id, status, occurred_at)
            VALUES ($1, $2, $3, NOW())
            """,
            hist_id, db_id, status
        )
