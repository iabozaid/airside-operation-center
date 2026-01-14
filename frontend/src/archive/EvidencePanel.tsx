import React, { useState, useEffect } from 'react';
import { EvidenceItem } from '../state/eventReducer';
import { api } from '../api/client';

interface EvidencePanelProps {
    incidentId: string;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({ incidentId }) => {
    const [activeTab, setActiveTab] = useState('internal');
    const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        api.getIncidentEvidence(incidentId).then(data => {
            setEvidence(data);
            setLoading(false);
        });
    }, [incidentId]);

    const tabs = [
        { id: 'internal', label: 'Internal Cam' },
        { id: 'external', label: 'External Cam' },
        { id: 'robot', label: 'Robot' },
        { id: 'log', label: 'Event Log' },
        { id: 'audit', label: 'Audit Trail' }
    ];

    if (loading) return <div style={{ fontSize: '0.8rem', padding: 8 }}>Loading Evidence...</div>;

    const filteredEvidence = evidence.filter(e => {
        if (activeTab === 'internal' && e.type === 'video' && e.label.includes('Internal')) return true;
        if (activeTab === 'log' && e.type === 'log') return true;
        return false; // Mock filtering logic
    });

    return (
        <div style={{ marginTop: '16px', border: '1px solid var(--border-subtle)', borderRadius: '4px' }}>
            <div style={{ display: 'flex', background: '#f7fafc', borderBottom: '1px solid var(--border-subtle)' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            flex: 1,
                            padding: '8px 4px',
                            border: 'none',
                            background: activeTab === tab.id ? 'white' : 'transparent',
                            borderBottom: activeTab === tab.id ? '2px solid var(--col-info)' : 'none',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            fontWeight: activeTab === tab.id ? 'bold' : 'normal'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div style={{ padding: '12px', minHeight: '100px', background: 'white' }}>
                {filteredEvidence.length > 0 ? (
                    filteredEvidence.map(e => (
                        <div key={e.id} style={{ marginBottom: 8, fontSize: '0.85rem' }}>
                            <div style={{ fontWeight: 'bold' }}>{e.label}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(e.timestamp).toLocaleTimeString()} - {e.source}</div>
                        </div>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                        No evidence attached for this source.
                    </div>
                )}
            </div>
        </div>
    );
};
