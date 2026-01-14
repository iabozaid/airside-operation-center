import React, { useState, useEffect } from 'react';
import { RobotList } from './RobotList';
import { RobotMap } from './RobotMap';
import { RobotWorkbench } from './RobotWorkbench';
import { Robot } from '../../state/robotTypes';

export const RobotsPage: React.FC = () => {
    const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
    const [selectedRobot, setSelectedRobot] = useState<Robot | null>(null);
    const [robots, setRobots] = useState<Robot[]>([]);

    // UI Contract: Loading & Error States
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        setError(null);

        fetch('/robots')
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(data => {
                if (mounted) {
                    setRobots(Array.isArray(data) ? data : []);
                }
            })
            .catch(err => {
                console.error("Failed to fetch robots", err);
                if (mounted) setError("Failed to load robots");
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });

        return () => { mounted = false; };
    }, []);

    const handleSelect = (robot: Robot) => {
        setSelectedRobot(robot);
        setSelectedId(robot.id);
    };

    if (loading) return <div style={{ padding: 20, color: '#fff' }}>Loading Robots...</div>;
    if (error) return <div style={{ padding: 20, color: 'var(--color-error)' }}>Error: {error}</div>;

    return (
        <div style={{ display: 'flex', height: '100%' }}>
            {/* Zone 1: List */}
            <div style={{
                width: 'var(--sidebar-width)',
                backgroundColor: 'var(--color-bg-surface)',
                height: '100%',
                borderRight: '1px solid var(--color-bg-sidebar)',
                overflow: 'hidden'
            }}>
                <RobotList
                    robots={robots}
                    onSelect={handleSelect}
                    selectedId={selectedId}
                />
            </div>

            {/* Zone 2: Map */}
            <div style={{
                flex: 1,
                position: 'relative',
                backgroundColor: '#1a1f24'
            }}>
                <RobotMap
                    robots={robots}
                    selectedId={selectedId}
                    onSelect={handleSelect}
                />
            </div>

            {/* Zone 3: Workbench */}
            <div style={{
                width: 400,
                backgroundColor: 'var(--color-bg-surface)',
                borderLeft: '1px solid var(--color-bg-sidebar)',
                height: '100%'
            }}>
                <RobotWorkbench selectedRobot={selectedRobot} />
            </div>
        </div>
    );
};
