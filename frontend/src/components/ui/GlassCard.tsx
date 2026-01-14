import React, { ReactNode } from 'react';
import styles from './GlassCard.module.css';


interface GlassCardProps {
    children: ReactNode;
    className?: string;
    variant?: 'default' | 'panel';
    style?: React.CSSProperties;
}

export function GlassCard({ children, className = '', variant = 'default', style }: GlassCardProps) {
    const rootClass = `${styles.card} ${styles[variant]} ${className}`;
    return (
        <div className={rootClass} style={style}>
            {children}
        </div>
    );
}

