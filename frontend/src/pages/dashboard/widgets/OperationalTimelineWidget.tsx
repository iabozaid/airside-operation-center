import React from 'react';
import styles from '../../MasterDashboardPage.module.css';

// API: { events: [{ time, type, description }] }
// API "description" -> Widget "title"
interface APITimelineEvent {
    time: string;
    type: string;
    description: string;
}

interface APITimelineResponse {
    events: APITimelineEvent[];
}

interface OperationalTimelineWidgetProps {
    data: APITimelineResponse | null;
    isLoading: boolean;
    error: string | null;
}

export const OperationalTimelineWidget: React.FC<OperationalTimelineWidgetProps> = ({ data, isLoading, error }) => {
    if (isLoading) return <div className={styles.loading}>Loading Timeline...</div>;
    if (error || !data || !data.events) return <div className={styles.error}>Timeline unavailable</div>;

    const events = data.events.slice(0, 5);

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%', position: 'relative' }}>
            {/* Horizontal Line */}
            <div style={{ position: 'absolute', top: '24px', left: '0', right: '0', height: '2px', background: '#e2e8f0', zIndex: 0 }} />

            {events.map((evt, idx) => (
                <div key={idx} style={{ flex: 1, position: 'relative', zIndex: 1, padding: '0 12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        {/* Dot */}
                        <div style={{
                            width: '12px', height: '12px', borderRadius: '50%',
                            background: idx === 0 ? '#3b82f6' : '#cbd5e1',
                            border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            marginBottom: '12px'
                        }} />

                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>{evt.time}</div>
                        <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem', marginBottom: '2px' }}>{evt.description}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', padding: '2px 6px', background: '#f1f5f9', borderRadius: '4px', display: 'inline-block' }}>
                            {evt.type.replace('_', ' ')}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
