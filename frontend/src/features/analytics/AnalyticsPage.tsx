import React, { useEffect, useState } from 'react';

interface AnalyticsData {
    incidents_by_severity: Record<string, number>;
    sla_breaches: number;
    fleet_uptime: number;
    mtta: string;
    mttr: string;
    incidents_trend: number[];
}

export const AnalyticsPage: React.FC = () => {
    const [data, setData] = useState<AnalyticsData | null>(null);

    useEffect(() => {
        fetch('/analytics/summary')
            .then(res => res.json())
            .then(setData)
            .catch(err => console.error("Failed to fetch analytics", err));
    }, []);

    if (!data) return <div style={{ padding: 40 }}>Loading Analytics...</div>;

    const maxTrend = Math.max(...(data.incidents_trend || [10]));

    return (
        <div style={{ padding: '40px', overflowY: 'auto', height: '100%' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 300, marginBottom: '40px' }}>OPERATIONAL ANALYTICS</h1>

            {/* KPI ROW */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
                <KpiCard label="MTTA (Mean Time to Ack)" value={data.mtta} trend="↓ 12%" good />
                <KpiCard label="MTTR (Mean Time to Resolve)" value={data.mttr} trend="↑ 2%" bad />
                <KpiCard label="SLA Breaches (24h)" value={data.sla_breaches.toString()} trend="0" neutral />
                <KpiCard label="Fleet Uptime" value={`${data.fleet_uptime}%`} trend="↑ 0.2%" good />
            </div>

            {/* CHARTS ROW */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                {/* Main Trend Chart */}
                <div style={{ backgroundColor: 'var(--color-bg-surface)', padding: '20px', border: '1px solid var(--color-bg-sidebar)' }}>
                    <h3 style={{ fontSize: '14px', marginBottom: '20px', color: 'var(--color-text-secondary)' }}>INCIDENT VOLUME (24H)</h3>
                    <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '4px' }}>
                        {data.incidents_trend?.map((val, idx) => (
                            <div key={idx} style={{
                                flex: 1,
                                height: `${(val / maxTrend) * 100}%`,
                                backgroundColor: 'var(--color-primary)',
                                opacity: 0.8,
                                borderRadius: '2px 2px 0 0',
                                position: 'relative',
                                minHeight: '1px'
                            }} title={`${val} incidents`}></div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '10px', color: 'var(--color-text-dim)' }}>
                        <span>00:00</span>
                        <span>12:00</span>
                        <span>23:00</span>
                    </div>
                </div>

                {/* Severity Breakdown */}
                <div style={{ backgroundColor: 'var(--color-bg-surface)', padding: '20px', border: '1px solid var(--color-bg-sidebar)' }}>
                    <h3 style={{ fontSize: '14px', marginBottom: '20px', color: 'var(--color-text-secondary)' }}>SEVERITY BREAKDOWN</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {Object.entries(data.incidents_by_severity).map(([sev, count]) => (
                            <div key={sev}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                                    <span style={{ textTransform: 'uppercase' }}>{sev}</span>
                                    <span>{count}</span>
                                </div>
                                <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--color-bg-canvas)', borderRadius: '3px' }}>
                                    <div style={{
                                        width: `${Math.min((count / 20) * 100, 100)}%`,
                                        height: '100%',
                                        borderRadius: '3px',
                                        backgroundColor: getSeverityColor(sev)
                                    }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const KpiCard = ({ label, value, trend, good, bad, neutral }: any) => {
    let trendColor = 'var(--color-text-dim)';
    if (good) trendColor = 'var(--color-status-success)';
    if (bad) trendColor = 'var(--color-status-error)';

    return (
        <div style={{ backgroundColor: 'var(--color-bg-surface)', padding: '20px', border: '1px solid var(--color-bg-sidebar)' }}>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>{label.toUpperCase()}</div>
            <div style={{ fontSize: '32px', fontWeight: 300 }}>{value}</div>
            <div style={{ fontSize: '12px', marginTop: '4px', color: trendColor }}>{trend} vs prev</div>
        </div>
    );
};

const getSeverityColor = (sev: string) => {
    switch (sev) {
        case 'critical': return 'var(--color-status-critical)';
        case 'high': return 'var(--color-status-warning)';
        default: return 'var(--color-status-good)';
    }
};
