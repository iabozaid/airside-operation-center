
import React, { useState } from 'react';
import { CommandCenterLayout } from '../layout/CommandCenterLayout';
import { GlassCard } from '../components/ui/GlassCard';
import { api } from '../api/client';
import styles from './ContextPage.module.css';

/*
  Authority: Simulation Control Plane
*/

const SCENARIOS = [
    { id: 'standard', label: 'STANDARD OPERATIONS' },
    { id: 'weather', label: 'SEVERE WEATHER' },
    { id: 'cyber', label: 'CYBER INCIDENT' },
    { id: 'fleet', label: 'FLEET OVERSPEED' }
];

export function SimulationPage() {
    const [activeScenario, setActiveScenario] = useState<string | null>('standard');
    const [loading, setLoading] = useState(false);

    const handleActivate = async (id: string) => {
        setLoading(true);
        try {
            await api.triggerScenario(id);
            setActiveScenario(id);
        } catch (e) {
            console.error(e);
            alert("Scenario Trigger Failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <CommandCenterLayout>
            <div className={styles.simContainer}>
                <div className={styles.simHeader}>
                    <h1 className={styles.simTitle}>SIMULATION CONTROL</h1>
                    <div className={styles.simStatus}>
                        SYSTEM STATUS: ACTIVE // REAL-TIME
                    </div>
                </div>

                <div className={styles.scenarioGrid}>
                    {SCENARIOS.map(scenario => {
                        const isActive = activeScenario === scenario.id;
                        const borderColor = isActive ? 'var(--status-ok)' : 'var(--bg-glass-border)';
                        const glow = isActive ? '0 0 var(--space-4) var(--status-ok)' : 'none';

                        return (
                            <GlassCard
                                key={scenario.id}
                                className={styles.scenarioCard}
                                style={{
                                    border: `1px solid ${borderColor}`,
                                    boxShadow: glow
                                }}
                            >
                                <h3 className={styles.scenarioLabel} style={{ color: isActive ? 'var(--status-ok)' : 'var(--text-secondary)' }}>
                                    {scenario.label}
                                </h3>
                                <div className={styles.scenarioStatus} style={{ color: isActive ? 'var(--status-ok)' : 'var(--text-muted)' }}>
                                    {isActive ? 'ACTIVE - RUNNING' : 'STATUS: STANDBY'}
                                </div>

                                <button
                                    onClick={() => handleActivate(scenario.id)}
                                    disabled={loading}
                                    className={styles.scenarioButton}
                                    style={{
                                        background: isActive ? 'var(--status-ok)' : 'transparent',
                                        border: `1px solid ${isActive ? 'var(--status-ok)' : 'var(--text-muted)'}`,
                                        color: isActive ? 'var(--bg-app)' : 'var(--text-muted)'
                                    }}
                                >
                                    {isActive ? 'MONITOR' : 'ACTIVATE'}
                                </button>
                            </GlassCard>
                        );
                    })}
                </div>

                <GlassCard className={styles.timeWarpPanel}>
                    <h3 className={styles.timeWarpTitle}>TIME WARP CONTROLS</h3>
                    <div className={styles.timeWarpControls}>
                        {['1x', '5x', '10x'].map(speed => (
                            <button key={speed} className={styles.timeWarpButton} style={{
                                background: speed === '1x' ? 'var(--accent-primary)' : 'transparent',
                                border: '1px solid var(--accent-primary)',
                                color: speed === '1x' ? 'var(--bg-app)' : 'var(--accent-primary)'
                            }}>
                                {speed} {speed === '1x' ? '(REAL-TIME)' : ''}
                            </button>
                        ))}
                    </div>
                </GlassCard>
            </div>
        </CommandCenterLayout>
    );
}
