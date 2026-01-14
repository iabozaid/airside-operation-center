import React from 'react';
import { OpsIncident } from '../../state/opsTypes';
import styles from './IncidentQueue.module.css';

interface IncidentQueueProps {
    incidents: OpsIncident[];
    selectedId: string | null;
    onSelect: (id: string) => void;
}

export const IncidentQueue: React.FC<IncidentQueueProps> = ({ incidents, selectedId, onSelect }) => {
    return (
        <div className={styles.queueWrapper}>
            <div className={styles.header}>
                <span className={styles.headerTitle}>Incident Queue</span>
                <span className={styles.headerSubtitle}>{incidents.length} Active</span>
            </div>

            <div className={styles.list}>
                {incidents.map(inc => (
                    <div
                        key={inc.id}
                        className={`${styles.item} ${selectedId === inc.id ? styles.selected : ''} ${inc.priority === 'high' ? styles.priorityHigh :
                                inc.priority === 'medium' ? styles.priorityMedium : styles.priorityLow
                            }`}
                        onClick={() => onSelect(inc.id)}
                    >
                        <div className={styles.itemId}>#{inc.id}</div>
                        <div className={styles.itemTitle}>{inc.title}</div>

                        <div className={styles.itemFooter}>
                            <span className={styles.itemTime}>{inc.timestamp.split(' ')[0]}</span>
                            <span className={styles.statusBadge}>
                                {inc.status === 'open' ? 'New' : inc.status.replace('_', ' ')}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
