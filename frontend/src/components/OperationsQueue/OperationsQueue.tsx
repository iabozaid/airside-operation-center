import React from 'react';
import styles from './OperationsQueue.module.css';
import { OpsIncident } from '../../state/opsTypes';
import { GlassCard } from '../ui/GlassCard';
import { StatusBadge } from '../ui/StatusBadge';

interface OperationsQueueProps {
    incidents: OpsIncident[];
    selectedId: string | null;
    onSelect: (id: string) => void;
}

export function OperationsQueue({ incidents, selectedId, onSelect }: OperationsQueueProps) {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerTitle}>OPERATIONAL QUEUE</div>
            </div>

            {/* SCROLL AUTHORITY: This list is allowed to scroll */}
            <div className={styles.list}>
                {incidents.map(inc => (
                    <div
                        key={inc.id}
                        className={`${styles.item} ${inc.id === selectedId ? styles.selected : ''}`}
                        onClick={() => onSelect(inc.id)}
                    >
                        <GlassCard className={styles.card}>
                            <div className={styles.row}>
                                <span className={styles.time}>{inc.timestamp}</span>
                                <StatusBadge
                                    status={inc.priority === 'high' ? 'critical' : inc.priority === 'medium' ? 'warn' : 'neutral'}
                                    label={inc.priority}
                                />
                            </div>
                            <div className={styles.title}>{inc.title}</div>
                            <div className={styles.status}>{inc.status.toUpperCase()}</div>
                        </GlassCard>
                    </div>
                ))}
            </div>
        </div>
    );
}
