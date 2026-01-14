import React from 'react';
import { FleetAsset } from '../../state/fleetTypes';
// Inline styles to match typical Workbench without css module dependency
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

interface FleetWorkbenchProps {
    selectedAsset: FleetAsset | null;
}

export const FleetWorkbench: React.FC<FleetWorkbenchProps> = ({ selectedAsset }) => {
    if (!selectedAsset) {
        return (
            <div style={styles.container}>
                <div style={styles.empty}>SELECT A VEHICLE TO VIEW DETAILS</div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.title}>{selectedAsset.name}</div>
                <div style={styles.id}>ID: {selectedAsset.id}</div>
            </div>

            <div style={styles.section}>
                <div style={styles.row}>
                    <span style={styles.label}>Type</span>
                    <span style={styles.value}>{selectedAsset.asset_type.toUpperCase()}</span>
                </div>
                <div style={styles.row}>
                    <span style={styles.label}>Status</span>
                    <span style={{ ...styles.value, color: selectedAsset.status === 'active' ? 'var(--color-status-success)' : 'inherit' }}>
                        {selectedAsset.status.toUpperCase()}
                    </span>
                </div>
                <div style={styles.row}>
                    <span style={styles.label}>Last Contact</span>
                    <span style={styles.value}>
                        {selectedAsset.last_heartbeat_utc ? new Date(selectedAsset.last_heartbeat_utc).toLocaleTimeString() : 'N/A'}
                    </span>
                </div>
                {selectedAsset.location && (
                    <div style={styles.row}>
                        <span style={styles.label}>Location</span>
                        <span style={styles.value}>
                            {selectedAsset.location.lat.toFixed(4)}, {selectedAsset.location.lng.toFixed(4)}
                        </span>
                    </div>
                )}
            </div>

            <div style={{ ...styles.section, borderTop: '1px solid var(--color-bg-sidebar)' }}>
                <div style={{ fontWeight: 600, marginBottom: 10 }}>Controls</div>
                <button style={{
                    width: '100%',
                    padding: '8px',
                    background: 'var(--color-bg-canvas)',
                    border: '1px solid var(--color-bg-sidebar)',
                    color: 'var(--color-text-dim)',
                    cursor: 'not-allowed'
                }}>
                    SIGNAL DRIVER (Offline)
                </button>
            </div>
        </div>
    );
};
