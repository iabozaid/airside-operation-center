import React, { useState } from 'react';
import { api } from '../api/client';
import { Truck, Video, Users, Luggage, Play, AlertTriangle } from 'lucide-react';

const SimCard: React.FC<{
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}> = ({ title, icon, children }) => (
    <div style={{
        background: 'white',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
            <div style={{ color: 'var(--col-info)' }}>{icon}</div>
            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{title}</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {children}
        </div>
    </div>
);

const ActionButton: React.FC<{
    label: string;
    action: () => void;
    icon?: React.ReactNode;
    variant?: 'default' | 'danger' | 'warning';
}> = ({ label, action, icon, variant = 'default' }) => {
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        setLoading(true);
        try {
            await action();
        } finally {
            setLoading(false);
        }
    };

    const getBgColor = () => {
        if (loading) return '#e2e8f0';
        if (variant === 'danger') return '#fff5f5';
        if (variant === 'warning') return '#fffff0';
        return '#f7fafc';
    };

    const getBorderColor = () => {
        if (variant === 'danger') return 'var(--col-critical)';
        if (variant === 'warning') return 'var(--col-warn)';
        return 'var(--border-subtle)';
    };

    const getTextColor = () => {
        if (loading) return '#cbd5e0';
        if (variant === 'danger') return 'var(--col-critical)';
        if (variant === 'warning') return 'var(--col-warn)';
        return 'var(--text-primary)';
    };

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                border: `1px solid ${getBorderColor()}`,
                background: getBgColor(),
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                color: getTextColor(),
                fontWeight: 500,
                fontSize: '0.9rem',
                transition: 'all 0.2s ease'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {icon}
                {label}
            </div>
            {loading && <span style={{ fontSize: '0.8rem' }}>...</span>}
        </button>
    );
};

export const SimulationPage: React.FC = () => {
    const [lastLog, setLastLog] = useState<string>('');

    const trigger = async (subsystem: string, action: string, label: string) => {
        try {
            const res: any = await api.simulate(subsystem, action);
            const time = new Date().toLocaleTimeString();

            if (res.status === 'skipped') {
                setLastLog(`[${time}] Skipped: ${label} (${res.reason || "Not implemented"})`);
            } else {
                let msg = `[${time}] Success: ${label} (${res.status || 'Sent'})`;
                if (res.run_id || res.runId) msg += ` run_id=${res.run_id || res.runId}`;
                if (res.incident_id || res.incidentId) msg += ` incident_id=${res.incident_id || res.incidentId}`;
                setLastLog(msg);
            }
        } catch (err: any) {
            const msg = err?.response?.data?.detail || err?.message || String(err);
            setLastLog(`[Error] Failed to trigger ${label}: ${msg}`);
        }
    };

    return (
        <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Simulation Control Surface</h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Trigger subsystem-specific events to validate command center behavior.
                    Events flow via Redis Streams → Consumers → SSE.
                </p>
                {lastLog && (
                    <div style={{
                        marginTop: '16px',
                        padding: '12px',
                        background: '#333',
                        color: '#4fd1c5',
                        fontFamily: 'monospace',
                        borderRadius: '4px',
                        fontSize: '0.9rem'
                    }}>
                        &gt; {lastLog}
                    </div>
                )}
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px'
            }}>
                {/* Fleet Card */}
                <SimCard title="Fleet Subsystem" icon={<Truck size={24} />}>
                    <ActionButton
                        label="Default Scene (All Assets)"
                        icon={<Play size={16} />}
                        action={() => trigger('fleet', 'default', 'Default Scene')}
                    />
                    <ActionButton
                        label="Trigger Overspeed"
                        variant="warning"
                        icon={<AlertTriangle size={16} />}
                        action={() => trigger('fleet', 'overspeed', 'Overspeed Incident')}
                    />
                    <ActionButton
                        label="Trigger Geofence Breach"
                        variant="danger"
                        icon={<AlertTriangle size={16} />}
                        action={() => trigger('fleet', 'geofence', 'Geofence Breach')}
                    />
                </SimCard>

                {/* Robot Card */}
                <SimCard title="Robot Subsystem" icon={<Video size={24} />}>
                    <ActionButton
                        label="Start Patrol Pattern"
                        icon={<Play size={16} />}
                        action={() => trigger('robot', 'patrol', 'Robot Patrol')}
                    />
                </SimCard>

                {/* Visitor Card */}
                <SimCard title="Visitor Subsystem" icon={<Users size={24} />}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '8px' }}>
                        Placeholder Actions (Not Implemented)
                    </div>
                    <ActionButton
                        label="Trigger Restricted Entry"
                        action={() => trigger('visitor', 'restricted_entry', 'Restricted Entry')}
                    />
                </SimCard>

                {/* Baggage Card */}
                <SimCard title="Baggage Subsystem" icon={<Luggage size={24} />}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '8px' }}>
                        Placeholder Actions (Not Implemented)
                    </div>
                    <ActionButton
                        label="Trigger Bag Tamper"
                        action={() => trigger('baggage', 'bag_tamper', 'Bag Tamper')}
                    />
                </SimCard>
            </div>
        </div>
    );
};
