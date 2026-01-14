import React from 'react';
import { AlertCircle, AlertTriangle, Info, ArrowRight } from 'lucide-react';
import styles from '../../MasterDashboardPage.module.css';

// API: { items: [{ severity: "CRITICAL", message, timestamp, action }] }
interface APIAlertItem {
    severity: string;
    message: string;
    timestamp: string;
    action: string;
}

interface APIAlertsResponse {
    items: APIAlertItem[];
}

interface PriorityAlertsWidgetProps {
    data: APIAlertsResponse | null;
    isLoading: boolean;
    error: string | null;
}

export const PriorityAlertsWidget: React.FC<PriorityAlertsWidgetProps> = ({ data, isLoading, error }) => {
    if (isLoading) return <div className={styles.loading}>Fetching Alerts...</div>;
    if (error || !data || !data.items) return <div className={styles.error}>Unable to retrieve alerts</div>;

    const getStyles = (severity: string) => {
        const norm = severity.toLowerCase();
        switch (norm) {
            case 'critical': return { bg: '#fef2f2', border: '#ef4444', icon: <AlertCircle size={16} color="#ef4444" /> };
            case 'attention': return { bg: '#fffbeb', border: '#f59e0b', icon: <AlertTriangle size={16} color="#f59e0b" /> };
            default: return { bg: '#eff6ff', border: '#3b82f6', icon: <Info size={16} color="#3b82f6" /> };
        }
    };

    return (
        <div style={{ height: '100%', overflowY: 'auto', paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.items.map((alert, idx) => {
                const s = getStyles(alert.severity);
                return (
                    <div key={idx} style={{
                        background: s.bg,
                        borderLeft: `4px solid ${s.border}`,
                        borderRadius: '4px',
                        padding: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <div style={{ marginTop: '2px' }}>{s.icon}</div>
                            <div>
                                <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>{alert.message}</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{alert.timestamp}</div>
                            </div>
                        </div>
                        <button style={{
                            background: 'white', border: '1px solid #e2e8f0',
                            padding: '4px 8px', borderRadius: '4px',
                            cursor: 'pointer', color: '#64748b', fontSize: '0.75rem', fontWeight: 600
                        }}>
                            {alert.action}
                        </button>
                    </div>
                );
            })}
        </div>
    );
};
