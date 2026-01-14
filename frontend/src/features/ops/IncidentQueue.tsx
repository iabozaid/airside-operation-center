import React, { useEffect, useState } from 'react';
import { useEventStream } from '../../contexts/EventContext';
import { OpsIncident } from '../../state/opsTypes';

interface IncidentQueueProps {
    onSelect: (incident: OpsIncident) => void;
    selectedId?: string;
}

export const IncidentQueue: React.FC<IncidentQueueProps> = ({ onSelect, selectedId }) => {
    const { subscribe } = useEventStream();
    const [incidents, setIncidents] = useState<OpsIncident[]>([]);
    const [loading, setLoading] = useState(true);

    // Mapper: Backend Incident -> Frontend OpsIncident
    const mapToOps = (raw: any): OpsIncident => ({
        id: raw.id,
        title: raw.type?.toUpperCase().replace('_', ' ') || 'INCIDENT',
        priority: (raw.severity || 'low') as any, // strict mapping needed?
        status: raw.state || 'open',
        timestamp: raw.created_at_utc,
        location: raw.location || { lat: 24.96, lng: 46.70 }, // Default if missing
        raw
    });

    // 1. Initial Fetch (Historical)
    useEffect(() => {
        // Use relative path to leverage Vite Proxy
        fetch('/incidents')
            .then(res => res.json())
            .then(data => {
                const mapped = data.map(mapToOps);
                setIncidents(mapped);
            })
            .catch(err => {
                console.error('Failed to fetch incidents', err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    // 2. Live Updates (Sim-Driven)
    useEffect(() => {
        const unsubCreate = subscribe('incident.created', (data) => {
            const mapped = mapToOps(data);
            setIncidents(prev => [mapped, ...prev]);
        });

        // We would also handle update/resolve here
        return () => {
            unsubCreate();
        };
    }, [subscribe]);

    if (loading) return <div className="text-small" style={{ padding: 'var(--space-4)' }}>Loading History...</div>;

    return (
        <div style={{ height: '100%', overflowY: 'auto', borderRight: '1px solid #d1d5db' }}>
            <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                <div className="text-small" style={{ fontWeight: 600 }}>INCIDENT QUEUE</div>
            </div>
            {incidents.map(inc => (
                <div
                    key={inc.id}
                    onClick={() => onSelect(inc)}
                    style={{
                        padding: 'var(--space-3) var(--space-4)',
                        borderBottom: '1px solid #f3f4f6',
                        borderLeft: `4px solid ${getSeverityColor(inc.priority)}`,
                        cursor: 'pointer',
                        backgroundColor: inc.id === selectedId ? 'var(--color-bg-hover)' : 'transparent'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="text-small" style={{ fontWeight: 600 }}>{inc.id.slice(0, 8)}...</span>
                        <span className="text-tiny" style={{ color: 'var(--color-text-secondary)' }}>
                            {inc.timestamp ? new Date(inc.timestamp).toLocaleTimeString() : 'Historic'}
                        </span>
                    </div>
                    <div className="text-tiny" style={{ marginTop: 2 }}>{inc.title}</div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                        <span className="text-tiny" style={{
                            backgroundColor: '#e5e7eb', padding: '1px 4px', borderRadius: 2
                        }}>{inc.status}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

const getSeverityColor = (sev: string) => {
    switch (sev) {
        case 'critical': return 'var(--color-status-critical)';
        case 'high': return 'var(--color-status-warning)';
        default: return 'var(--color-status-good)';
    }
}
