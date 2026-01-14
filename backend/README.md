# ATSS Matarat Backend (Demo)

## Overview
This is the backend service for the ATSS Matarat Integrated Airport Operations demo. It provides a Hexagonal Architecture based API with event sourcing capabilities (Redis Streams) and a fallback In-Memory Demo Mode.

## Run Instructions

### Prerequisites
- Python 3.11+
- Redis (Optional, required for full production mode)

### Local Development (Demo Mode)
To run the backend without Redis (e.g., for frontend integration):

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Set Environment Variables (PowerShell)
$env:DEMO_NO_REDIS="true"
$env:CORS_ORIGINS='["http://localhost:3000", "http://localhost:5173"]'

# 3. Run Server
uvicorn src.main:app --reload --port 8000
```

### Production Mode
Ensure `REDIS_URL` is set and `DEMO_NO_REDIS` is unset or false.

## API Integration Guide

### API Contract
- The authoritative API contract is located at: `docs/openapi.snapshot.json`.
- **Workflow**: When endpoints change, run `python scripts/freeze_api.py` to regenerate the snapshot.

### Events API (SSE + Polling)

#### 1. Real-time Stream (SSE)
- **Endpoint**: `GET /stream/ops`
- **Behavior**:
    - **Events**: JSON data formatted as Server-Sent Events.
    - **Heartbeat**: In `DEMO_NO_REDIS` mode, a `{ "timestamp": "...", "mode": "demo" }` event is emitted every ~2 seconds to keep connections alive.
    - **Replay**: Support resuming via `Last-Event-ID` header or `?since=` query param.

#### 2. Polling Fallback
- **Endpoint**: `GET /events`
- **Params**:
    - `since` (optional): Opaque cursor string.
    - `limit` (optional): Max events to return (default 50).
- **Response**:
  ```json
  {
    "items": [ ... ],
    "next_cursor": "string"
  }
  ```
- **Cursors**:
    - Demo Mode: `demo:<index>` (e.g., `demo:10`).
    - Redis Mode: `redis:<stream_id>` (e.g., `redis:16789000000-0`).
    - **Note**: Frontend should treat cursors as opaque strings.

### Error Handling
Errors follow a standardized JSON envelope:
```json
{
  "error": {
    "code": "VALIDATION_ERROR | HTTP_ERROR | INTERNAL_ERROR",
    "message": "Human readable message",
    "details": [ ... ] 
  }
}
```

## Observability
- **X-Request-Id**:
    - Accepted from `X-Request-Id` request header.
    - Generated if missing.
    - Included in response headers and logs.
