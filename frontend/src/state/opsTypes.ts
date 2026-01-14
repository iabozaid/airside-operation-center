export interface OpsIncident {
    id: string;
    title: string;
    priority: 'high' | 'medium' | 'low';
    status: 'open' | 'investigating' | 'resolved' | 'in_progress' | 'acknowledged';
    timestamp: string;
    location: { lat: number; lng: number };
    raw?: any;
}

export interface OpsTask {
    id: string;
    label: string;
    completed: boolean;
}

export interface OpsState {
    incidents: OpsIncident[];
    selectedIncidentId: string | null;
    filter: string;
}
