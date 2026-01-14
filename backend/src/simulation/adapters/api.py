from fastapi import APIRouter, HTTPException, BackgroundTasks
from src.shared.event_bus import event_bus
from src.simulation.scenarios import run_default_scenario, run_fleet_multi_incident
from src.infrastructure.demo import is_demo_mode
import uuid

router = APIRouter(tags=["Simulation"])

@router.post("/simulation/start")
async def start_simulation(background_tasks: BackgroundTasks):
    """
    Triggers the Default Demo Scenario.
    Safe in Demo Mode (Uses In-Memory EventBus).
    """
    # Demo Mode Check (Informational/Future-Proofing)
    if is_demo_mode():
        pass 

    scenario_run_id = str(uuid.uuid4())
    background_tasks.add_task(run_default_scenario, event_bus, scenario_run_id)
    return {
        "status": "started", 
        "message": "Default scenario injected (3 fleet signals + baseline assets)",
        "scenario_id": "default",
        "scenario_run_id": scenario_run_id
    }

@router.post("/simulation/scenario/{scenario_id}")
async def run_scenario(scenario_id: str, background_tasks: BackgroundTasks):
    """
    Run a specific simulation scenario by ID.
    IDs: default, fleet_multi_incident
    """
    scenario_run_id = str(uuid.uuid4())
    
    if scenario_id == "default":
        background_tasks.add_task(run_default_scenario, event_bus, scenario_run_id)
        return {
            "status": "started", 
            "message": "Scenario started",
            "scenario_id": scenario_id, 
            "scenario_run_id": scenario_run_id
        }
        
    if scenario_id == "fleet_multi_incident":
        background_tasks.add_task(run_fleet_multi_incident, event_bus, scenario_run_id)
        return {
            "status": "started", 
            "message": "Scenario started",
            "scenario_id": scenario_id, 
            "scenario_run_id": scenario_run_id
        }
    
    if scenario_id == "robot_bag_tamper":
        # Placeholder for Sprint 2
        return {
            "status": "skipped", 
            "message": "Scenario not implemented yet", 
            "scenario_id": scenario_id,
            "scenario_run_id": None
        }
        
    raise HTTPException(status_code=404, detail="Scenario not found")

@router.post("/simulation/stop")
async def stop_simulation():
    # MVP: Cannot cancel running tasks easily without task tracking structure.
    return {"status": "noop", "message": "MVP: cannot cancel running tasks"}
