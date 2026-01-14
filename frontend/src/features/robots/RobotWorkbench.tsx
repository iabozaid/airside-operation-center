import React from 'react';
import { Robot } from '../../state/robotTypes';

const styles = {
    container: { height: '100%', display: 'flex', flexDirection: 'column' as const, fontSize: '14px' },
    header: { padding: '20px', borderBottom: '1px solid var(--color-bg-sidebar)' },
    title: { fontSize: '18px', fontWeight: 600, marginBottom: '4px' },
    id: { fontSize: '12px', color: 'var(--color-text-dim)', fontFamily: 'monospace' },
    section: { padding: '20px' },
    row: { display: 'flex', justifyContent: 'space-between', marginBottom: '12px' },
    label: { color: 'var(--color-text-dim)' },
    value: { fontWeight: 500 },
    empty: { padding: '40px', textAlign: 'center' as const, color: 'var(--color-text-dim)' }
};

interface RobotWorkbenchProps {
    selectedRobot: Robot | null;
}

export const RobotWorkbench: React.FC<RobotWorkbenchProps> = ({ selectedRobot }) => {
    if (!selectedRobot) {
        return (
            <div style={styles.container}>
                 <div style={styles.empty}>SELECT A ROBOT</div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.title}>{selectedRobot.name}</div>
                <div style={styles.id}>ID: {selectedRobot.id}</div>
            </div>

            <div style={styles.section}>
                <div style={styles.row}>
                    <span style={styles.label}>Type</span>
                    <span style={styles.value}>{selectedRobot.type.toUpperCase()}</span>
                </div>
                <div style={styles.row}>
                    <span style={styles.label}>Battery</span>
                    <span style={{...styles.value, color: selectedRobot.battery_level < 20 ? 'red' : 'green'}}>
                        {selectedRobot.battery_level}%
                    </span>
                </div>
                <div style={styles.row}>
                    <span style={styles.label}>Status</span>
                    <span style={{...styles.value, color: selectedRobot.status === 'active' ? 'var(--color-status-success)' : 'inherit'}}>
                        {selectedRobot.status.toUpperCase()}
                    </span>
                </div>
                <div style={styles.row}>
                    <span style={styles.label}>Last Heartbeat</span>
                    <span style={styles.value}>
                        {new Date(selectedRobot.last_heartbeat_utc).toLocaleTimeString()}
                    </span>
                </div>
            </div>
            
            <div style={{...styles.section, borderTop: '1px solid var(--color-bg-sidebar)'}}>
                <div style={{fontWeight: 600, marginBottom: 10}}>Functions</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                     <button style={{ padding: '8px', cursor: 'pointer', border: '1px solid var(--color-bg-sidebar)' }}>
                        RETURN HOME
                     </button>
                      <button style={{ padding: '8px', cursor: 'pointer', border: '1px solid var(--color-bg-sidebar)' }}>
                        PAUSE JOB
                     </button>
                </div>
            </div>
        </div>
    );
};
