import React, { useState } from 'react';
import {
    Car, AlertTriangle, Play, Battery, Activity, Wifi, Lock, Video
} from 'lucide-react';
import styles from './FleetDashboardPage.module.css';

// Mock Data as per design brief
const INCIDENTS = [
    { id: 'GSV-142', type: 'Overspeeding', severity: 'High', location: 'Taxiway Charlie', time: '23 min ago', status: 'New', x: 500, y: 175 },
    { id: 'GSV-089', type: 'Collision Detected', severity: 'High', location: 'Apron Stand 42', time: '18 min ago', status: 'Ack', x: 400, y: 410 },
    { id: 'GSV-203', type: 'Harsh Braking', severity: 'Medium', location: 'Terminal 2', time: '15 min ago', status: 'New', x: 340, y: 100 },
    { id: 'GSV-156', type: 'Unauthorized Move', severity: 'High', location: 'Maintenance', time: '10 min ago', status: 'New', x: 120, y: 425 },
    { id: 'GSV-234', type: 'Engine Tamper', severity: 'Medium', location: 'Terminal 3', time: '5 min ago', status: 'Dispatched', x: 500, y: 90 },
    { id: 'GSV-087', type: 'Door Open Alert', severity: 'Low', location: 'Terminal 1', time: 'Just now', status: 'New', x: 180, y: 225 },
];

export const FleetDashboardPage: React.FC = () => {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const selectedIncident = INCIDENTS.find(i => i.id === selectedId);

    const getSeverityColor = (sev: string) => {
        switch (sev) {
            case 'High': return '#DC2626';
            case 'Medium': return '#F59E0B';
            default: return '#3B82F6';
        }
    };

    return (
        <div className={styles.pageContainer}>
            {/* Left Column */}
            <div className={styles.leftColumn}>
                <div className={styles.columnHeader}>
                    <span className={styles.sectionTitle}>Fleet Summary</span>
                </div>

                <div className={styles.summaryGrid}>
                    <div className={styles.kpiTile} style={{ background: '#f9fafb' }}>
                        <span className={styles.kpiNumber} style={{ color: '#111827' }}>6</span>
                        <span className={styles.kpiLabel}>Total Vehicles</span>
                    </div>
                    <div className={styles.kpiTile} style={{ background: '#ecfdf5', borderColor: '#d1fae5' }}>
                        <span className={styles.kpiNumber} style={{ color: '#047857' }}>4</span>
                        <span className={styles.kpiLabel}>Active</span>
                    </div>
                    <div className={styles.kpiTile} style={{ background: '#fef2f2', borderColor: '#fee2e2' }}>
                        <span className={styles.kpiNumber} style={{ color: '#b91c1c' }}>3</span>
                        <span className={styles.kpiLabel}>In Alert</span>
                    </div>
                    <div className={styles.kpiTile} style={{ background: '#f9fafb' }}>
                        <span className={styles.kpiNumber} style={{ color: '#6b7280' }}>1</span>
                        <span className={styles.kpiLabel}>Offline</span>
                    </div>
                </div>

                <div className={styles.queueHeader}>Fleet Incidents (6)</div>
                <div className={styles.queueList}>
                    {INCIDENTS.map(inc => {
                        const isSelected = selectedId === inc.id;
                        const borderColor = getSeverityColor(inc.severity);
                        return (
                            <div
                                key={inc.id}
                                className={`${styles.queueItem} ${isSelected ? styles.queueItemSelected : ''}`}
                                style={{ borderLeftColor: isSelected ? 'transparent' : borderColor }}
                                onClick={() => setSelectedId(inc.id)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontWeight: 600, fontSize: '12px' }}>{inc.id}</span>
                                    <span className={styles.statusBadge} style={{
                                        background: isSelected ? 'rgba(255,255,255,0.2)' : '#fee2e2',
                                        color: isSelected ? 'white' : '#b91c1c'
                                    }}>{inc.status}</span>
                                </div>
                                <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>{inc.type}</div>
                                <div className={styles.textMuted} style={{ fontSize: '12px', marginBottom: '8px' }}>{inc.location}</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span className={styles.textMuted} style={{ fontSize: '12px' }}>{inc.time}</span>
                                    {isSelected ? <span style={{ fontSize: '10px' }}>● Selected</span> : <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: borderColor }} />}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Center Column */}
            <div className={styles.centerColumn}>
                <div className={styles.mapCard}>
                    <div className={styles.mapHeader}>
                        <div>
                            <div className={styles.sectionTitle}>Master Fleet Map</div>
                            <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>Real-time vehicle tracking and incident visualization</div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className={styles.btnSecondary}>Vehicles</button>
                            <button className={styles.btnPrimary}>Incidents</button>
                        </div>
                    </div>
                    <div className={styles.mapCanvas}>
                        <svg viewBox="0 0 800 500" style={{ width: '100%', height: '100%' }}>
                            {/* Grid */}
                            <defs>
                                <pattern id="smallGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="4 4" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#smallGrid)" />

                            {/* Runways */}
                            <rect x="50" y="200" width="700" height="60" fill="#cbd5e1" rx="4" />
                            <text x="80" y="240" fontSize="20" fontWeight="bold" fill="#64748b" letterSpacing="4">01L</text>

                            <rect x="50" y="320" width="700" height="60" fill="#cbd5e1" rx="4" />
                            <text x="720" y="360" fontSize="20" fontWeight="bold" fill="#64748b" letterSpacing="4" textAnchor="end">19R</text>

                            {/* Terminals */}
                            <rect x="100" y="40" width="120" height="80" fill="white" stroke="#94a3b8" rx="4" />
                            <text x="160" y="90" fontSize="16" fontWeight="bold" fill="#475569" textAnchor="middle">T1</text>

                            <rect x="260" y="40" width="120" height="80" fill="white" stroke="#94a3b8" rx="4" />
                            <text x="320" y="90" fontSize="16" fontWeight="bold" fill="#475569" textAnchor="middle">T2</text>

                            <rect x="420" y="40" width="120" height="80" fill="white" stroke="#94a3b8" rx="4" />
                            <text x="480" y="90" fontSize="16" fontWeight="bold" fill="#475569" textAnchor="middle">T3</text>

                            <rect x="580" y="40" width="120" height="80" fill="white" stroke="#94a3b8" rx="4" />
                            <text x="640" y="90" fontSize="16" fontWeight="bold" fill="#475569" textAnchor="middle">T4</text>

                            {/* Incident Markers */}
                            {INCIDENTS.map(inc => {
                                const isSelected = selectedId === inc.id;
                                const color = getSeverityColor(inc.severity);
                                return (
                                    <g
                                        key={inc.id}
                                        transform={`translate(${inc.x}, ${inc.y})`}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => setSelectedId(inc.id)}
                                    >
                                        {isSelected && (
                                            <circle r="25" fill={color} opacity="0.2">
                                                <animate attributeName="r" values="15;25;15" dur="2s" repeatCount="indefinite" />
                                                <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
                                            </circle>
                                        )}
                                        <circle r={isSelected ? 14 : 10} fill={color} stroke="white" strokeWidth="2" />
                                        <text y="4" fontSize={isSelected ? 12 : 10} textAnchor="middle" fill="white">🚗</text>
                                    </g>
                                );
                            })}
                        </svg>

                        <div className={styles.mapLegend}>
                            <div className={styles.sectionTitle} style={{ marginBottom: '8px' }}>Legend</div>
                            <div className={styles.legendRow}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#dc2626' }} /> Critical
                            </div>
                            <div className={styles.legendRow}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} /> Warning
                            </div>
                            <div className={styles.legendRow}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }} /> Normal
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column */}
            <div className={styles.rightColumn}>
                {selectedIncident ? (
                    <>
                        {/* Header */}
                        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#111827' }}>{selectedIncident.id}</div>
                                    <div style={{ fontSize: '14px', color: '#6b7280' }}>Driver: J. Martinez</div>
                                </div>
                                <span className={styles.statusBadge} style={{ background: '#fee2e2', color: '#b91c1c' }}>{selectedIncident.status}</span>
                            </div>
                            <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '12px' }}>Last Update: {selectedIncident.time}</div>
                        </div>

                        {/* Content Scroll */}
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            {/* Section 1: Alert */}
                            <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
                                <div className={styles.sectionTitle} style={{ marginBottom: '12px' }}>Event Details</div>
                                <div style={{ background: '#fef2f2', borderLeft: '4px solid #dc2626', padding: '16px', borderRadius: '6px' }}>
                                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#991b1b', marginBottom: '4px' }}>{selectedIncident.type}</div>
                                    <div style={{ fontSize: '12px', color: '#7f1d1d', marginBottom: '8px' }}>Vehicle exceeded speed limit: 48 km/h in 25 km/h zone</div>
                                    <div style={{ fontSize: '10px', color: '#b91c1c' }}>Location: {selectedIncident.location}</div>
                                </div>
                            </div>

                            {/* Section 2: Telemetry */}
                            <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
                                <div className={styles.sectionTitle} style={{ marginBottom: '12px' }}>Vehicle Telemetry</div>
                                <div className={styles.telemetryRow}>
                                    <div style={{ display: 'flex', gap: '8px', color: '#374151' }}><Activity size={16} /> Speed</div>
                                    <div style={{ fontWeight: 700, color: '#dc2626' }}>48 km/h</div>
                                </div>
                                <div className={styles.telemetryRow}>
                                    <div style={{ display: 'flex', gap: '8px', color: '#374151' }}><Battery size={16} /> Fuel Level</div>
                                    <div style={{ fontWeight: 700 }}>68%</div>
                                </div>
                                <div className={styles.telemetryRow}>
                                    <div style={{ display: 'flex', gap: '8px', color: '#374151' }}><Activity size={16} /> Engine Status</div>
                                    <div className={styles.statusBadge} style={{ background: '#dcfce7', color: '#15803d' }}>RUNNING</div>
                                </div>
                                <div className={styles.telemetryRow}>
                                    <div style={{ display: 'flex', gap: '8px', color: '#374151' }}><Lock size={16} /> Door Status</div>
                                    <div className={styles.statusBadge} style={{ background: '#f3f4f6', color: '#374151' }}>CLOSED</div>
                                </div>
                            </div>

                            {/* Section 3: Video */}
                            <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
                                <div className={styles.sectionTitle} style={{ marginBottom: '12px' }}>Driver ADAS / Dashcam</div>
                                <div style={{
                                    aspectRatio: '16/9', background: '#111827', borderRadius: '8px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
                                }}>
                                    <Video size={48} color="#4b5563" />
                                    <div style={{
                                        position: 'absolute', bottom: '10px', left: '10px',
                                        background: 'rgba(0,0,0,0.6)', color: 'white',
                                        padding: '2px 8px', borderRadius: '4px', fontSize: '10px'
                                    }}>Live View</div>
                                </div>
                                <div style={{ textAlign: 'center', fontSize: '10px', color: '#9ca3af', marginTop: '8px' }}>Encrypted Stream • Low Latency</div>
                            </div>

                            {/* Section 4: Sensors */}
                            <div style={{ padding: '20px' }}>
                                <div className={styles.sectionTitle} style={{ marginBottom: '12px' }}>Sensor Summary</div>
                                <div>
                                    {['GPS', 'Accelerometer', 'Gyroscope', 'Fuel Sensor', 'Door Sensor', 'LIDAR'].map(s => (
                                        <span key={s} className={styles.sensorChip}>{s}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{ padding: '20px', borderTop: '2px solid #e5e7eb', background: '#f9fafb' }}>
                            <button className={`${styles.btnFull} ${styles.btnActionPrimary}`}>Acknowledge Event</button>
                            <button className={`${styles.btnFull} ${styles.btnActionSecondary}`}>Dispatch Supervisor</button>
                        </div>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                        <Car size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                        <div style={{ fontSize: '14px' }}>Select a fleet incident to view details</div>
                    </div>
                )}
            </div>
        </div>
    );
};
