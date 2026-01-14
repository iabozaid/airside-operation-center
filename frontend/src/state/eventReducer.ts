export interface EvidenceItem {
    id: string;
    type: 'video' | 'image' | 'log' | 'audit';
    url?: string;
    label: string;
    timestamp: string;
    source: string;
}

export interface Incident {
    id: string;
    type: string;
    severity: string;
    state: string;
    correlation_id: string;
    created_at: string;
    vehicle_id?: string;
    driver_name?: string;
    zone_id?: string;
    location?: { x: number; y: number };
    evidence?: EvidenceItem[];
}

export interface Ticket {
    id: string;
    incident_id: string;
    status: string;
    sla_deadline: string;
    assignee_id?: string;
}

export interface Asset {
    id: string;
    name: string;
    type: string;
    status: string;
    last_heartbeat?: string;
    zone_id?: string;
    location?: { x: number; y: number };
    driver_name?: string;
}

export interface RobotFeedState {
    robotId: string;
    zoneId: string;
    url: string;
    timestamp: string;
}

export interface AppState {
    incidents: Record<string, Incident>;
    tickets: Record<string, Ticket>;
    assets: Record<string, Asset>;
    robotFeed?: RobotFeedState;
    isConnected: boolean;
    lastEventTime: string | null;
}

export const initialState: AppState = {
    incidents: {},
    tickets: {},
    assets: {},
    isConnected: false,
    lastEventTime: null,
};

export type AppEvent =
    | { type: 'SNAPSHOT_LOADED'; payload: { incidents: Incident[]; tickets: Ticket[]; assets: Asset[] } }
    | { type: 'CONNECTION_STATUS'; payload: boolean }
    | { type: 'incident.created'; payload: any }
    | { type: 'incident.state_changed'; payload: any }
    | { type: 'ticket.created'; payload: any }
    | { type: 'fleet.asset_status_changed'; payload: any }
    | { type: 'fleet.robot_patrol_started'; payload: any }
    | { type: 'UNKNOWN'; payload: any };

export function eventReducer(state: AppState, event: AppEvent): AppState {
    const getPayload = (evtPayload: any) => {
        return evtPayload?.payload || evtPayload;
    };

    const now = new Date().toISOString();

    switch (event.type) {
        case 'SNAPSHOT_LOADED':
            const incMap: Record<string, Incident> = {};
            event.payload.incidents.forEach(i => incMap[i.id] = i);
            const ticMap: Record<string, Ticket> = {};
            event.payload.tickets.forEach(t => ticMap[t.id] = t);
            const astMap: Record<string, Asset> = {};
            event.payload.assets.forEach(a => astMap[a.id] = a);
            return { ...state, incidents: incMap, tickets: ticMap, assets: astMap };

        case 'CONNECTION_STATUS':
            return { ...state, isConnected: event.payload };

        case 'incident.created':
            const newInc = getPayload(event.payload);
            const incId = newInc.id || newInc.incident_id || newInc.incidentId;

            if (!incId) return state;

            const mappedInc: Incident = {
                type: 'UNKNOWN',
                severity: 'info',
                state: 'New',
                ...newInc, // Spread first to allow source to override defaults if present
                id: incId,
                // Normalized fields override spread
                vehicle_id: newInc.vehicle_id ?? newInc.vehicleId,
                driver_name: newInc.driver_name ?? newInc.driverName,
                zone_id: newInc.zone_id ?? newInc.zoneId,
                correlation_id: newInc.correlation_id ?? newInc.correlationId,
                created_at: newInc.created_at ?? newInc.createdAt ?? now
            };

            return {
                ...state,
                lastEventTime: now,
                incidents: {
                    ...state.incidents,
                    [incId]: mappedInc
                }
            };

        case 'incident.state_changed':
            const stChg = getPayload(event.payload);
            const impactId = stChg.incident_id || stChg.incidentId;
            const impactState = stChg.to_state || stChg.toState || stChg.state;

            if (!impactId || !impactState || !state.incidents[impactId]) {
                return state;
            }

            return {
                ...state,
                lastEventTime: now,
                incidents: {
                    ...state.incidents,
                    [impactId]: { ...state.incidents[impactId], state: impactState }
                }
            };

        case 'fleet.asset_status_changed':
            const assetP = getPayload(event.payload);
            const aId = assetP.assetId || assetP.id;

            if (!aId) return state;

            const existingAsset = state.assets[aId]; // No fallback object here

            const aType = assetP.assetType ?? assetP.type ?? existingAsset?.type ?? 'UNKNOWN';
            const aStatus = assetP.status ?? existingAsset?.status ?? 'OFFLINE';
            const aZone = assetP.zoneId ?? assetP.zone_id ?? existingAsset?.zone_id;
            const aLoc = assetP.location ?? existingAsset?.location;
            const aTimestamp = assetP.timestamp ?? existingAsset?.last_heartbeat ?? now;
            const aDriver = assetP.driverName ?? existingAsset?.driver_name;

            // Name logic: payload > existing > default
            const aName = assetP.name ?? existingAsset?.name ?? `${aType} ${aId}`;

            const updatedAsset: Asset = {
                id: aId,
                name: aName,
                type: aType,
                status: aStatus,
                zone_id: aZone,
                location: aLoc,
                driver_name: aDriver,
                last_heartbeat: aTimestamp
            };

            return {
                ...state,
                lastEventTime: now,
                assets: {
                    ...state.assets,
                    [aId]: updatedAsset
                }
            };

        case 'fleet.robot_patrol_started':
            const robotP = getPayload(event.payload);
            if (!robotP.robotId) return state;

            return {
                ...state,
                lastEventTime: now,
                robotFeed: {
                    robotId: robotP.robotId,
                    zoneId: robotP.zoneId,
                    url: robotP.evidenceRefs?.robotCamUrl ?? '',
                    timestamp: robotP.timestamp ?? now
                }
            };

        case 'ticket.created':
            const newTicket = getPayload(event.payload);
            const tId = newTicket.ticket_id ?? newTicket.ticketId;
            const tIncId = newTicket.incident_id ?? newTicket.incidentId;

            if (!tId || !tIncId) return state;

            return {
                ...state,
                lastEventTime: now,
                tickets: {
                    ...state.tickets,
                    [tId]: {
                        id: tId,
                        incident_id: tIncId,
                        status: 'Open',
                        sla_deadline: newTicket.sla_deadline ?? now,
                        assignee_id: newTicket.assignee_id ?? newTicket.assigneeId
                    }
                }
            };

        default:
            return state;
    }
}
