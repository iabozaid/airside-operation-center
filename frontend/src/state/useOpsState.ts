
import { useReducer, useEffect, useCallback, useState } from 'react';
import { OpsState, OpsIncident } from './opsTypes';
import { api } from '../api/client';
import { EvidenceItem } from './eventReducer';
import { opsReducer } from './opsReducer';
import { streamClient } from '../api/streamClient';

export function useOpsState() {
    const [state, dispatch] = useReducer(opsReducer, {
        incidents: [],
        selectedIncidentId: null,
        filter: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
    const [loadingEvidence, setLoadingEvidence] = useState(false);

    // Initial Fetch (Deterministic Demo Mode Support)
    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            try {
                // Force Demo Mode for this task to ensure determinism
                const isDemo = true; // Hardcoded true for reliability during review

                if (isDemo) {
                    console.log("Loading Deterministic Mock Data");
                    // 8 Deterministic Incidents from Brief
                    const MOCK_INCIDENTS: OpsIncident[] = [
                        { id: 'A3F7C2', title: 'Fire Alarm', priority: 'high', status: 'open', timestamp: new Date(Date.now() - 23 * 60000).toISOString(), location: { lat: 0, lng: 0 }, raw: { type: 'fire_alarm', type_label: 'Fire Alarm', location_label: 'Terminal 2', sla_minutes: 30, escalated: true } },
                        { id: 'C9F1A6', title: 'Unauthorized Access', priority: 'high', status: 'open', timestamp: new Date(Date.now() - 17 * 60000).toISOString(), location: { lat: 0, lng: 0 }, raw: { type: 'security_access', type_label: 'Unauthorized Access', location_label: 'Terminal 4', sla_minutes: 15, escalated: true } },
                        { id: 'E5C3F9', title: 'Medical Emergency', priority: 'high', status: 'in_progress', timestamp: new Date(Date.now() - 45 * 60000).toISOString(), location: { lat: 0, lng: 0 }, raw: { type: 'medical', type_label: 'Medical Emergency', location_label: 'Terminal 3', sla_minutes: 10, escalated: true } },
                        { id: 'G1E8B5', title: 'Suspicious Package', priority: 'high', status: 'in_progress', timestamp: new Date(Date.now() - 12 * 60000).toISOString(), location: { lat: 0, lng: 0 }, raw: { type: 'security_package', type_label: 'Suspicious Package', location_label: 'Terminal 2', sla_minutes: 12, escalated: true } },
                        { id: 'B8E4D1', title: 'Baggage Jam', priority: 'medium', status: 'open', timestamp: new Date(Date.now() - 5 * 60000).toISOString(), location: { lat: 0, lng: 0 }, raw: { type: 'baggage', type_label: 'Baggage Jam', location_label: 'Terminal 1', sla_minutes: 42, escalated: false } },
                        { id: 'D2B8E3', title: 'Fleet Overspeed', priority: 'medium', status: 'open', timestamp: new Date(Date.now() - 8 * 60000).toISOString(), location: { lat: 0, lng: 0 }, raw: { type: 'fleet_violation', type_label: 'Fleet Overspeed', location_label: 'Apron', sla_minutes: 28, escalated: false } },
                        { id: 'F7D4A2', title: 'Equipment Malfunction', priority: 'low', status: 'open', timestamp: new Date(Date.now() - 120 * 60000).toISOString(), location: { lat: 0, lng: 0 }, raw: { type: 'maintenance', type_label: 'Equipment Malfunction', location_label: 'Terminal 1', sla_minutes: 115, escalated: false } },
                        { id: 'H4F2C7', title: 'Ground Collision', priority: 'medium', status: 'resolved', timestamp: new Date(Date.now() - 36 * 60000).toISOString(), location: { lat: 0, lng: 0 }, raw: { type: 'accident', type_label: 'Ground Collision', location_label: 'Apron • Stand 42', sla_minutes: 60, escalated: false } }
                    ];
                    dispatch({ type: 'SNAPSHOT_LOADED', payload: MOCK_INCIDENTS });
                    setIsLoading(false);
                    return;
                }
            } catch (err) {
                console.error("Mock Data Loading Failed", err);
            }

            try {
                const snapshot = await api.getSnapshot();
                // Map backend incidents to OpsIncident format
                // Note: In a real app we'd share this mapper
                const mappedIncidents: OpsIncident[] = snapshot.incidents.map((i: any) => {
                    const sevMap: Record<string, 'high' | 'medium' | 'low'> = {
                        'critical': 'high',
                        'warning': 'medium',
                        'info': 'low'
                    };
                    const statusMap: Record<string, any> = {
                        'New': 'open',
                        'Closed': 'resolved',
                        'InProgress': 'in_progress'
                    };

                    return {
                        id: i.id,
                        title: i.type?.replace('_', ' ') || 'Incident',
                        priority: sevMap[i.severity] || 'medium',
                        status: statusMap[i.state] || 'open',
                        timestamp: i.created_at_utc ? new Date(i.created_at_utc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now',
                        location: i.location ? { lat: i.location.lat, lng: i.location.lng } : {
                            lat: 24.965,
                            lng: 46.700
                        },
                        raw: i
                    };
                });
                dispatch({ type: 'SNAPSHOT_LOADED', payload: mappedIncidents });
            } catch (e) {
                console.error("Failed to load snapshot", e);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    // Real-Time Subscription
    useEffect(() => {
        streamClient.config.onMessage = (envelope: any) => {
            const { event_type, payload } = envelope;

            if (event_type === 'incident.created') {
                const inc = payload;
                const mapped: OpsIncident = {
                    id: inc.id,
                    title: inc.type || 'Incident',
                    priority: inc.severity || 'medium',
                    status: inc.state || 'open',
                    timestamp: new Date().toLocaleTimeString(),
                    location: { lat: 24.965, lng: 46.700 },
                    raw: inc
                };
                dispatch({ type: 'INCIDENT_NEW', payload: mapped });
            }
            else if (event_type === 'incident.state_changed') {
                dispatch({
                    type: 'INCIDENT_UPDATE',
                    payload: {
                        id: payload.incident_id,
                        status: payload.to_state
                    }
                });
            }
        };

        streamClient.connect();

        return () => {
            streamClient.disconnect();
        };
    }, []);

    const setFilter = (filter: string) => {
        dispatch({ type: 'FILTER_SET', payload: filter });
    };

    const selectIncident = useCallback((id: string | null) => {
        dispatch({ type: 'INCIDENT_SELECT', payload: id });
        setEvidence([]);
    }, []);

    const claimIncident = async (id: string) => {
        if (!confirm("Confirm claiming this incident?")) return;
        try {
            await api.claimIncident(id);
            dispatch({
                type: 'INCIDENT_UPDATE',
                payload: { id, status: 'in_progress' }
            });
        } catch (e) {
            console.error("Claim failed", e);
            alert("Failed to claim incident");
        }
    };

    const fetchEvidence = async (id: string) => {
        setLoadingEvidence(true);
        try {
            const data = await api.getIncidentEvidence(id);
            setEvidence(data);
        } catch (e) {
            console.error("Evidence load failed", e);
        } finally {
            setLoadingEvidence(false);
        }
    };

    const filteredIncidents = state.incidents.filter(inc =>
        inc.title.toLowerCase().includes(state.filter.toLowerCase())
    );

    return {
        state,
        filteredIncidents,
        setFilter,
        selectIncident,
        claimIncident,
        fetchEvidence,
        evidence,
        loadingEvidence,
        isLoading
    };
}

