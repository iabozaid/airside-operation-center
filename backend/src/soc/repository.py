from typing import List, Optional, Dict, Any
from src.infrastructure.database import db
import uuid

class SocRepository:
    """
    Persistence Adapter for SOC Context.
    Handles SQL for Incidents and Incident Transitions.
    Enforces deterministic UUID generation from strings to match system strategy.
    """

    def _generate_uuid_from_string(self, val: str) -> str:
        """
        Deterministic ID mapping helper.
        Matches system strategy: use as-is if valid UUID, else deterministic hash.
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

    async def get_incident(self, incident_id: str) -> Optional[Dict[str, Any]]:
        pool = await db.get_pool()
        
        # 1. Transform ID
        db_id = self._generate_uuid_from_string(incident_id)
        
        row = await pool.fetchrow("SELECT * FROM incidents WHERE id = $1", db_id)
        if not row:
            return None
            
        return self._serialize_row(row)

    async def list_incidents(self, limit: int = 50) -> List[Dict[str, Any]]:
        pool = await db.get_pool()
        rows = await pool.fetch("SELECT * FROM incidents ORDER BY created_at DESC LIMIT $1", limit)
        
        return [self._serialize_row(row) for row in rows]

    async def transition_incident_state_with_audit(
        self, incident_id: str, old_state: str, new_state: str, triggered_by: str
    ) -> bool:
        """
        Transactional state update + audit log.
        Atomic Compare-And-Swap (CAS) update for state.
        Returns True if successful, False if state changed underneath.
        """
        pool = await db.get_pool()
        
        # 1. Transform ID
        db_id = self._generate_uuid_from_string(incident_id)
        
        async with pool.acquire() as conn:
            async with conn.transaction():
                # 2. Atomic Update (CAS)
                # This update ensures we only transition if the state is what we expect (Concurrency Control)
                result = await conn.execute(
                    """
                    UPDATE incidents 
                    SET state = $1 
                    WHERE id = $2 AND state = $3
                    """,
                    new_state, db_id, old_state
                )
                
                # Check for "UPDATE 1" robustly
                if not result or not result.startswith("UPDATE"):
                     return False
                
                try:
                    count = int(result.split(" ")[1])
                except (IndexError, ValueError):
                    return False
                    
                if count != 1:
                    return False
                
                # 3. Insert Audit within the same transaction
                trans_id = str(uuid.uuid4())
                await conn.execute(
                    """
                    INSERT INTO incident_transitions (id, incident_id, from_state, to_state, triggered_by, occurred_at)
                    VALUES ($1, $2, $3, $4, $5, NOW())
                    """,
                    trans_id, db_id, old_state, new_state, triggered_by
                )
                
                return True
