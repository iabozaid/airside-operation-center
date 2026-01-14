import React, { useMemo } from 'react';
import { OpsIncident } from '../../state/opsTypes';
import { AlertTriangle, MapPin } from 'lucide-react';
import styles from './AirportMap.module.css';

interface AirportMapProps {
    incidents: OpsIncident[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    children?: React.ReactNode; // For Dispatch Overlay
}

// Deterministic placement logic
const getPosition = (id: string) => {
    // We map generic IDs to specific interesting points on our CSS schematic
    const positions = [
        { top: '35%', left: '25%' }, // Near T1
        { top: '35%', left: '50%' }, // Near T2
        { top: '35%', left: '75%' }, // Near T3
        { top: '55%', left: '30%' }, // Runway L approach
        { top: '70%', left: '70%' }, // Runway R
        { top: '80%', left: '40%' }, // Apron
    ];

    // Simple hash
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return positions[hash % positions.length];
};

export const AirportMap: React.FC<AirportMapProps> = ({ incidents, selectedId, onSelect, children }) => {
    return (
        <div className={styles.mapContainer}>

            {/* Live Indicator */}
            <div className={styles.liveLabel}>
                <div className={styles.liveDot} />
                Live Airside Traffic
            </div>

            {/* Static Schematic */}
            <div className={styles.schematicLayer}>
                <div className={styles.terminalArea}>
                    <div className={styles.terminal}>T1</div>
                    <div className={styles.terminal}>T2</div>
                    <div className={styles.terminal}>T3</div>
                </div>

                <div className={styles.runwayL}>
                    <span>01L</span>
                    <span>19R</span>
                </div>

                <div className={styles.runwayR}>
                    <span>01R</span>
                    <span>19L</span>
                </div>
            </div>

            {/* Incident Markers */}
            <div className={styles.markerLayer}>
                {incidents.map(inc => {
                    const pos = getPosition(inc.id);
                    const isSelected = inc.id === selectedId;

                    return (
                        <div
                            key={inc.id}
                            className={`${styles.marker} ${isSelected ? styles.selected : ''}`}
                            style={{ top: pos.top, left: pos.left }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelect(inc.id);
                            }}
                        >
                            <div className={styles.markerIcon}>
                                {inc.priority === 'high' ? <AlertTriangle size={20} strokeWidth={3} /> : <MapPin size={20} />}
                            </div>
                            <div className={styles.markerLabel}>{inc.title}</div>
                        </div>
                    );
                })}
            </div>

            {/* Overlay Slot (Dispatch) */}
            {children && (
                <div className={styles.overlayLayer}>
                    {children}
                </div>
            )}

        </div>
    );
};
