import React, { useState, useEffect } from 'react';
import { IncidentQueue } from './IncidentQueue';
import { Workbench } from '../../components/Workbench/Workbench';
import { OpsMap } from '../../components/MapContainer/OpsMap';
import { useEventStream } from '../../contexts/EventContext';
import { projectToSVG } from '../../components/MapContainer/projection';
import { OpsIncident } from '../../state/opsTypes';
import { api } from '../../api/client';
import { EvidenceItem } from '../../state/eventReducer';

interface MapMarker {
    id: string;
    x: number;
    y: number;
    type: 'visitor' | 'vehicle' | 'robot';
    status: 'critical' | 'warning' | 'good' | 'accent' | 'neutral';
}

const getEntityStatus = (type: string): MapMarker['status'] => {
    switch (type) {
        case 'visitor': return 'neutral';
        case 'vehicle': return 'warning';
        case 'robot': return 'accent';
        default: return 'neutral';
    }
}

export const OpsPage: React.FC = () => {
    const { subscribe } = useEventStream();

    // State
    const [markers, setMarkers] = useState<Record<string, MapMarker>>({});
    const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
    const [selectedIncident, setSelectedIncident] = useState<OpsIncident | null>(null);

    // Workbench State
    const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
    const [loadingEvidence, setLoadingEvidence] = useState(false);

    // Viewport stub (Contract Compliance)
    const [viewport, setViewport] = useState({
        center: { lat: 24.9633, lng: 46.6977 },
        zoom: 14
    });

    useEffect(() => {
        const unsubMove = subscribe('asset.moved', (data: any) => {
            const { x, y } = projectToSVG(data.location.lat, data.location.lng);
            setMarkers(prev => ({
                ...prev,
                [data.id]: {
                    id: data.id,
                    x, y,
                    type: data.type,
                    status: getEntityStatus(data.type)
                }
            }));
        });

        return () => {
            unsubMove();
        };
    }, [subscribe]);

    const handleSelectIncident = (inc: OpsIncident) => {
        setSelectedIncident(inc);
        setSelectedId(inc.id);
        setEvidence([]); // Reset evidence on new select

        // Focus on Map if location exists
        if (inc.location && inc.location.lat) {
            setViewport(prev => ({
                ...prev,
                center: { lat: inc.location.lat, lng: inc.location.lng },
                // zoom: 16 // Optional: Auto-zoom
            }));
        }
    };

    const handleClaim = async (id: string) => {
        try {
            await api.claimIncident(id);
            // Refresh incident details? Ideally usage of React Query or similar, 
            // but here we just optimistically update or re-fetch.
            // For now, simpler: user sees it claimed in list eventually via SSE updates.
        } catch (e) {
            console.error(e);
        }
    };

    const handleViewEvidence = async (id: string) => {
        setLoadingEvidence(true);
        try {
            const ev = await api.getIncidentEvidence(id);
            setEvidence(ev);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingEvidence(false);
        }
    };

    // Combine streamed markers with selected incident marker (if any)
    const markerList = Object.values(markers);

    if (selectedIncident && selectedIncident.location && selectedIncident.location.lat) {
        const { x, y } = projectToSVG(selectedIncident.location.lat, selectedIncident.location.lng);
        // Avoid duplicate if it exists in streamed markers
        if (!markers[selectedIncident.id]) {
            markerList.push({
                id: selectedIncident.id,
                x, y,
                type: 'vehicle', // Conceptual placeholder for incident
                status: selectedIncident.priority === 'high' ? 'critical' : 'warning'
            });
        }
    }

    return (
        <div style={{ display: 'flex', height: '100%' }}>
            {/* Zone 1: Queue */}
            <div style={{ width: 'var(--sidebar-width)', backgroundColor: 'var(--color-bg-surface)', height: '100%', borderRight: '1px solid var(--color-bg-sidebar)', zIndex: 10 }}>
                <IncidentQueue
                    onSelect={handleSelectIncident}
                    selectedId={selectedId}
                />
            </div>

            {/* Zone 2: Map */}
            <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                <OpsMap
                    markers={markerList}
                    selectedEntityId={selectedId}
                    onSelectEntity={(id) => setSelectedId(id)}
                    viewport={viewport}
                    onViewportChange={setViewport}
                />
            </div>

            {/* Zone 3: Workbench */}
            <div style={{ width: 400, backgroundColor: 'var(--color-bg-surface)', borderLeft: '1px solid var(--color-bg-sidebar)', height: '100%', zIndex: 10 }}>
                <Workbench
                    selectedIncident={selectedIncident}
                    onClaim={handleClaim}
                    onViewEvidence={handleViewEvidence}
                    evidence={evidence}
                    loadingEvidence={loadingEvidence}
                />
            </div>
        </div>
    );
};
