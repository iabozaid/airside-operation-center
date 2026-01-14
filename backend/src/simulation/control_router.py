from fastapi import APIRouter, HTTPException, BackgroundTasks
from src.shared.event_bus import event_bus
from src.simulation.scenarios import run_default_scenario
import uuid
import datetime

router = APIRouter(prefix="/simulation", tags=["Simulation Control"])

# -----------------------------------------------------------------------------
# Fleet Subsystem
# -----------------------------------------------------------------------------

@router.post("/fleet/{action}")
async def trigger_fleet_action(action: str, background_tasks: BackgroundTasks):
    """
    Fleet Actions: default, overspeed, geofence
    """
    scenario_run_id = str(uuid.uuid4())
    
    if action == "default":
        # Calls existing scenario logic in background
        background_tasks.add_task(run_default_scenario, event_bus, scenario_run_id)
        return {"status": "triggered", "action": "default", "run_id": scenario_run_id}

    elif action == "overspeed":
        # Manual Trigger: Overspeed
        correlation_id = str(uuid.uuid4())
        timestamp = datetime.datetime.utcnow().isoformat()
        
        common_payload = {
            "vehicleId": "VEH-202",
            "driverName": "Sara",
            "zoneId": "APRON_TRANSFER_ZONE",
            "location": {"x": 560, "y": 340},
            "timestamp": timestamp,
            "evidenceRefs": {
                "internalDashcamUrl": "/assets/video/internal_speed.mp4",
                "externalDashcamUrl": "/assets/video/external_speed.mp4"
            }
        }
        
        # NOTE: fleet.* events are canonical for backend/analytics; OPS UI relies on incident.created in MVP.
        
        # 1. Publish Fleet Event (Canonical)
        await event_bus.publish(
            event_type="fleet.overspeed_detected",
            source_context="simulation",
            correlation_id=correlation_id,
            entity_refs={"scenarioRunId": scenario_run_id},
            payload=common_payload
        )
        
        # 2. Publish Incident Event (Ops Feed Visibility)
        incident_id = str(uuid.uuid4())
        incident_payload = {
            "id": incident_id,
            "type": "FLEET_OVERSPEED",
            "severity": "warning",
            "state": "New",
            "correlation_id": correlation_id,
            **common_payload
        }
        
        await event_bus.publish(
            event_type="incident.created",
            source_context="simulation",
            correlation_id=correlation_id,
            entity_refs={"scenarioRunId": scenario_run_id},
            payload=incident_payload
        )
        
        return {
            "status": "triggered", 
            "action": "overspeed", 
            "incident_id": incident_id,
            "run_id": scenario_run_id
        }

    elif action == "geofence":
        # Manual Trigger: Geofence Breach
        correlation_id = str(uuid.uuid4())
        timestamp = datetime.datetime.utcnow().isoformat()
        
        common_payload = {
            "vehicleId": "VEH-101",
            "driverName": "Ahmed",
            "zoneId": "AIRSIDE_PERIMETER",
            "location": {"x": 220, "y": 210},
            "timestamp": timestamp,
            "evidenceRefs": {
                "internalDashcamUrl": "/assets/video/internal_geofence.mp4",
                "externalDashcamUrl": "/assets/video/external_geofence.mp4"
            }
        }

        # NOTE: fleet.* events are canonical for backend/analytics; OPS UI relies on incident.created in MVP.
        
        # 1. Publish Fleet Event (Canonical)
        await event_bus.publish(
            event_type="fleet.geofence_breached",
            source_context="simulation",
            correlation_id=correlation_id,
            entity_refs={"scenarioRunId": scenario_run_id},
            payload=common_payload
        )

        # 2. Publish Incident Event (Ops Feed Visibility)
        incident_id = str(uuid.uuid4())
        incident_payload = {
            "id": incident_id,
            "type": "GEOFENCE_BREACH",
            "severity": "critical",
            "state": "New",
            "correlation_id": correlation_id,
            **common_payload
        }
        
        await event_bus.publish(
            event_type="incident.created",
            source_context="simulation",
            correlation_id=correlation_id,
            entity_refs={"scenarioRunId": scenario_run_id},
            payload=incident_payload
        )
        return {
            "status": "triggered", 
            "action": "geofence", 
            "incident_id": incident_id,
            "run_id": scenario_run_id
        }

    else:
        raise HTTPException(status_code=404, detail=f"Fleet action '{action}' not found")

# -----------------------------------------------------------------------------
# Robot Subsystem
# -----------------------------------------------------------------------------

@router.post("/robot/{action}")
async def trigger_robot_action(action: str):
    """
    Robot Actions: patrol
    """
    scenario_run_id = str(uuid.uuid4())

    if action == "patrol":
        # Robot Patrol Start
        correlation_id = str(uuid.uuid4())
        payload = {
             "robotId": "ROB-01",
             "zoneId": "APRON_TRANSFER_ZONE",
             "timestamp": datetime.datetime.utcnow().isoformat(),
             "correlation_id": correlation_id,
             "evidenceRefs": {
                 "robotCamUrl": "/assets/video/robot_patrol.mp4"
             }
        }

        await event_bus.publish(
            event_type="fleet.robot_patrol_started",
            source_context="simulation",
            correlation_id=correlation_id,
            entity_refs={"scenarioRunId": scenario_run_id},
            payload=payload
        )
        return {"status": "triggered", "action": "patrol", "robot_id": "ROB-01", "run_id": scenario_run_id}
    
    else:
        raise HTTPException(status_code=404, detail=f"Robot action '{action}' not found")

# -----------------------------------------------------------------------------
# Visitor Subsystem (Placeholder)
# -----------------------------------------------------------------------------

@router.post("/visitor/{action}")
async def trigger_visitor_action(action: str):
    return {
        "status": "skipped",
        "placeholder": True,
        "reason": "Not implemented yet",
        "subsystem": "visitor",
        "action": action
    }

# -----------------------------------------------------------------------------
# Baggage Subsystem (Placeholder)
# -----------------------------------------------------------------------------

@router.post("/baggage/{action}")
async def trigger_baggage_action(action: str):
    return {
        "status": "skipped",
        "placeholder": True,
        "reason": "Not implemented yet",
        "subsystem": "baggage",
        "action": action
    }
