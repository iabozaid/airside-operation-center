import React from 'react';
import { Users, UserCheck } from 'lucide-react';
import styles from '../../MasterDashboardPage.module.css';

// API: { total_crew: number, deployed: number, available: number, allocation: { [role]: number } }
interface APICrewResponse {
    total_crew: number;
    deployed: number;
    available: number;
    allocation: Record<string, number>;
}

interface CrewAllocationWidgetProps {
    data: APICrewResponse | null;
    isLoading: boolean;
    error: string | null;
}

export const CrewAllocationWidget: React.FC<CrewAllocationWidgetProps> = ({ data, isLoading, error }) => {
    if (isLoading) return <div className={styles.loading}>Locating Crews...</div>;
    if (error || !data) return <div className={styles.error}>Crew shift data unavailable</div>;

    // Transform allocation map to list for rendering
    const teams = Object.entries(data.allocation).map(([role, count]) => ({
        role: role.replace('_', ' ').toUpperCase(),
        count
    }));

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', marginBottom: '4px' }}>
                        <Users size={18} />
                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>DEPLOYED</span>
                    </div>
                    <div className={styles.kpiBig} style={{ fontSize: '2rem' }}>{data.deployed}</div>
                </div>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', marginBottom: '4px' }}>
                        <UserCheck size={18} />
                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>STANDBY</span>
                    </div>
                    <div className={styles.kpiBig} style={{ fontSize: '2rem', color: '#94a3b8' }}>{data.available}</div>
                </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {teams.map((t, idx) => (
                    <div key={idx} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9'
                    }}>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{t.role}</div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {/* Visual Bar */}
                            <div style={{ width: '60px', height: '6px', background: '#cbd5e1', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: `${(t.count / data.total_crew) * 100 * 3}%`, height: '100%', background: '#3b82f6' }} />
                            </div>
                            <span style={{ fontSize: '0.9rem', fontWeight: 700, minWidth: '24px', textAlign: 'right' }}>{t.count}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
