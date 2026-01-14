import asyncio
import os
import asyncpg
import redis.asyncio as redis
from redis.exceptions import ResponseError

# Default Credentials (can be overridden by Env Vars)
DB_DSN = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/postgres")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

SCHEMA_FILE = "schema.sql"

STREAMS = [
    "stream:events:global",
    "stream:events:simulation"
]

CONSUMER_GROUPS = [
    "cg:soc-core",
    "cg:read-models",
    "cg:audit",
    "cg:analytics",
    "cg:frontend-fanout"
]

async def init_db():
    print(f"Connecting to DB: {DB_DSN}")
    try:
        conn = await asyncpg.connect(DB_DSN)
    except Exception as e:
        print(f"Failed to connect to DB: {e}")
        return

    print("Applying schema...")
    with open(SCHEMA_FILE, "r") as f:
        schema_sql = f.read()

    try:
        await conn.execute(schema_sql)
        print("Schema applied successfully.")
    except Exception as e:
        print(f"Error applying schema: {e}")
    finally:
        await conn.close()

async def init_redis():
    print(f"Connecting to Redis: {REDIS_URL}")
    r = redis.from_url(REDIS_URL)
    
    for stream in STREAMS:
        for cg in CONSUMER_GROUPS:
            try:
                await r.xgroup_create(stream, cg, id="0", mkstream=True)
                print(f"Created Consumer Group '{cg}' on '{stream}'")
            except ResponseError as e:
                if "BUSYGROUP" in str(e):
                    print(f"Consumer Group '{cg}' already exists on '{stream}'")
                else:
                    print(f"Error creating CG '{cg}' on '{stream}': {e}")
    
    await r.aclose()

async def main():
    await init_db()
    await init_redis()

if __name__ == "__main__":
    asyncio.run(main())
