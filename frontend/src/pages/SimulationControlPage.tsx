import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Square, AlertTriangle, Shield, CheckCircle2, FlaskConical } from 'lucide-react';
import styles from './SimulationControlPage.module.css';

// --- TYPES ---
type SimulationScenario = 'default' | 'fleet-safety' | 'baggage-robotics' | 'security' | 'custom';
type SimulationStatus = 'idle' | 'running' | 'completed';

interface ScenarioDefinition {
    id: SimulationScenario;
    name: string;
    description: string;
    injectedIncidents: string[];
    affectedModules: string[];
    estimatedDuration: string;
}

// --- CONFIG ---
const SCENARIOS: Record<SimulationScenario, ScenarioDefinition> = {
    'default': {
        id: 'default',
        name: "Default Demo Scenario",
        description: "Comprehensive demo scenario with mixed incident types for general overview.",
        injectedIncidents: [
            "Fleet Geofence Violation (Terminal 2)",
            "Vehicle Overspeed Event (Apron)",
            "Ground Collision Alert (Stand 42)"
        ],
        affectedModules: ["OPS", "Fleet"],
        estimatedDuration: "2-3 minutes"
    },
    'fleet-safety': {
        id: 'fleet-safety',
        name: "Fleet Safety Scenario",
        description: "Ground vehicle safety and compliance incidents focus.",
        injectedIncidents: [
            "Multiple Overspeed Violations",
            "Unauthorized Access (Apron)",
            "Collision Risk Detected"
        ],
        affectedModules: ["OPS", "Fleet"],
        estimatedDuration: "3-4 minutes"
    },
    'baggage-robotics': {
        id: 'baggage-robotics',
        name: "Baggage & Robotics Scenario",
        description: "Automated baggage handling and robotic surveillance events.",
        injectedIncidents: [
            "Suspicious Bag AI Detection",
            "Carousel Jam (Belt 4)",
            "Robot Navigation Error"
        ],
        affectedModules: ["OPS", "Robotics"],
        estimatedDuration: "4-5 minutes"
    },
    'security': {
        id: 'security',
        name: "Security Incident Scenario",
        description: "High-priority security and access control events.",
        injectedIncidents: [
            "Unauthorized Sector Access",
            "Suspicious Package Found",
            "Perimeter Breach Alert"
        ],
        affectedModules: ["OPS"],
        estimatedDuration: "3-4 minutes"
    },
    'custom': {
        id: 'custom',
        name: "Custom Scenario",
        description: "Configure custom incident injection parameters.",
        injectedIncidents: ["N/A"],
        affectedModules: [],
        estimatedDuration: "Variable"
    }
};

export const SimulationControlPage: React.FC = () => {
    // State
    const [selectedScenario, setSelectedScenario] = useState<SimulationScenario>('default');
    const [status, setStatus] = useState<SimulationStatus>('idle');
    const [progress, setProgress] = useState(0);
    const [lastRun, setLastRun] = useState<string | null>(null);
    const [activeCount, setActiveCount] = useState(0);

    const activeDef = SCENARIOS[selectedScenario];

    // Simulation Timer
    useEffect(() => {
        let interval: any;
        if (status === 'running') {
            interval = setInterval(() => {
                setProgress(prev => {
                    const next = prev + 2;
                    if (next >= 100) {
                        setStatus('completed');
                        setLastRun(new Date().toLocaleTimeString('en-GB', { hour12: false }));
                        return 100;
                    }
                    return next;
                });
            }, 100); // 5 sec run for demo speed (100 * 50ms) -> tweaked to 100ms * 50 steps = 5s
        }
        return () => clearInterval(interval);
    }, [status]);

    // Handlers
    const handleRun = () => {
        setStatus('running');
        setProgress(0);
        setActiveCount(activeDef.injectedIncidents.length);
    };

    const handleStop = () => {
        setStatus('idle');
        setProgress(0);
        setActiveCount(0);
    };

    const handleReset = () => {
        setStatus('idle');
        setProgress(0);
        setLastRun(null);
        setActiveCount(0);
    };

    return (
        <div className={styles.pageContainer}>
            {/* Header */}
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Simulation Control</h1>
                <div className={styles.pageSubtitle}>Controlled scenario injection for demonstration, training, and system testing</div>
            </div>

            <div className={styles.mainGrid}>

                {/* LEFT COLUMN */}
                <div className={styles.column}>

                    {/* PRIMARY CONTROL CARD */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <FlaskConical size={20} color="#2563EB" />
                            <div className={styles.cardTitle}>Simulation Control</div>
                        </div>
                        <div className={styles.cardBody}>

                            {/* Scenario Selector */}
                            <div>
                                <span className={styles.sectionLabel}>Select Scenario</span>
                                <div className={styles.scenarioGrid}>
                                    {(['default', 'fleet-safety', 'baggage-robotics', 'security', 'custom'] as SimulationScenario[]).map(key => {
                                        const def = SCENARIOS[key];
                                        const isSelected = selectedScenario === key;
                                        const isDisabled = key === 'custom';

                                        return (
                                            <button
                                                key={key}
                                                className={`
                                                    ${styles.scenarioBtn} 
                                                    ${isSelected ? styles.scenarioBtnActive : ''}
                                                    ${isDisabled ? styles.scenarioBtnDisabled : ''}
                                                `}
                                                onClick={() => !isDisabled && status !== 'running' && setSelectedScenario(key)}
                                                disabled={isDisabled || status === 'running'}
                                            >
                                                <span className={styles.scenarioName}>{def.name}</span>
                                                {isDisabled && <span className={styles.scenarioHelper}>Coming Soon</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Description Panel */}
                            <div className={styles.descPanel}>
                                <div className={styles.descTitle}>{activeDef.name}</div>
                                <div className={styles.descText}>{activeDef.description}</div>

                                <span className={styles.sectionLabel}>Injected Incidents ({activeDef.injectedIncidents.length})</span>
                                <ul className={styles.incidentList}>
                                    {activeDef.injectedIncidents.map((inc, i) => (
                                        <li key={i} className={styles.incidentItem}>
                                            <span className={styles.incidentBullet}>•</span>
                                            {inc}
                                        </li>
                                    ))}
                                </ul>

                                <div className={styles.metaGrid}>
                                    <div>
                                        <span className={styles.metaLabel}>Affected Modules:</span>
                                        <div className={styles.moduleBadges}>
                                            {activeDef.affectedModules.map(m => (
                                                <span key={m} className={styles.moduleBadge}>{m}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <span className={styles.metaLabel}>Est. Duration:</span>
                                        <div className={styles.durationVal}>{activeDef.estimatedDuration}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <button
                                    className={styles.primaryBtn}
                                    onClick={handleRun}
                                    disabled={status === 'running' || selectedScenario === 'custom'}
                                >
                                    <Play size={20} />
                                    Run Simulation
                                </button>

                                <div className={styles.warningBox}>
                                    <AlertTriangle size={16} color="#D97706" style={{ marginTop: '2px', flexShrink: 0 }} />
                                    <span className={styles.warningText}>
                                        <strong>Warning:</strong> This will reset the current demo state and inject synthetic incidents into the OPS system.
                                    </span>
                                </div>

                                <div className={styles.secondaryActions}>
                                    <button
                                        className={styles.resetBtn}
                                        onClick={handleReset}
                                        disabled={status === 'running'}
                                    >
                                        <RotateCcw size={16} /> Reset Simulation
                                    </button>
                                    <button
                                        className={styles.stopBtn}
                                        onClick={handleStop}
                                        disabled={status !== 'running'}
                                    >
                                        <Square size={16} /> Stop Simulation
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* SAFEGUARDS */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <Shield size={20} color="#6B7280" />
                            <div className={styles.cardTitle}>Simulation Safeguards</div>
                        </div>
                        <div className={styles.cardBody}>
                            <ul className={styles.safeguardList}>
                                <li className={styles.safeguardItem}>
                                    <div className={styles.safeguardDot} />
                                    <div><strong>Isolated Environment:</strong> Simulation data is completely isolated from production systems</div>
                                </li>
                                <li className={styles.safeguardItem}>
                                    <div className={styles.safeguardDot} />
                                    <div><strong>No Real Impact:</strong> No actual assets, vehicles, or infrastructure are affected</div>
                                </li>
                                <li className={styles.safeguardItem}>
                                    <div className={styles.safeguardDot} />
                                    <div><strong>Auto-Tagged:</strong> All demo incidents are automatically tagged for easy identification</div>
                                </li>
                                <li className={styles.safeguardItem}>
                                    <div className={styles.safeguardDot} />
                                    <div><strong>Instant Reset:</strong> One-click system reset available at any time</div>
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN */}
                <div className={styles.column}>

                    {/* STATUS CARD */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardTitle}>Simulation Status</div>
                        </div>
                        <div className={styles.cardBody}>

                            <div>
                                <span className={styles.sectionLabel}>Current Status</span>
                                <div className={`
                                    ${styles.statusBadge} 
                                    ${status === 'idle' ? styles.statusIdle :
                                        status === 'running' ? styles.statusRunning :
                                            styles.statusCompleted}
                                `}>
                                    {status === 'idle' && <div className={styles.dotStatic} />}
                                    {status === 'running' && <div className={styles.dotPulse} />}
                                    {status === 'completed' && <CheckCircle2 size={16} />}
                                    {status.toUpperCase()}
                                </div>
                            </div>

                            {status === 'running' && (
                                <div>
                                    <span className={styles.sectionLabel}>Progress</span>
                                    <div className={styles.progressTrack}>
                                        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>{progress}% Complete</div>
                                </div>
                            )}

                            <div>
                                <span className={styles.sectionLabel}>Last Run</span>
                                <div className={styles.monoValue}>{lastRun || 'Never'}</div>
                            </div>

                            <div>
                                <span className={styles.sectionLabel}>Active Injected Incidents</span>
                                <div className={styles.metricValue}>{activeCount}</div>
                            </div>

                        </div>
                    </div>

                    {/* ENVIRONMENT CARD */}
                    <div className={styles.systemCard}>
                        <div style={{ padding: '24px' }}>
                            <div className={styles.sysHeader}>System Environment</div>
                            <div className={styles.sysRow}>
                                <span className={styles.sysLabel}>Mode:</span>
                                <span className={styles.sysValDemo}>DEMO</span>
                            </div>
                            <div className={styles.sysRow}>
                                <span className={styles.sysLabel}>Instance:</span>
                                <span className={styles.sysValCode}>SIM-001</span>
                            </div>
                            <div className={styles.sysRow}>
                                <span className={styles.sysLabel}>Data Persistence:</span>
                                <span className={styles.sysValNormal}>Temporary</span>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};
