import React from 'react';
import { CommandCenterLayout } from '../layout/CommandCenterLayout';
import { MapContainer } from '../components/MapContainer/MapContainer';
import { OperationsQueue } from '../components/OperationsQueue/OperationsQueue';
import { Workbench } from '../components/Workbench/Workbench';
import { useOpsState } from '../state/useOpsState';

export function OpsPage() {
    const {
        state,
        filteredIncidents,
        selectIncident,
        claimIncident,
        fetchEvidence,
        evidence,
        loadingEvidence
    } = useOpsState();

    // Transform incidents to map markers per contract
    const markers = filteredIncidents.map(inc => {
        let status: 'critical' | 'warn' | 'ok' | undefined = 'ok';
        if (inc.priority === 'high') status = 'critical';
        if (inc.priority === 'medium') status = 'warn';

        return {
            id: inc.id,
            lat: inc.location.lat,
            lng: inc.location.lng,
            label: inc.id,
            status
        };
    });

    // Find selected object
    const selectedIncident = state.incidents.find(i => i.id === state.selectedIncidentId) || null;

    return (
        <CommandCenterLayout
            map={
                <MapContainer
                    markers={markers}
                    selectedEntityId={state.selectedIncidentId}
                    onSelectEntity={selectIncident}
                />
            }
            queue={
                < OperationsQueue
                    incidents={filteredIncidents}
                    selectedId={state.selectedIncidentId}
                    onSelect={selectIncident}
                />
            }
            workbench={
                < Workbench
                    selectedIncident={selectedIncident}
                    onClaim={claimIncident}
                    onViewEvidence={fetchEvidence}
                    evidence={evidence}
                    loadingEvidence={loadingEvidence}
                />
            }
        />
    );
}
