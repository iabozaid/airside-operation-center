import React from 'react';
import styles from './StatusBadge.module.css';

export interface StatusBadgeProps {
    status: 'ok' | 'warn' | 'critical' | 'neutral';
    label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
    return (
        <span className={`${styles.badge} ${styles[status]}`}>
            <span className={styles.dot} />
            {label || status.toUpperCase()}
        </span>
    );
}
