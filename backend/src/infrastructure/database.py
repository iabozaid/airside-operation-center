import asyncpg
from src.infrastructure.settings import settings
import asyncio
import os

class Database:
    _pool = None
    _loop_id: int = None

    @classmethod
    async def init_pool(cls):
        """
        Explicitly initialize the connection pool.
        Binds to the current running event loop.
        """
        # If pool exists, close it (safe cleanup)
        await cls.close()

        cls._pool = await asyncpg.create_pool(settings.DATABASE_URL)
        # Store ID of loop to detect cross-loop usage later
        try:
            loop = asyncio.get_running_loop()
            cls._loop_id = id(loop)
        except RuntimeError:
            cls._loop_id = None
        
        return cls._pool

    @classmethod
    async def get_pool(cls):
        # Validation: Check if pool belongs to current loop
        try:
            current_loop = asyncio.get_running_loop()
            current_loop_id = id(current_loop)
        except RuntimeError:
            current_loop_id = None

        # If pool exists but is bound to old loop or closed -> Reset
        if cls._pool:
             is_closed = False
             try:
                 is_closed = cls._pool.is_closed()
             except Exception:
                 is_closed = getattr(cls._pool, "_closed", False)

             if is_closed or (cls._loop_id and current_loop_id != cls._loop_id):
                  await cls.close() # Ensure full cleanup
                  cls._pool = None

        if cls._pool is None:
            # Lazy init
            cls._pool = await asyncpg.create_pool(settings.DATABASE_URL)
            cls._loop_id = current_loop_id
            
        return cls._pool

    @classmethod
    async def close(cls):
        if cls._pool:
            try:
                await cls._pool.close()
            except Exception:
                pass # Already closed or erroring
            cls._pool = None
            cls._loop_id = None

    @classmethod
    async def init_schema(cls):
        pool = await cls.get_pool()
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        schema_path = os.path.join(base_dir, "infrastructure", "schema.sql")
        
        try:
            with open(schema_path, "r") as f:
                schema_sql = f.read()
        except FileNotFoundError:
            print(f"[WARN] Schema file not found at {schema_path}. Skipping init.")
            return

        async with pool.acquire() as conn:
            # Strategy: check if 'users' table exists, if not, run schema.
            exists = await conn.fetchval("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users')")
            if not exists:
                await conn.execute(schema_sql)
                print("Schema initialized.")
            else:
                print("Schema already exists, skipping initialization.")

db = Database
