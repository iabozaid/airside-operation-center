import React from 'react';
import styles from '../../MasterDashboardPage.module.css';

// Updated to match API: { active_count: number, breakdown: {...} }
interface APIFlightsResponse {
    active_count: number;
    breakdown: {
        arriving: number;
        departing: number;
        delayed: number;
        critical: number;
    };
    recent_flights: any[];
}

interface ActiveFlightsWidgetProps {
    data: APIFlightsResponse | null;
    isLoading: boolean;
    error: string | null;
}

export const ActiveFlightsWidget: React.FC<ActiveFlightsWidgetProps> = ({ data, isLoading, error }) => {
    if (isLoading) return <div className={styles.loading}>Updating Data...</div>;
    if (error || !data) return <div className={styles.error}>Unable to load flight data</div>;

    const total = data.active_count;
    const bd = data.breakdown;

    // Safety check for total=0 to avoid NaN
    const safeTotal = total || 1;

    // Calculate simple percentages for the conic gradient
    const pArr = (bd.arriving / safeTotal) * 100;
    const pDep = (bd.departing / safeTotal) * 100;
    const pDly = (bd.delayed / safeTotal) * 100;

    // Gradient stops
    const s1 = pArr;
    const s2 = s1 + pDep;
    const s3 = s2 + pDly;

    const chartStyle = {
        background: total > 0
            ? `conic-gradient(
                #3b82f6 0% ${s1}%, 
                #10b981 ${s1}% ${s2}%, 
                #f59e0b ${s2}% ${s3}%, 
                #ef4444 ${s3}% 100%
            )`
            : '#e2e8f0' // Empty state
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'center' }}>
            <div className="donut-container" style={{ position: 'relative', width: '200px', height: '200px' }}>
                {/* Chart Ring */}
                <div style={{
                    width: '100%', height: '100%', borderRadius: '50%',
                    ...chartStyle
                }}></div>
                {/* Inner Cutout */}
                <div style={{
                    position: 'absolute', top: '25px', left: '25px',
                    width: '150px', height: '150px', borderRadius: '50%',
                    background: 'white', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center'
                }}>
                    <span className={styles.kpiBig}>{total}</span>
                    <span className={styles.kpiLabel}>ACTIVE</span>
                </div>
            </div>

            <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%' }}>
                <LegendItem color="#3b82f6" label="Arriving" value={bd.arriving} />
                <LegendItem color="#10b981" label="Departing" value={bd.departing} />
                <LegendItem color="#f59e0b" label="Delayed" value={bd.delayed} />
                <LegendItem color="#ef4444" label="Critical" value={bd.critical} />
            </div>
        </div>
    );
};

const LegendItem = ({ color, label, value }: { color: string, label: string, value: number }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color }}></div>
            <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>{label}</span>
        </div>
        <span style={{ fontWeight: 700, color: '#1e293b' }}>{value}</span>
    </div>
);
