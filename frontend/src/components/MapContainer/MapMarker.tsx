import React from 'react';
import styles from './MapMarker.module.css';
import { MARKER_ANIMATION } from '../../maps/mapGeometry';

export interface MapMarkerProps {
    id: string;
    position: { x: number; y: number };
    type: 'incident' | 'asset' | 'ticket';
    status: string;
    label?: string;
    isSelected?: boolean;
    onClick?: (e: React.MouseEvent) => void;
}

export function MapMarker({ position, type, status, isSelected, onClick }: MapMarkerProps) {
    const getStatusClass = () => {
        if (type === 'incident') {
            switch (status) {
                case 'New': return styles.markerStatusCritical;
                case 'In Progress': return styles.markerStatusWarning;
                case 'Resolved': return styles.markerStatusGood;
                default: return styles.markerStatusAccent;
            }
        }
        return styles.markerStatusNeutral;
    };

    const r = isSelected ? MARKER_ANIMATION.SELECTED_RADIUS_BASE : MARKER_ANIMATION.NORMAL_RADIUS;

    return (
        <g
            transform={`translate(${position.x}, ${position.y})`}
            onClick={onClick}
            className={styles.markerGroup}
        >
            {isSelected && (
                <circle
                    r={MARKER_ANIMATION.SELECTED_RADIUS_BASE}
                    className={`${styles.pulseCircle} ${getStatusClass()}`}
                />
            )}
            <circle
                r={r}
                className={`${styles.baseCircle} ${styles.markerShape} ${getStatusClass()}`}
            />
        </g>
    );
}
