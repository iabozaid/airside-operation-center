from fastapi import APIRouter, Depends, HTTPException
from typing import List
from src.fleet.service import FleetService
from src.fleet.schemas import AssetResponse, AssetCreateRequest, AssetStatusUpdateRequest, AssetStatusUpdateResponse
from src.infrastructure.demo import is_demo_mode
import random
from datetime import datetime, timezone

router = APIRouter(tags=["Fleet"])

def get_fleet_service():
    return FleetService()

@router.get("/fleet/assets", response_model=List[AssetResponse])
async def get_assets(service: FleetService = Depends(get_fleet_service)):
    # 1. Demo Mode Gate
    if is_demo_mode():
        now = datetime.now(timezone.utc)
        base_lat, base_lng = 24.9633, 46.6977
        
        mock_assets = [
            {"id": "vh-001", "name": "Patrol Alpha", "type": "patrol", "status": "active", "driver": "Officer John", "speed": 45},
            {"id": "vh-002", "name": "Patrol Bravo", "type": "patrol", "status": "idle", "driver": "Officer Sarah", "speed": 0},
            {"id": "vh-003", "name": "Bus T1-T2", "type": "bus", "status": "moving", "driver": "Driver Ahmed", "speed": 30},
            {"id": "vh-004", "name": "Fuel Truck 09", "type": "truck", "status": "active", "driver": "Tech Mike", "speed": 12},
            {"id": "vh-005", "name": "Maint Crew 1", "type": "maintenance", "status": "repair", "driver": "Lead Engineer", "speed": 0},
            {"id": "vh-006", "name": "Follow Me 03", "type": "follow_me", "status": "active", "driver": "Ops Control", "speed": 60},
        ]
        
        results = []
        for m in mock_assets:
            results.append(AssetResponse(
                id=m["id"],
                asset_type=m["type"],
                name=m["name"],
                status=m["status"],
                last_heartbeat_utc=now,
                driver=m["driver"],
                speed_kmh=m["speed"],
                stream_url=f"/streams/{m['id']}/front_cam",
                location={
                    "lat": base_lat + (random.random() - 0.5) * 0.015,
                    "lng": base_lng + (random.random() - 0.5) * 0.015
                }
            ))
        return results

    # 2. Real Production Logic
    return await service.list_assets()

@router.post("/fleet/assets", response_model=AssetResponse)
async def create_asset(
    asset: AssetCreateRequest, 
    service: FleetService = Depends(get_fleet_service)
):
    if is_demo_mode():
        # Mock Success
        return AssetResponse(
            id=f"vh-{random.randint(100, 999)}",
            asset_type=asset.asset_type,
            name=asset.name,
            status="active",
            last_heartbeat_utc=datetime.now(timezone.utc)
        )

    result = await service.register_asset(asset_type=asset.asset_type, name=asset.name)
    return AssetResponse(
        id=result['id'],
        asset_type=result['asset_type'],
        name=result['name'],
        status=result['status'],
        last_heartbeat_utc=result.get('last_heartbeat_utc')
    )

@router.patch("/fleet/assets/{id}/status", response_model=AssetStatusUpdateResponse)
async def update_asset_status(
    id: str, 
    update: AssetStatusUpdateRequest,
    service: FleetService = Depends(get_fleet_service)
):
    if is_demo_mode():
        return AssetStatusUpdateResponse(
            status=update.status,
            updated_at_utc=datetime.now(timezone.utc)
        )

    result = await service.update_asset_status(id, update.status)
    return AssetStatusUpdateResponse(
        status=result['status'],
        updated_at_utc=result['updated_at_utc']
    )
