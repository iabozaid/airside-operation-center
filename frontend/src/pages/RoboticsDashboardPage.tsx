import React, { useState } from 'react';
import { Camera, Battery, Wifi, Activity, Server, Video, AlertCircle } from 'lucide-react';
import styles from './RoboticsDashboardPage.module.css';

// Mock Data
const INCIDENTS = [
    { id: 'PATROL-07', type: 'Suspicious Bag Detected', severity: 'Critical', location: 'Terminal 2 • Baggage Claim 3', ai: 94, time: '23 min ago', status: 'New', x: 340, y: 375 },
    { id: 'PATROL-04', type: 'Bag Tampering (AI)', severity: 'Critical', location: 'Terminal 3 • Checkpoint B', ai: 87, time: '18 min ago', status: 'Ack', x: 500, y: 150 },
    { id: 'PATROL-12', type: 'Unauthorized Handling', severity: 'Warning', location: 'Terminal 1 • Belt 5', ai: 76, time: '15 min ago', status: 'New', x: 180, y: 350 },
    { id: 'PATROL-09', type: 'Abandoned Bag', severity: 'Critical', location: 'Terminal 4 • Gate 28', ai: 98, time: '10 min ago', status: 'Dispatched', x: 660, y: 100 },
    { id: 'PATROL-15', type: 'Baggage Jam', severity: 'Warning', location: 'Terminal 1 • Belt 2', ai: 100, time: '5 min ago', status: 'New', x: 180, y: 425 },
    { id: 'PATROL-03', type: 'Conveyor Obstruction', severity: 'Normal', location: 'Terminal 2 • Loading 4', ai: 82, time: 'Just now', status: 'New', x: 340, y: 425 },
];

export const RoboticsDashboardPage: React.FC = () => {
    React.useEffect(() => console.log("RoboticsDashboardPage Mounted"), []);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const selectedIncident = INCIDENTS.find(i => i.id === selectedId);

    const getSeverityColor = (sev: string) => {
        switch (sev) {
            case 'Critical': return '#DC2626';
            case 'Warning': return '#F59E0B';
            default: return '#3B82F6';
        }
    };

    return (
        <div className={styles.pageContainer}>
            {/* Left Column */}
            <div className={styles.leftColumn}>
                <div className={styles.columnHeader}>
                    <span className={styles.sectionTitle}>Robotics Fleet Status</span>
                </div>

                <div className={styles.kpiSummary}>
                    <div className={styles.kpiTopTile}>
                        <span style={{ fontSize: '10px', color: '#6b7280' }}>Total Robots</span>
                        <span className={styles.kpiNumber}>15</span>
                    </div>
                    <div className={styles.kpiGrid}>
                        <div className={styles.kpiSmallTile} style={{ background: '#ecfdf5', borderColor: '#bbf7d0' }}>
                            <span className={styles.kpiNumber} style={{ color: '#047857' }}>11</span>
                            <span style={{ fontSize: '10px', color: '#047857' }}>Functional</span>
                        </div>
                        <div className={styles.kpiSmallTile} style={{ background: '#fef9c3', borderColor: '#fde047' }}>
                            <span className={styles.kpiNumber} style={{ color: '#ca8a04' }}>2</span>
                            <span style={{ fontSize: '10px', color: '#ca8a04' }}>Charging</span>
                        </div>
                        <div className={styles.kpiSmallTile}>
                            <span className={styles.kpiNumber} style={{ color: '#6b7280' }}>1</span>
                            <span style={{ fontSize: '10px', color: '#6b7280' }}>Maintenance</span>
                        </div>
                        <div className={styles.kpiSmallTile} style={{ background: '#fef2f2', borderColor: '#fecaca' }}>
                            <span className={styles.kpiNumber} style={{ color: '#b91c1c' }}>1</span>
                            <span style={{ fontSize: '10px', color: '#b91c1c' }}>Offline</span>
                        </div>
                    </div>
                </div>

                <div className={styles.queueHeader}>Surveillance Incidents (6)</div>
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
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ fontWeight: 600, fontSize: '12px' }}>{inc.id}</span>
                                    <span className={styles.statusBadge} style={{
                                        background: isSelected ? 'rgba(255,255,255,0.2)' : '#dc2626',
                                        color: isSelected ? 'white' : 'white'
                                    }}>{inc.status}</span>
                                </div>
                                <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>{inc.type}</div>
                                <div className={styles.textMuted} style={{ fontSize: '12px', marginBottom: '8px' }}>
                                    {inc.location.split('•').map((part, i) => (
                                        <div key={i}>{part.trim()}</div>
                                    ))}
                                </div>
                                <div style={{ color: isSelected ? '#ddd6fe' : '#7c3aed', fontSize: '10px', fontWeight: 600, marginBottom: '8px' }}>
                                    AI Confidence: {inc.ai}%
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span className={styles.textMuted} style={{ fontSize: '10px' }}>{inc.time}</span>
                                    {isSelected ? null : <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: borderColor }} />}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Center Column */}
            <div className={styles.centerColumn}>
                <div className={styles.mapCard}>
                    <div className={styles.mapHeader}>
                        <div>
                            <div className={styles.sectionTitle}>Robotics Surveillance Map</div>
                            <div style={{ fontSize: '10px', color: '#6b7280' }}>Live robot positions and AI detection overlays</div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className={`${styles.toggleBtn} ${styles.togglePrimary}`}>Robots</button>
                            <button className={`${styles.toggleBtn} ${styles.toggleSecondary}`}>AI Detections</button>
                            <button className={`${styles.toggleBtn} ${styles.toggleSecondary}`}>Patrol Routes</button>
                        </div>
                    </div>

                    <div className={styles.mapCanvas}>
                        {/* Live Badge */}
                        <div className={styles.liveBadge}>
                            <div className={styles.pulsingDot} />
                            11 Robots on Patrol
                        </div>

                        {/* SVG Map */}
                        <svg viewBox="0 0 800 500" style={{ width: '100%', height: '100%' }}>
                            <defs>
                                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)" />

                            {/* Zones */}
                            <g>
                                <rect x="100" y="350" width="150" height="120" fill="#f0f9ff" stroke="#3b82f6" strokeWidth="2" strokeDasharray="6 4" />
                                <text x="175" y="410" textAnchor="middle" fill="#3b82f6" fontSize="12" fontWeight="bold">BELT ZONE 1</text>
                            </g>
                            <g>
                                <rect x="280" y="350" width="150" height="120" fill="#f0f9ff" stroke="#3b82f6" strokeWidth="2" strokeDasharray="6 4" />
                                <text x="355" y="410" textAnchor="middle" fill="#3b82f6" fontSize="12" fontWeight="bold">BELT ZONE 2</text>
                            </g>

                            {/* Patrol Route */}
                            <path d="M 160 160 L 310 160 L 460 160 L 500 250 L 340 375" fill="none" stroke="#6366f1" strokeWidth="2" strokeDasharray="8 6" opacity="0.5" />

                            {/* Terminals */}
                            {[100, 250, 400, 550].map((x, i) => (
                                <g key={i}>
                                    <rect x={x} y="50" width="120" height="80" fill="white" stroke="#94a3b8" rx="4" />
                                    <text x={x + 60} y="100" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#475569">T{i + 1}</text>
                                </g>
                            ))}

                            {/* Robots */}
                            <g transform="translate(160, 160)">
                                <circle r="16" fill="#22c55e" opacity="0.2" />
                                <circle r="12" fill="#22c55e" />
                                <text y="5" textAnchor="middle" fontSize="12" fill="white">🤖</text>
                            </g>
                            <g transform="translate(310, 160)">
                                <circle r="16" fill="#22c55e" opacity="0.2" />
                                <circle r="12" fill="#22c55e" />
                                <text y="5" textAnchor="middle" fontSize="12" fill="white">🤖</text>
                            </g>
                            <g transform="translate(610, 370)">
                                <circle r="16" fill="#eab308" opacity="0.2" />
                                <circle r="12" fill="#eab308" />
                                <text y="5" textAnchor="middle" fontSize="12" fill="white">🔋</text>
                            </g>

                            {/* Incidents */}
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
                                        {(isSelected || inc.ai > 90) && (
                                            <circle r="25" fill={color} opacity="0.2">
                                                <animate attributeName="r" values="15;25;15" dur="2s" repeatCount="indefinite" />
                                                <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
                                            </circle>
                                        )}
                                        <circle r={isSelected ? 14 : 10} fill={color} stroke="white" strokeWidth={isSelected ? 3 : 2} />
                                        <text y="5" textAnchor="middle" fontSize={isSelected ? 14 : 12} fill="white">👜</text>

                                        {inc.ai > 85 && (
                                            <g transform="translate(10, -10)">
                                                <circle r="8" fill="#8b5cf6" stroke="white" strokeWidth="2" />
                                                <text y="3" textAnchor="middle" fontSize="8" fontWeight="bold" fill="white">AI</text>
                                            </g>
                                        )}
                                    </g>
                                )
                            })}

                        </svg>

                        <div className={styles.mapLegend}>
                            <div className={styles.sectionTitle} style={{ marginBottom: '8px' }}>Legend</div>
                            {/* Legend Items */}
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '10px', marginBottom: '4px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} /> Functional Robot
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '10px', marginBottom: '4px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#eab308' }} /> Charging
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '10px', marginBottom: '4px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#dc2626' }} /> Critical Incident
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '10px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8b5cf6' }} /> AI Detection
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column */}
            <div className={styles.rightColumn}>
                {selectedIncident ? (
                    <>
                        <div className={styles.detailsHeader}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <div>
                                    <div style={{ fontSize: '18px', fontWeight: 800 }}>{selectedIncident.id}</div>
                                    <div style={{ fontSize: '14px', color: '#6b7280' }}>Role: Surveillance / Patrol</div>
                                </div>
                                <span className={styles.statusBadge} style={{ background: '#22c55e' }}>Functional</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                                <span style={{ fontSize: '10px', color: '#6b7280' }}>Battery Level</span>
                                <div style={{ flex: 1, height: '8px', background: '#e5e7eb', borderRadius: '4px' }}>
                                    <div style={{ width: '78%', height: '100%', background: '#22c55e', borderRadius: '4px' }} />
                                </div>
                                <span style={{ fontSize: '12px', fontWeight: 700, color: '#111827' }}>78%</span>
                            </div>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            {/* Camera */}
                            <div className={styles.section}>
                                <div className={styles.sectionTitle} style={{ marginBottom: '12px' }}>Live Robot Camera Feed</div>
                                <div className={styles.cameraFeed}>
                                    <Camera size={64} color="#6b7280" />
                                    <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '4px' }}>
                                        <div className={styles.camBadge} style={{ background: '#dc2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <div className={styles.pulsingDot} style={{ width: 6, height: 6 }} /> LIVE
                                        </div>
                                        <div className={styles.camBadge} style={{ background: '#8b5cf6' }}>AI ACTIVE</div>
                                    </div>
                                    <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontFamily: 'monospace' }}>14:23:45</div>
                                    <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'red' }} /> REC
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '10px', marginTop: '8px' }}>Live Surveillance Stream (Robot Camera)</div>
                            </div>

                            {/* Details */}
                            <div className={styles.section}>
                                <div className={styles.sectionTitle} style={{ marginBottom: '12px' }}>Incident Details</div>
                                <div className={styles.alertCard}>
                                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>{selectedIncident.type}</div>
                                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>AI detected unattended bag with suspicious thermal signature</div>
                                    <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '12px' }}>
                                        <div>Location: {selectedIncident.location.split('•')[0]}</div>
                                        <div>Zone: {selectedIncident.location.split('•')[1]}</div>
                                        <div>Detected: {selectedIncident.time}</div>
                                    </div>
                                </div>
                            </div>

                            {/* AI Box */}
                            <div className={styles.section}>
                                <div className={styles.sectionTitle} style={{ marginBottom: '12px' }}>AI Detections (Edge AI Box)</div>
                                <div className={styles.aiCard}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: '#111827', marginBottom: '4px' }}>
                                        <span>Bag Tampering</span>
                                        <span style={{ background: '#8b5cf6', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>94%</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#6b7280' }}>
                                        <span>2 min ago</span>
                                        <span>Source: Robot AI Box</span>
                                    </div>
                                </div>
                                <div className={styles.aiCard}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: '#111827', marginBottom: '4px' }}>
                                        <span>Suspicious Proximity</span>
                                        <span style={{ background: '#8b5cf6', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>72%</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#6b7280' }}>
                                        <span>5 min ago</span>
                                        <span>Source: Robot AI Box</span>
                                    </div>
                                </div>
                            </div>

                            {/* Telemetry */}
                            <div className={styles.section}>
                                <div className={styles.sectionTitle} style={{ marginBottom: '12px' }}>Robot Telemetry</div>
                                <div className={styles.telemetryRow}>
                                    <div style={{ display: 'flex', gap: '8px', fontSize: '14px', color: '#374151' }}><Battery size={16} color="#6b7280" /> Battery</div>
                                    <div style={{ width: '64px', height: '8px', background: '#e5e7eb', borderRadius: '99px' }}>
                                        <div style={{ width: '78%', height: '100%', background: '#22c55e', borderRadius: '99px' }} />
                                    </div>
                                </div>
                                <div className={styles.telemetryRow}>
                                    <div style={{ display: 'flex', gap: '8px', fontSize: '14px', color: '#374151' }}><Wifi size={16} color="#6b7280" /> Connectivity</div>
                                    <span style={{ background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '99px', fontSize: '10px', fontWeight: 700 }}>EXCELLENT</span>
                                </div>
                                <div className={styles.telemetryRow}>
                                    <div style={{ display: 'flex', gap: '8px', fontSize: '14px', color: '#374151' }}><Video size={16} color="#6b7280" /> Camera Status</div>
                                    <span style={{ background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '99px', fontSize: '10px', fontWeight: 700 }}>STREAMING</span>
                                </div>
                                <div className={styles.telemetryRow}>
                                    <div style={{ display: 'flex', gap: '8px', fontSize: '14px', color: '#374151' }}><Activity size={16} color="#6b7280" /> Sensor Health</div>
                                    <span style={{ background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '99px', fontSize: '10px', fontWeight: 700 }}>OPTIMAL</span>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className={styles.section} style={{ paddingTop: '20px', background: '#ffffff' }}>
                                <button className={`${styles.btn} ${styles.btnPrimary}`}>Acknowledge Incident</button>
                                <button className={`${styles.btn} ${styles.btnSecondary}`}>Dispatch Additional Robot</button>
                                <button className={`${styles.btn} ${styles.btnDanger}`}>Escalate to Human Patrol</button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#d1d5db' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
                        <div style={{ color: '#6b7280', fontSize: '14px' }}>Select a surveillance incident to view details</div>
                    </div>
                )}
            </div>
        </div>
    );
};
