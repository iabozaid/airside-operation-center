import React from 'react';
import { FleetAsset } from '../../state/fleetTypes';

interface FleetListProps {
    onSelect: (asset: FleetAsset) => void;
    selectedId?: string;
    assets: FleetAsset[];
}

export const FleetList: React.FC<FleetListProps> = ({ onSelect, selectedId, assets }) => {

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': case 'moving': return 'var(--color-status-success)';
            case 'idle': return 'var(--color-status-warning)';
            case 'repair': case 'offline': return 'var(--color-status-error)';
            default: return 'var(--color-text-dim)';
        }
    };

    return (
        <div style={{ height: '100%', overflowY: 'auto', borderRight: '1px solid var(--color-bg-sidebar)' }}>
            <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-bg-sidebar)', backgroundColor: 'var(--color-bg-surface-dim)' }}>
                <div className="text-small" style={{ fontWeight: 600 }}>FLEET ASSETS <span style={{ opacity: 0.7 }}>({assets.length})</span></div>
            </div>
            {assets.length === 0 ? (
                <div style={{ padding: 'var(--space-4)', color: 'var(--color-text-dim)', textAlign: 'center' }}>No assets active.</div>
            ) : (
                <div>
                    {assets.map(asset => (
                        <div
                            key={asset.id}
                            onClick={() => onSelect(asset)}
                            style={{
                                padding: 'var(--space-3) var(--space-4)',
                                borderBottom: '1px solid var(--color-bg-sidebar)',
                                borderLeft: `4px solid ${getStatusColor(asset.status)}`,
                                cursor: 'pointer',
                                backgroundColor: asset.id === selectedId ? 'var(--color-bg-hover)' : 'transparent'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span className="text-small" style={{ fontWeight: 600 }}>{asset.name}</span>
                                <span className="text-tiny" style={{ opacity: 0.7 }}>{asset.asset_type.toUpperCase()}</span>
                            </div>
                            <div style={{ display: 'flex', marginTop: 4, gap: 6 }}>
                                <span className="text-tiny" style={{
                                    backgroundColor: 'var(--color-bg-canvas)',
                                    padding: '1px 4px',
                                    borderRadius: 2,
                                    border: '1px solid var(--color-bg-sidebar)'
                                }}>
                                    {asset.status.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
