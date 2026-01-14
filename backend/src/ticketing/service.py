from typing import Dict, List, Optional, Any
from src.ticketing.repository import TicketRepository
from src.shared.event_bus import event_bus
import uuid
import datetime

class TicketServiceError(Exception):
    """Base exception for Ticket Service"""
    pass

class TicketNotFoundError(TicketServiceError):
    def __init__(self, ticket_id: str):
        super().__init__(f"Ticket {ticket_id} not found")

class UnknownStateError(TicketServiceError):
    def __init__(self, state: str):
        super().__init__(f"Unknown ticket state '{state}'")

class InvalidTransitionError(TicketServiceError):
    def __init__(self, from_state: str, to_state: str, allowed: List[str]):
        super().__init__(f"Invalid transition from '{from_state}' to '{to_state}'. Allowed: {allowed}")

class ConcurrentModificationError(TicketServiceError):
    def __init__(self, ticket_id: str):
        super().__init__(f"Concurrent modification detected for ticket {ticket_id}. Please retry.")

class InvalidArgumentError(TicketServiceError):
    def __init__(self, message: str):
        super().__init__(message)

class TicketService:
    """
    Domain Service for Ticketing Context.
    Manages SLAs, Escalations provided by SOC, and Assignments.
    """
    
    def __init__(self, repository: Optional[TicketRepository] = None, bus: Any = None):
        """
        Dependency Injection for testability.
        """
        self.repository = repository or TicketRepository()
        self.bus = bus or event_bus
        
        # SLA Policy (Hours)
        self.SLA_POLICY = {
            "critical": 4,
            "warning": 24,
            "info": 72
        }
        
        # Strict Transitions
        self.VALID_TRANSITIONS = {
            "Open": ["InProgress"],
            "InProgress": ["Resolved"],
            "Resolved": ["Closed"],
            "Closed": [] 
        }

    def _generate_uuid_from_string(self, val: str) -> str:
        """
        Deterministic ID mapping helper.
        Matches system strategy: use as-is if valid UUID, else deterministic hash.
        Used here to ensure we pass aligned UUID strings to repository/events if needed.
        """
        try:
            return str(uuid.UUID(str(val)))
        except (ValueError, TypeError):
            return str(uuid.uuid5(uuid.NAMESPACE_DNS, str(val)))

    async def create_ticket_from_incident(self, incident: Dict, correlation_id: str) -> Dict:
        """
        Idempotent creation of a ticket from an incident.
        """
        # 1. Public vs DB IDs
        incident_public_id = str(incident.get('id', '')).strip()
        if not incident_public_id:
             raise TicketServiceError("Incident ID missing")
        
        # Map to DB UUID
        incident_db_id = self._generate_uuid_from_string(incident_public_id)

        # 2. Correlation ID Selection
        correlation_id = (correlation_id or "").strip()
        if not correlation_id:
            # Fallback to incident correlation
            inc_corr = incident.get('correlation_id')
            if inc_corr and isinstance(inc_corr, str) and inc_corr.strip():
                correlation_id = inc_corr.strip()
            else:
                correlation_id = str(uuid.uuid4())

        # 3. Idempotency Check (using DB ID)
        existing_ticket = await self.repository.get_by_incident_id(incident_db_id)
        if existing_ticket:
            t_id = str(existing_ticket['id'])
            return {
                "status": "exists", 
                "ticket_id": t_id, 
                "incident_id": incident_public_id,
                "incident_db_id": incident_db_id,
                "idempotent": True
            }
        
        # 4. SLA Calculation (Timezone Aware)
        # Default severity to 'info' if missing
        severity = str(incident.get('severity', 'info')).lower()
        if severity not in self.SLA_POLICY:
             severity = 'info' 
             
        hours = self.SLA_POLICY[severity]
        now_utc = datetime.datetime.now(datetime.timezone.utc)
        deadline = now_utc + datetime.timedelta(hours=hours)
        
        # 5. Create Ticket
        ticket_id = str(uuid.uuid4())
        ticket_data = {
            "id": ticket_id,
            "incident_id": incident_db_id, # Store DB UUID
            "status": "Open",
            "sla_deadline": deadline,
            # 'created_at' omitted to rely on DB default
            # 'severity_snapshot' omitted as column likely missing in DB schema
        }
        
        await self.repository.create_ticket(ticket_data)
        
        # 6. Emit Event
        # entity_refs.incidentId is correct here because we HAVE the public ID.
        await self.bus.publish(
            event_type="ticket.created",
            source_context="ticketing",
            correlation_id=correlation_id,
            entity_refs={
                "ticketId": ticket_id, 
                "incidentId": incident_public_id,
                "incidentDbId": incident_db_id
            },
            payload={
                "ticket_id": ticket_id,
                "incident_id": incident_public_id,
                "incident_db_id": incident_db_id,
                "severity_snapshot": severity,
                "sla_deadline": deadline.isoformat(),
                "status": "Open"
            }
        )
        
        return {
            "status": "created", 
            "ticket_id": ticket_id, 
            "incident_id": incident_public_id,
            "incident_db_id": incident_db_id
        }
        
    async def get_ticket(self, ticket_id: str) -> Dict:
        ticket = await self.repository.get_ticket(ticket_id)
        if not ticket:
            raise TicketNotFoundError(ticket_id)
        return ticket
        
    async def transition_ticket(self, ticket_id: str, to_state: str, user_id: str, correlation_id: str) -> Dict:
        to_state = (to_state or "").strip()
        user_id = (user_id or "").strip()
        correlation_id = (correlation_id or "").strip()
        if not correlation_id:
            correlation_id = str(uuid.uuid4())
            
        # Validate Input
        if not user_id:
             raise InvalidArgumentError("user_id required for transition")
             
        # Validate Target State Existence
        if not to_state or to_state not in self.VALID_TRANSITIONS:
             raise UnknownStateError(to_state)
        
        ticket = await self.repository.get_ticket(ticket_id)
        if not ticket:
            raise TicketNotFoundError(ticket_id)
            
        current_state = ticket.get("status", "").strip()
        
        # Validate Current State Integrity
        if not current_state or current_state not in self.VALID_TRANSITIONS:
             raise UnknownStateError(current_state)
        
        # Idempotency
        if current_state == to_state:
             return {"status": "idempotent", "new_state": to_state}
             
        allowed = self.VALID_TRANSITIONS.get(current_state, [])
        if to_state not in allowed:
            raise InvalidTransitionError(current_state, to_state, allowed)
            
        success = await self.repository.transition_ticket_state_with_audit(ticket_id, current_state, to_state, user_id)
        if not success:
            raise ConcurrentModificationError(ticket_id)
        
        # Resolve IDs
        incident_db_id = str(ticket.get("incident_id") or "").strip()
        incident_public_id = ticket.get("incident_public_id") # Likely None/Missing in current Schema
        
        # Build strict references
        entity_refs = {"ticketId": ticket_id}
        payload = {
            "ticket_id": ticket_id,
            "from_state": current_state,
            "to_state": to_state,
            "user_id": user_id,
            "status": to_state
        }
        
        if incident_db_id:
             entity_refs["incidentDbId"] = incident_db_id
             payload["incident_db_id"] = incident_db_id
             
        if incident_public_id:
             s_public = str(incident_public_id).strip()
             if s_public:
                entity_refs["incidentId"] = s_public
                payload["incident_id"] = s_public

        await self.bus.publish(
            event_type="ticket.state_changed",
            source_context="ticketing",
            correlation_id=correlation_id,
            entity_refs=entity_refs,
            payload=payload
        )
        
        return {"status": "success", "new_state": to_state}

    async def assign_ticket(self, ticket_id: str, assignee_id: str, correlation_id: str) -> Dict:
        assignee_id = (assignee_id or "").strip()
        correlation_id = (correlation_id or "").strip()
        if not correlation_id:
            correlation_id = str(uuid.uuid4())

        if not assignee_id:
             raise InvalidArgumentError("assignee_id required")

        # Verify existence
        ticket = await self.repository.get_ticket(ticket_id)
        if not ticket:
             raise TicketNotFoundError(ticket_id)
             
        await self.repository.assign_ticket(ticket_id, assignee_id)
        
        # Resolve IDs
        incident_db_id = str(ticket.get("incident_id") or "").strip()
        incident_public_id = ticket.get("incident_public_id")
        
        # Build strict references
        entity_refs = {"ticketId": ticket_id}
        payload = {
            "ticket_id": ticket_id,
            "assignee_id": assignee_id
        }
        
        if incident_db_id:
             entity_refs["incidentDbId"] = incident_db_id
             payload["incident_db_id"] = incident_db_id
             
        if incident_public_id:
             s_public = str(incident_public_id).strip()
             if s_public:
                entity_refs["incidentId"] = s_public
                payload["incident_id"] = s_public
        
        await self.bus.publish(
            event_type="ticket.assigned",
            source_context="ticketing",
            correlation_id=correlation_id,
            entity_refs=entity_refs,
            payload=payload
        )
        
        return {"status": "assigned", "assignee_id": assignee_id}
