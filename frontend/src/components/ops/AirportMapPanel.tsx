import React from 'react';
import { OpsIncident } from '../../state/opsTypes';
import { AlertTriangle, MapPin } from 'lucide-react';
import styles from './AirportMapPanel.module.css';

interface AirportMapPanelProps {
    incidents: OpsIncident[];
    selectedId: string | null;
    onSelect: (id: string) => void;
}

const project = (lat: number, lng: number) => {
    // Simplified static mapping for the schematic
    // Top Row (Terminals) ~ 20% height
    // Middle (Runways) ~ 50% height
    // Bottom (Apron) ~ 80% height

    // Deterministic placement for demo visuals (cycling through "slots")
    // In a real app, this maps GeoJSON to SVG coordinates
    const positions = [
        { top: '25%', left: '20%' }, // T1
        { top: '25%', left: '50%' }, // T2
        { top: '25%', left: '80%' }, // T3
        { top: '50%', left: '40%' }, // RWY 01L
        { top: '65%', left: '60%' }, // RWY 01R
        { top: '85%', left: '30%' }, // Apron
    ];

    // Mock logic using distinct ID hash or random seed based on ID
    // We just want them stable per ID
    const hash = lat + lng;
    const idx = Math.floor((hash * 1000) % positions.length);
    return positions[idx];
};

export const AirportMapPanel: React.FC<AirportMapPanelProps> = ({ incidents, selectedId, onSelect }) => {
    const safeIncidents = incidents || [];

    const getPriorityClass = (priority: string) => {
        switch (priority) {
            case 'high': return styles.priorityHigh;
            case 'medium': return styles.priorityMedium;
            case 'low': return styles.priorityLow;
            default: return '';
        }
    };

    return (
        <div className={styles.mapContainer}>
            <div className={styles.header}>
                <div className={styles.headerTitle}>Master Airport Map</div>
                <div className={styles.liveIndicator}>
                    <div className={styles.liveDot} /> LIVE TRAFFIC
                </div>
            </div>

            {/* Schematic Layer */}
            <div className={styles.schematic}>
                <div className={styles.terminalRow}>
                    <div className={styles.terminalBox}>T1</div>
                    <div className={styles.terminalBox}>T2</div>
                    <div className={styles.terminalBox}>T3</div>
                    <div className={styles.terminalBox} style={{ opacity: 0.5, borderStyle: 'dashed' }}>T4</div>
                </div>

                <div className={styles.runwayStrip}>01 L</div>
                <div className={styles.runwayStrip}>01 R</div>

                <div className={styles.apronArea}>APRO N</div>
            </div>

            {/* Markers Layer */}
            {safeIncidents.map(inc => {
                const pos = project(inc.location?.lat || 0, inc.location?.lng || 0);
                const isSelected = inc.id === selectedId;

                return (
                    <div
                        key={inc.id}
                        className={`
                            ${styles.marker} 
                            ${isSelected ? styles.selected : ''} 
                            ${getPriorityClass(inc.priority)}
                        `}
                        style={{ top: pos.top, left: pos.left }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect(inc.id);
                        }}
                    >
                        <div className={styles.markerIcon}>
                            {inc.priority === 'high' ? <AlertTriangle size={18} strokeWidth={3} /> : <MapPin size={18} strokeWidth={3} />}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
