import asyncio
import uuid
import datetime

# Canonical Zone IDs
ZONE_AIRSIDE = "AIRSIDE_PERIMETER"
ZONE_APRON = "APRON_TRANSFER_ZONE"
ZONE_LANDSIDE = "LANDSIDE_ACCESS_ROAD"

# Deterministic IDs
VEHICLE_1 = "VEH-101"
VEHICLE_2 = "VEH-202"
VEHICLE_3 = "VEH-303"
ROBOT_1 = "ROB-01"

async def run_default_scenario(event_bus, scenario_run_id):
    """
    Executes the Default Demo Scenario:
    1. Sets baseline asset states (3 Vehicles, 1 Robot)
    2. Triggers 3 distinct Fleet Incidents over 1-2 seconds
    """
    await _execute_fleet_scenario(event_bus, scenario_run_id)

async def run_fleet_multi_incident(event_bus, scenario_run_id):
    await _execute_fleet_scenario(event_bus, scenario_run_id)

async def _execute_fleet_scenario(event_bus, scenario_run_id):
    # 1. Baseline Asset States
    # Robot: OUT_OF_SERVICE_CHARGING (Apron)
    # x/y coordinates are roughly placed within the visual zones
    await publish_asset_status(
        event_bus, ROBOT_1, "ROBOT", "OUT_OF_SERVICE_CHARGING", 
        ZONE_APRON, x=500, y=300, 
        scenario_run_id=scenario_run_id
    )
    
    # Vehicle 1: IN_SERVICE (Airside)
    await publish_asset_status(
        event_bus, VEHICLE_1, "VEHICLE", "IN_SERVICE", 
        ZONE_AIRSIDE, driver="Ahmed", x=200, y=200, 
        scenario_run_id=scenario_run_id
    )
    
    # Vehicle 2: IN_SERVICE (Apron)
    await publish_asset_status(
        event_bus, VEHICLE_2, "VEHICLE", "IN_SERVICE", 
        ZONE_APRON, driver="Sara", x=550, y=350, 
        scenario_run_id=scenario_run_id
    )
    
    # Vehicle 3: IN_SERVICE (Landside)
    await publish_asset_status(
        event_bus, VEHICLE_3, "VEHICLE", "IN_SERVICE", 
        ZONE_LANDSIDE, driver="Khalid", x=400, y=475, 
        scenario_run_id=scenario_run_id
    )

    # 1.1 Emit Robot Evidence Reference (Signal for RobotFeed)
    await publish_robot_evidence(event_bus, ROBOT_1, ZONE_APRON, scenario_run_id)

    await asyncio.sleep(1)

    # 2. Trigger Incidents
    
    # Incident A: Geofence Breach (VEH-101)
    await publish_fleet_event(
        event_bus, 
        event_type="fleet.geofence_breached",
        asset_id=VEHICLE_1,
        driver="Ahmed",
        zone=ZONE_AIRSIDE,
        x=220, y=210,
        evidence_key="geofence",
        scenario_run_id=scenario_run_id
    )
    
    await asyncio.sleep(0.5)

    # Incident B: Overspeed (VEH-202)
    await publish_fleet_event(
        event_bus,
        event_type="fleet.overspeed_detected",
        asset_id=VEHICLE_2,
        driver="Sara",
        zone=ZONE_APRON,
        x=560, y=340,
        evidence_key="speed",
        scenario_run_id=scenario_run_id
    )
    
    await asyncio.sleep(0.8)
    
    # Incident C: Collision (VEH-303)
    await publish_fleet_event(
        event_bus,
        event_type="fleet.collision_detected",
        asset_id=VEHICLE_3,
        driver="Khalid",
        zone=ZONE_LANDSIDE,
        x=410, y=480,
        evidence_key="collision",
        scenario_run_id=scenario_run_id
    )

async def publish_asset_status(event_bus, asset_id, asset_type, status, zone, x, y, driver=None, scenario_run_id=None):
    payload = {
         "assetId": asset_id,
         "assetType": asset_type,
         "status": status,
         "zoneId": zone,
         "timestamp": datetime.datetime.utcnow().isoformat(),
         "location": {"x": x, "y": y}, 
    }
    if driver:
        payload["driverName"] = driver
        
    await event_bus.publish(
        event_type="fleet.asset_status_changed", 
        source_context="simulation",
        correlation_id=str(uuid.uuid4()), 
        entity_refs={"scenarioRunId": scenario_run_id},
        payload=payload
    )

async def publish_robot_evidence(event_bus, robot_id, zone, scenario_run_id):
    await event_bus.publish(
        event_type="fleet.robot_patrol_started",
        source_context="simulation",
        correlation_id=str(uuid.uuid4()),
        entity_refs={"scenarioRunId": scenario_run_id},
        payload={
             "robotId": robot_id,
             "zoneId": zone,
             "evidenceRefs": {
                 "robotCamUrl": "/assets/video/robot_patrol.mp4"
             }
        }
    )

async def publish_fleet_event(event_bus, event_type, asset_id, driver, zone, x, y, evidence_key, scenario_run_id):
    correlation_id = str(uuid.uuid4())
    
    evidence = {
        "internalDashcamUrl": f"/assets/video/internal_{evidence_key}.mp4",
        "externalDashcamUrl": f"/assets/video/external_{evidence_key}.mp4",
        "backendEventLogRef": f"LOG-{uuid.uuid4().hex[:8].upper()}"
    }

    payload = {
        "vehicleId": asset_id,
        "driverName": driver,
        "zoneId": zone,
        "location": {"x": x, "y": y},
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "evidenceRefs": evidence
    }
    
    await event_bus.publish(
        event_type=event_type,
        source_context="simulation",
        correlation_id=correlation_id,
        entity_refs={"scenarioRunId": scenario_run_id},
        payload=payload
    )
