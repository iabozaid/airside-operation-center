import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useOpsState } from '../state/useOpsState';
import { Shield, BarChart3, History, Layers, AlertTriangle, Clock, MapPin, CheckCircle, User, ChevronRight, Filter } from 'lucide-react';
import styles from './OperationsDashboardPage.module.css';

// Types
type TabType = 'active' | 'escalated' | 'resolved';
type PanelMode = 'control' | 'intel' | 'history';

export const OperationsDashboardPage: React.FC = () => {
    // 1. URL State Management
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // Derived State from URL
    const activeTab = (searchParams.get('tab') as TabType) || 'active';
    const activePanel = (searchParams.get('panel') as PanelMode) || 'control';
    const selectedId = searchParams.get('incidentId');
    const layersParam = searchParams.get('layers');
    const activeLayers = new Set(layersParam ? layersParam.split(',') : ['fleet', 'sensors']);
    const isEscalationWatch = searchParams.get('watch') === 'true';

    // Global Data
    const { state, claimIncident } = useOpsState();

    // Local ticker for SLA
    const [now, setNow] = useState(Date.now());
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 5000); // Update every 5s
        return () => clearInterval(interval);
    }, []);

    // 2. State Updaters
    const updateParams = (updates: Record<string, string | null>) => {
        const newParams = new URLSearchParams(searchParams);
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null) newParams.delete(key);
            else newParams.set(key, value);
        });
        setSearchParams(newParams, { replace: true });
    };

    const handleTabChange = (tab: TabType) => updateParams({ tab });
    const handlePanelChange = (panel: PanelMode) => updateParams({ panel });
    const handleSelectIncident = (id: string) => {
        updateParams({ incidentId: id, panel: 'control' });
    };

    const toggleLayer = (layer: string) => {
        const newLayers = new Set(activeLayers);
        if (newLayers.has(layer)) newLayers.delete(layer);
        else newLayers.add(layer);
        updateParams({ layers: Array.from(newLayers).join(',') });
    };

    const toggleWatchMode = () => updateParams({ watch: String(!isEscalationWatch) });

    // 3. Data Processing & Filtering
    const allIncidents = state.incidents.map(inc => {
        // SLA Calculation
        const opened = new Date(inc.timestamp).getTime(); // Note: timestamp in state is already string formatted, but raw has created_at properly? 
        // fallback to mocking opened time based on ID for demo stability if raw is missing
        const slaTarget = (inc.raw as any).sla_minutes || 60;
        // Approximation for demo: existing "timestamp" is a time string (HH:MM), we need relative time.
        // For accurate SLA in demo, we parse the ISO timestamp if available in raw, else assume 30m ago.

        let elapsedMinutes = 0;
        if ((inc.raw as any).timestamp) {
            const created = new Date((inc.raw as any).timestamp).getTime();
            elapsedMinutes = Math.floor((now - created) / 60000);
        } else {
            // Fallback for non-demo data
            elapsedMinutes = 15;
        }

        const remaining = slaTarget - elapsedMinutes;
        const isBreached = remaining < 0;
        const slaStatus = isBreached ? 'breached' : remaining < 15 ? 'critical' : remaining < 30 ? 'warning' : 'normal';

        return {
            ...inc,
            sla: { remaining, status: slaStatus, originalMinutes: slaTarget },
            isEscalated: (inc.raw as any).escalated === true
        };
    });

    const filteredIncidents = allIncidents.filter(inc => {
        if (activeTab === 'resolved') return inc.status === 'resolved';
        if (activeTab === 'escalated') return inc.isEscalated;
        // active tab: open/in_progress but not resolved
        return inc.status !== 'resolved';
    });

    const displayedIncidents = isEscalationWatch
        ? allIncidents.filter(i => i.isEscalated || i.sla.status === 'breached' || i.sla.status === 'critical')
        : filteredIncidents;

    // Default Selection Logic
    useEffect(() => {
        if (!selectedId && displayedIncidents.length > 0) {
            handleSelectIncident(displayedIncidents[0].id);
        }
    }, [activeTab, isEscalationWatch, displayedIncidents.length]);

    const selectedIncident = allIncidents.find(i => i.id === selectedId);

    // Helpers
    const getSeverityColor = (p: string) => {
        if (p === 'critical' || p === 'high') return '#DC2626';
        if (p === 'warning' || p === 'medium') return '#F59E0B';
        return '#22C55E';
    };

    // 4. Render Components
    return (
        <div className={styles.pageContainer}>
            {/* LEFT COLUMN: QUEUE */}
            <div className={styles.leftColumn}>
                <div className={styles.panelHeader}>
                    <div className={styles.sectionTitle}>Incident & Ticket Queue v2</div>
                    <div className={styles.subTitle}>{displayedIncidents.length} Active Items</div>
                </div>

                <div className={styles.tabBar}>
                    <button className={`${styles.tab} ${activeTab === 'active' ? styles.tabActive : ''}`} onClick={() => handleTabChange('active')}>
                        Active <span className={styles.tabBadge}>{allIncidents.filter(i => i.status !== 'resolved').length}</span>
                    </button>
                    <button className={`${styles.tab} ${styles.escalationTab} ${activeTab === 'escalated' ? styles.tabActive : ''}`} onClick={() => handleTabChange('escalated')}>
                        Escalated <span className={styles.tabBadge}>{allIncidents.filter(i => i.isEscalated).length}</span>
                    </button>
                    <button className={`${styles.tab} ${activeTab === 'resolved' ? styles.tabActive : ''}`} onClick={() => handleTabChange('resolved')}>
                        Resolved <span className={styles.tabBadge}>{allIncidents.filter(i => i.status === 'resolved').length}</span>
                    </button>
                </div>

                <div className={styles.incidentList}>
                    {displayedIncidents.map(inc => {
                        const isSelected = inc.id === selectedId;
                        const sevColor = getSeverityColor(inc.priority);
                        return (
                            <div key={inc.id}
                                className={`${styles.incidentCard} ${isSelected ? styles.incidentCardSelected : ''}`}
                                onClick={() => handleSelectIncident(inc.id)}>
                                <div className={styles.severityStrip} style={{ background: sevColor }} />
                                <div className={styles.cardContent}>
                                    <div className={styles.cardRow}>
                                        <span className={styles.cardId}>#{inc.id}</span>
                                        {inc.isEscalated && <AlertTriangle size={12} color={isSelected ? 'white' : '#DC2626'} />}
                                    </div>
                                    <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>{inc.title}</div>
                                    <div className={styles.cardRow} style={{ marginBottom: '8px' }}>
                                        <div style={{ fontSize: '11px', opacity: 0.8 }}>{(inc.raw as any).location_label || 'Terminal area'}</div>
                                    </div>
                                    <div className={styles.cardRow}>
                                        <div className={`${styles.slaBadge} ${isSelected ? '' : styles[`sla${inc.sla.status.charAt(0).toUpperCase() + inc.sla.status.slice(1)}`]}`}>
                                            <Clock size={10} />
                                            {inc.sla.remaining < 0 ? 'BREACHED' : `${inc.sla.remaining}m`}
                                        </div>
                                        <span className={styles.statusChip}>{inc.status}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* CENTER COLUMN: MAP */}
            <div className={styles.centerColumn}>
                <div className={styles.mapHeader}>
                    <div>
                        <div className={styles.sectionTitle}>Master Airport Map</div>
                        <div className={styles.liveBadge}>
                            <div className={styles.pulsingDot} style={{ background: isEscalationWatch ? '#DC2626' : '#22C55E' }} />
                            {isEscalationWatch ? 'ESCALATION WATCH ACTIVE' : 'LIVE TRAFFIC • NORMAL OPS'}
                        </div>
                    </div>
                    <button className={`${styles.watchModeBtn} ${isEscalationWatch ? styles.watchModeActive : ''}`} onClick={toggleWatchMode}>
                        <AlertTriangle size={14} /> Escalation Watch
                    </button>
                </div>

                <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#e5e7eb' }}>
                    {/* Simplified SVG Map */}
                    <svg viewBox="0 0 1000 600" style={{ width: '100%', height: '100%' }}>
                        <rect width="100%" height="100%" fill="#f3f4f6" />
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e5e5" strokeWidth="1" />
                        </pattern>
                        <rect width="100%" height="100%" fill="url(#grid)" />

                        {/* Runways */}
                        <rect x="150" y="200" width="800" height="40" rx="4" fill="#94a3b8" />
                        <text x="170" y="225" fill="white" fontWeight="bold">01L</text>
                        <rect x="150" y="350" width="800" height="40" rx="4" fill="#94a3b8" />
                        <text x="170" y="375" fill="white" fontWeight="bold">01R</text>

                        {/* Terminals */}
                        {[200, 400, 600, 800].map((x, i) => (
                            <rect key={i} x={x} y="50" width="120" height="80" fill="white" stroke="#cbd5e1" strokeWidth="2" rx="4" />
                        ))}

                        {/* Layers: Fleet */}
                        {activeLayers.has('fleet') && (
                            <>
                                <circle cx="250" cy="450" r="10" fill="#22C55E" opacity="0.8" />
                                <text x="250" y="454" textAnchor="middle" fontSize="10" fill="white">🚗</text>
                                <circle cx="550" cy="280" r="10" fill="#22C55E" opacity="0.8" />
                                <text x="550" y="284" textAnchor="middle" fontSize="10" fill="white">🚗</text>
                            </>
                        )}

                        {/* Layers: Robots */}
                        {activeLayers.has('robots') && (
                            <>
                                <circle cx="350" cy="480" r="10" fill="#8B5CF6" opacity="0.8" />
                                <text x="350" y="484" textAnchor="middle" fontSize="10" fill="white">🤖</text>
                            </>
                        )}

                        {/* Incidents Markers */}
                        {displayedIncidents.map((inc, idx) => {
                            // Mock coords based on index if not present
                            const mx = (idx * 150 + 200) % 800 + 100;
                            const my = (idx * 70 + 100) % 400 + 100;
                            const isSelected = inc.id === selectedId;
                            const color = getSeverityColor(inc.priority);

                            return (
                                <g key={inc.id} onClick={() => handleSelectIncident(inc.id)} style={{ cursor: 'pointer' }}>
                                    {(isSelected || inc.isEscalated || isEscalationWatch) && (
                                        <circle cx={mx} cy={my} r={isSelected ? 30 : 25} fill="none" stroke={inc.isEscalated ? '#DC2626' : '#3B82F6'} strokeWidth="2">
                                            <animate attributeName="r" from="20" to="40" dur="1.5s" repeatCount="indefinite" />
                                            <animate attributeName="opacity" from="1" to="0" dur="1.5s" repeatCount="indefinite" />
                                        </circle>
                                    )}
                                    <circle cx={mx} cy={my} r="14" fill={color} stroke="white" strokeWidth="2" />
                                    <text x={mx} y={my + 4} textAnchor="middle" fontSize="12" fill="white">⚠️</text>
                                </g>
                            );
                        })}
                    </svg>

                    <div className={styles.layerControls}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', alignSelf: 'center', marginRight: '4px' }}>LAYERS:</div>
                        <button className={`${styles.layerToggle} ${activeLayers.has('fleet') ? styles.layerActive : ''}`} onClick={() => toggleLayer('fleet')}>Fleet</button>
                        <button className={`${styles.layerToggle} ${activeLayers.has('robots') ? styles.layerActive : ''}`} onClick={() => toggleLayer('robots')}>Robots</button>
                        <button className={`${styles.layerToggle} ${activeLayers.has('sensors') ? styles.layerActive : ''}`} onClick={() => toggleLayer('sensors')}>Sensors</button>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: CONTEXT */}
            <div className={styles.rightColumn}>
                <div className={styles.modeSwitcher}>
                    <button className={`${styles.modeBtn} ${activePanel === 'control' ? styles.modeBtnActive : ''}`} onClick={() => handlePanelChange('control')}>
                        <Shield size={16} /> Control
                    </button>
                    <button className={`${styles.modeBtn} ${activePanel === 'intel' ? styles.modeBtnActive : ''}`} onClick={() => handlePanelChange('intel')}>
                        <BarChart3 size={16} /> Intel
                    </button>
                    <button className={`${styles.modeBtn} ${activePanel === 'history' ? styles.modeBtnActive : ''}`} onClick={() => handlePanelChange('history')}>
                        <History size={16} /> History
                    </button>
                </div>

                <div className={styles.panelContent}>
                    {activePanel === 'control' && selectedIncident ? (
                        <>
                            <div className={styles.controlHeader}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <span style={{ fontSize: '24px' }}>
                                        {selectedIncident.priority === 'high' ? '🔴' : selectedIncident.priority === 'medium' ? '🟡' : '🟢'}
                                    </span>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '16px', fontWeight: 700 }}>{selectedIncident.title}</div>
                                        <div style={{ fontSize: '12px', color: '#6B7280' }}>Opened {selectedIncident.timestamp}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    <span className={styles.statusChip} style={{ background: '#EFF6FF', color: '#1E40AF' }}>#{selectedIncident.id}</span>
                                    {selectedIncident.isEscalated && <span className={styles.statusChip} style={{ background: '#FEE2E2', color: '#991B1B' }}>ESCALATED</span>}
                                    <span className={styles.statusChip}>{selectedIncident.status.toUpperCase()}</span>
                                </div>
                            </div>

                            <div className={styles.detailSection}>
                                <div className={styles.sectionTitle} style={{ marginBottom: '12px' }}>Location & Context</div>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <div style={{ padding: '8px', background: '#F3F4F6', borderRadius: '8px' }}><MapPin size={20} color="#6B7280" /></div>
                                    <div>
                                        <div style={{ fontWeight: 700 }}>{(selectedIncident.raw as any).location_label}</div>
                                        <div style={{ fontSize: '12px', color: '#6B7280' }}>Zone 4 • Sensor Node B</div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.detailSection}>
                                <div className={styles.sectionTitle} style={{ marginBottom: '12px' }}>Actions</div>
                                <button className={styles.actionBtn} onClick={() => claimIncident(selectedIncident.id)}>
                                    <CheckCircle size={18} /> Acknowledge Incident
                                </button>
                                <div className={styles.secondaryGrid}>
                                    <button className={styles.secBtn} onClick={() => alert('Assigning...')}>
                                        <User size={14} /> Assign Team
                                    </button>
                                    <button className={`${styles.secBtn} ${styles.secBtnEscalate}`} onClick={() => alert('Escalating...')}>
                                        <AlertTriangle size={14} /> Escalate
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : activePanel === 'intel' ? (
                        <div className={styles.intelGrid}>
                            <div className={styles.kpiCard}>
                                <span className={styles.kpiVal}>{allIncidents.filter(i => i.status !== 'resolved').length}</span>
                                <span className={styles.kpiLabel}>Active Incidents</span>
                            </div>
                            <div className={styles.kpiCard}>
                                <span className={styles.kpiVal} style={{ color: '#DC2626' }}>{allIncidents.filter(i => i.isEscalated).length}</span>
                                <span className={styles.kpiLabel}>Escalated</span>
                            </div>
                            <div className={styles.kpiCard}>
                                <span className={styles.kpiVal} style={{ color: '#D97706' }}>{allIncidents.filter(i => i.sla.status === 'breached').length}</span>
                                <span className={styles.kpiLabel}>SLA Breaches</span>
                            </div>
                        </div>
                    ) : activePanel === 'history' ? (
                        <div className={styles.emptyState}>
                            <History size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                            <div>Historical timeline unavailable in demo mode.</div>
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <Shield size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                            <div>Select an incident to view controls</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
