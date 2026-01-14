export interface Ticket {
    id: string;
    incident_id: string;
    title: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority: 'critical' | 'high' | 'medium' | 'low';
    sla_deadline_utc: string; // ISO string
    assignee_id?: string | null;
    created_at_utc?: string | null;
}
