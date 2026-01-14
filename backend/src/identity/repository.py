from typing import Dict, List, Optional, Any
from src.infrastructure.database import db
import uuid
import logging

logger = logging.getLogger(__name__)

class UserRepository:
    """
    Persistence Adapter for Identity Context.
    Handles Users, Roles, and UserRoles.
    """

    def _generate_uuid_from_string(self, val: str) -> str:
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

    async def get_user_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        pool = await db.get_pool()
        row = await pool.fetchrow(
            "SELECT * FROM users WHERE username = $1", 
            username
        )
        return self._serialize_row(row) if row else None

    async def get_user_with_roles(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Returns user dict with an added 'roles' list of strings.
        """
        pool = await db.get_pool()
        
        # Get User
        user_row = await pool.fetchrow("SELECT * FROM users WHERE id = $1", user_id)
        if not user_row:
            return None
            
        user = self._serialize_row(user_row)
        
        # Get Roles
        rows = await pool.fetch("""
            SELECT r.name 
            FROM roles r
            JOIN user_roles ur ON r.id = ur.role_id
            WHERE ur.user_id = $1
        """, user_id)
        
        user['roles'] = [r['name'] for r in rows]
        return user

    async def create_user(self, user_data: Dict[str, Any], roles: List[str]) -> str:
        """
        Creates user and assigns roles transactionally.
        """
        pool = await db.get_pool()
        
        user_id = user_data.get('id')
        if not user_id:
             user_id = str(uuid.uuid4())
             
        username = user_data['username']
        password_hash = user_data['password_hash']
        
        async with pool.acquire() as conn:
            async with conn.transaction():
                # 1. Insert User
                await conn.execute("""
                    INSERT INTO users (id, username, password_hash, is_active, created_at)
                    VALUES ($1, $2, $3, TRUE, NOW())
                """, user_id, username, password_hash)
                
                # 2. Assign Roles
                for role_name in roles:
                    # Role ID is deterministic based on name
                    role_id = self._generate_uuid_from_string(role_name)
                    
                    # Ensure Role Exists (Idempotent)
                    await conn.execute("""
                        INSERT INTO roles (id, name) VALUES ($1, $2)
                        ON CONFLICT (id) DO NOTHING
                    """, role_id, role_name)
                    
                    # Link
                    await conn.execute("""
                        INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)
                        ON CONFLICT (user_id, role_id) DO NOTHING
                    """, user_id, role_id)
                    
        return user_id

    async def list_users(self) -> List[Dict[str, Any]]:
        pool = await db.get_pool()
        rows = await pool.fetch("SELECT * FROM users")
        return [self._serialize_row(row) for row in rows]
