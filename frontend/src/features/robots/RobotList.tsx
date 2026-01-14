import React from 'react';
import { Robot } from '../../state/robotTypes';

interface RobotListProps {
    robots: Robot[];
    onSelect: (robot: Robot) => void;
    selectedId?: string;
}

export const RobotList: React.FC<RobotListProps> = ({ robots, onSelect, selectedId }) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'var(--color-status-success)';
            case 'charging': return 'var(--color-status-warning)';
            case 'maintenance': return 'var(--color-status-error)';
            default: return 'var(--color-text-dim)';
        }
    };

    return (
        <div style={{ height: '100%', overflowY: 'auto', borderRight: '1px solid var(--color-bg-sidebar)' }}>
            <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-bg-sidebar)', backgroundColor: 'var(--color-bg-surface-dim)' }}>
                <div className="text-small" style={{ fontWeight: 600 }}>ROBOTICS UNIT <span style={{ opacity: 0.7 }}>({robots.length})</span></div>
            </div>

            {robots.length === 0 ? (
                <div style={{ padding: 'var(--space-4)', color: 'var(--color-text-dim)', textAlign: 'center' }}>No robots active.</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {robots.map(robot => (
                        <div
                            key={robot.id}
                            onClick={() => onSelect(robot)}
                            style={{
                                padding: 'var(--space-3) var(--space-4)',
                                borderBottom: '1px solid var(--color-bg-sidebar)',
                                borderLeft: `4px solid ${getStatusColor(robot.status)}`,
                                cursor: 'pointer',
                                backgroundColor: robot.id === selectedId ? 'var(--color-bg-hover)' : 'transparent'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span className="text-small" style={{ fontWeight: 600 }}>{robot.name}</span>
                                <span className="text-tiny" style={{ opacity: 0.7 }}>{robot.type.toUpperCase()}</span>
                            </div>
                            <div style={{ display: 'flex', marginTop: 4, gap: 6 }}>
                                <span className="text-tiny" style={{
                                    backgroundColor: 'var(--color-bg-canvas)',
                                    padding: '1px 4px',
                                    borderRadius: 2,
                                    border: '1px solid var(--color-bg-sidebar)'
                                }}>
                                    {robot.status.toUpperCase()}
                                </span>
                                <span className="text-tiny" style={{ color: robot.battery_level < 20 ? 'red' : 'green' }}>
                                    BAT: {robot.battery_level}%
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
