from httpx import AsyncClient, ASGITransport
from src.main import app
import asyncio
import traceback

async def main():
    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            print("Success")
    except Exception:
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
