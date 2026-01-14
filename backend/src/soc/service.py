from typing import Dict, List, Optional
from src.soc.repository import SocRepository
from src.shared.event_bus import event_bus
import uuid

class SocServiceError(Exception):
    """Base exception for SOC Service"""
    pass

class IncidentNotFoundError(SocServiceError):
    def __init__(self, incident_id: str):
        super().__init__(f"Incident {incident_id} not found")

class UnknownStateError(SocServiceError):
    def __init__(self, state: str):
        super().__init__(f"Unknown incident state '{state}'")

class InvalidTransitionError(SocServiceError):
    def __init__(self, from_state: str, to_state: str, allowed: List[str]):
        super().__init__(f"Invalid transition from '{from_state}' to '{to_state}'. Allowed: {allowed}")

class ConcurrentModificationError(SocServiceError):
    def __init__(self, incident_id: str):
        super().__init__(f"Concurrent modification detected for incident {incident_id}. Please retry.")

class SocService:
    """
    Domain Service for SOC Context.
    Enforces State Machine rules and Business Logic.
    """
    
    def __init__(self):
        self.repository = SocRepository()
        
        # Defined Strict Transitions
        self.VALID_TRANSITIONS = {
            "New": ["Triage", "Escalated"],
            "Triage": ["EvidenceAttached", "Escalated"],
            "EvidenceAttached": ["Dispatched", "Escalated"],
            "Dispatched": ["Resolved", "Escalated"],
            "Resolved": ["Closed", "Escalated"],
            "Closed": [], # Terminal State
            "Escalated": ["Resolved"] # Return from escalation
        }

    async def get_incident(self, incident_id: str) -> Optional[Dict]:
        return await self.repository.get_incident(incident_id)

    async def list_incidents(self) -> List[Dict]:
        return await self.repository.list_incidents()

    async def transition_incident(self, incident_id: str, to_state: str, triggered_by: str) -> Dict:
        """
        Attempts to transition an incident to a new state.
        Validates rules, updates DB, emits event.
        """
        # Normalize input
        to_state = (to_state or "").strip()
        
        # 1. Validate Target State Existence
        if not to_state or to_state not in self.VALID_TRANSITIONS:
            raise UnknownStateError(to_state)
        
        # 2. Fetch current state
        incident = await self.repository.get_incident(incident_id)
        if not incident:
            raise IncidentNotFoundError(incident_id)
            
        current_state = (incident.get("state") or "").strip()
        
        # Validate Current State Existence (Robustness)
        if not current_state or current_state not in self.VALID_TRANSITIONS:
            raise UnknownStateError(current_state)
        
        # Idempotency: if already in target state, success with no side effects
        if to_state == current_state:
            return {"status": "success", "new_state": to_state, "idempotent": True}
        
        # 3. Validate Transition Logic
        allowed_next_states = self.VALID_TRANSITIONS.get(current_state, [])
        if to_state not in allowed_next_states:
            raise InvalidTransitionError(current_state, to_state, allowed_next_states)

        # 4. Persistence (Transactional Atomic CAS + Audit)
        success = await self.repository.transition_incident_state_with_audit(
            incident_id, current_state, to_state, triggered_by
        )
        
        if not success:
            raise ConcurrentModificationError(incident_id)

        # 5. Emit Event
        # Correlation ID robustness
        db_correlation_id = incident.get('correlation_id')
        if isinstance(db_correlation_id, str) and db_correlation_id and db_correlation_id != "None":
            correlation_id = db_correlation_id
        else:
            correlation_id = str(uuid.uuid4())
        
        # TODO: If to_state == "Escalated", create Ticket here.
        
        await event_bus.publish(
            event_type="incident.state_changed",
            source_context="soc",
            correlation_id=correlation_id,
            entity_refs={"incidentId": incident_id},
            payload={
                "incident_id": incident_id,
                "from_state": current_state,
                "to_state": to_state,
                "triggered_by": triggered_by
            }
        )
        
        return {"status": "success", "new_state": to_state}
