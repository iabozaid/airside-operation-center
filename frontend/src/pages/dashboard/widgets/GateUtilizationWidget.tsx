import React from 'react';
import styles from '../../MasterDashboardPage.module.css';

// API: { gates_monitored: [...], average_utilization: number }
interface APIGatesResponse {
    gates_monitored: {
        id: string;
        status: string;
        aircraft: string | null;
        utilization: number;
    }[];
    average_utilization: number;
}

interface GateUtilizationWidgetProps {
    data: APIGatesResponse | null;
    isLoading: boolean;
    error: string | null;
}

export const GateUtilizationWidget: React.FC<GateUtilizationWidgetProps> = ({ data, isLoading, error }) => {
    if (isLoading) return <div className={styles.loading}>Analyzing Gates...</div>;
    if (error || !data) return <div className={styles.error}>Gate data unavailable</div>;

    const list = data.gates_monitored || [];
    const avg = data.average_utilization;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '24px' }}>
                <div className={styles.kpiBig}>{avg}%</div>
                <div className={styles.kpiLabel}>AVG UTILIZATION</div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {list.map(gate => (
                    <div key={gate.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 600, color: '#334155' }}>{gate.id}</span>
                            <span style={{ fontWeight: 700, color: '#1e293b' }}>{gate.utilization}%</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{
                                width: `${gate.utilization}%`,
                                height: '100%',
                                background: gate.utilization > 80 ? '#ef4444' : gate.utilization > 50 ? '#3b82f6' : '#10b981',
                                borderRadius: '4px'
                            }} />
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>{gate.status}</span>
                            {gate.aircraft && <span>Handling {gate.aircraft}</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
