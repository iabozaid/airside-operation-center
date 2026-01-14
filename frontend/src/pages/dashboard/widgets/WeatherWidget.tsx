import React from 'react';
import { CloudRain, Wind, Eye, CloudOff } from 'lucide-react';
import styles from '../../MasterDashboardPage.module.css';

// API: { temp_c: number, wind_kph: number, visibility_km: number, condition: string }
interface APIWeatherResponse {
    temp_c: number;
    wind_kph: number;
    visibility_km: number; // API returns number
    condition: string;
}

interface WeatherWidgetProps {
    data: APIWeatherResponse | null;
    isLoading: boolean;
    error: string | null;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ data, isLoading, error }) => {
    if (isLoading) return <div className={styles.loading}>Checking Conditions...</div>;

    if (error || !data) {
        return (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                <CloudOff size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <div style={{ fontWeight: 600 }}>Weather Data Unavailable</div>
            </div>
        );
    }

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <CloudRain size={64} color="#3b82f6" />
                <div className={styles.kpiBig} style={{ marginTop: '16px' }}>{data.temp_c}°C</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>{data.condition}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '24px' }}>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Wind size={20} color="#64748b" />
                    <div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>WIND</div>
                        <div style={{ fontWeight: 700, color: '#1e293b' }}>{data.wind_kph} km/h</div>
                    </div>
                </div>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Eye size={20} color="#64748b" />
                    <div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>VISIBILITY</div>
                        <div style={{ fontWeight: 700, color: '#1e293b' }}>{data.visibility_km} km</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
