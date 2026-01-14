import { OpsState, OpsIncident } from './opsTypes';

export type OpsAction =
    | { type: 'SNAPSHOT_LOADED'; payload: OpsIncident[] }
    | { type: 'INCIDENT_NEW'; payload: OpsIncident }
    | { type: 'INCIDENT_UPDATE'; payload: Partial<OpsIncident> & { id: string } }
    | { type: 'INCIDENT_RESOLVED'; payload: { id: string } }
    | { type: 'FILTER_SET'; payload: string }
    | { type: 'INCIDENT_SELECT'; payload: string | null };

export function opsReducer(state: OpsState, action: OpsAction): OpsState {
    switch (action.type) {
        case 'SNAPSHOT_LOADED':
            return {
                ...state,
                incidents: action.payload
            };

        case 'INCIDENT_NEW':
            // Avoid duplicates
            if (state.incidents.find(i => i.id === action.payload.id)) {
                return state;
            }
            return {
                ...state,
                incidents: [action.payload, ...state.incidents]
            };

        case 'INCIDENT_UPDATE':
            return {
                ...state,
                incidents: state.incidents.map(inc =>
                    inc.id === action.payload.id
                        ? { ...inc, ...action.payload }
                        : inc
                )
            };

        case 'INCIDENT_RESOLVED':
            return {
                ...state,
                incidents: state.incidents.map(inc =>
                    inc.id === action.payload.id
                        ? { ...inc, status: 'resolved' }
                        : inc
                )
            };

        case 'FILTER_SET':
            return {
                ...state,
                filter: action.payload
            };

        case 'INCIDENT_SELECT':
            return {
                ...state,
                selectedIncidentId: action.payload
            };

        default:
            return state;
    }
}
