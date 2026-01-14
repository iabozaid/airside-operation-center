import React from 'react';
import styles from './OpsMap.module.css';
import {
    MAP_DIMENSIONS,
    RUNWAY_GEOMETRY,
    TERMINAL_PATHS,
    TERMINAL_LABELS,
    MARKER_GEOMETRY,
    MAP_LABELS
} from '../../maps/mapGeometry';

interface MapMarker {
    id: string;
    x: number;
    y: number;
    type: 'visitor' | 'vehicle' | 'robot';
    status: 'critical' | 'warning' | 'good' | 'accent' | 'neutral';
}

interface OpsMapProps {
    markers: MapMarker[];
    selectedEntityId?: string;
    onSelectEntity: (id: string) => void;
    viewport: {
        center: { lat: number; lng: number };
        zoom: number;
    };
    onViewportChange: (next: { center: { lat: number; lng: number }; zoom: number }) => void;
}

export const OpsMap: React.FC<OpsMapProps> = ({ markers, selectedEntityId, onSelectEntity }) => {

    const getStatusClass = (status: MapMarker['status']) => {
        switch (status) {
            case 'critical': return styles.markerStatusCritical;
            case 'warning': return styles.markerStatusWarning;
            case 'good': return styles.markerStatusGood;
            case 'accent': return styles.markerStatusAccent;
            case 'neutral': return styles.markerStatusNeutral;
            default: return styles.markerStatusNeutral;
        }
    };

    return (
        <div className={styles.container}>
            <svg viewBox={MAP_DIMENSIONS.VIEWBOX} className={styles.svg} preserveAspectRatio="xMidYMid slice">
                {/* Background */}
                <rect x={MAP_DIMENSIONS.ORIGIN} y={MAP_DIMENSIONS.ORIGIN} width={MAP_DIMENSIONS.WIDTH} height={MAP_DIMENSIONS.HEIGHT} className={styles.background} />

                {/* Runways */}
                <g transform={RUNWAY_GEOMETRY.ROTATION}>
                    <rect
                        x={RUNWAY_GEOMETRY.LEFT.X}
                        y={RUNWAY_GEOMETRY.LEFT.Y}
                        width={RUNWAY_GEOMETRY.LEFT.WIDTH}
                        height={RUNWAY_GEOMETRY.LEFT.HEIGHT}
                        className={styles.runway}
                        rx={RUNWAY_GEOMETRY.LEFT.RX}
                    />
                    <text x={RUNWAY_GEOMETRY.LEFT.LABEL_TOP.X} y={RUNWAY_GEOMETRY.LEFT.LABEL_TOP.Y} className={styles.runwayLabel}>{MAP_LABELS.RUNWAY_LEFT_TOP}</text>
                    <text x={RUNWAY_GEOMETRY.LEFT.LABEL_BOTTOM.X} y={RUNWAY_GEOMETRY.LEFT.LABEL_BOTTOM.Y} className={styles.runwayLabel}>{MAP_LABELS.RUNWAY_LEFT_BOTTOM}</text>

                    <rect
                        x={RUNWAY_GEOMETRY.RIGHT.X}
                        y={RUNWAY_GEOMETRY.RIGHT.Y}
                        width={RUNWAY_GEOMETRY.RIGHT.WIDTH}
                        height={RUNWAY_GEOMETRY.RIGHT.HEIGHT}
                        className={styles.runway}
                        rx={RUNWAY_GEOMETRY.RIGHT.RX}
                    />
                    <text x={RUNWAY_GEOMETRY.RIGHT.LABEL_TOP.X} y={RUNWAY_GEOMETRY.RIGHT.LABEL_TOP.Y} className={styles.runwayLabel}>{MAP_LABELS.RUNWAY_RIGHT_TOP}</text>
                </g>

                {/* Terminals */}
                <g>
                    {/* One */}
                    <path d={TERMINAL_PATHS.ONE} className={styles.terminalBlock} />
                    <text x={TERMINAL_LABELS.ONE.X} y={TERMINAL_LABELS.ONE.Y} className={styles.terminalLabel}>{MAP_LABELS.TERMINAL_ONE}</text>
                    {/* Two */}
                    <path d={TERMINAL_PATHS.TWO} className={styles.terminalBlock} />
                    <text x={TERMINAL_LABELS.TWO.X} y={TERMINAL_LABELS.TWO.Y} className={styles.terminalLabel}>{MAP_LABELS.TERMINAL_TWO}</text>
                    {/* Three */}
                    <path d={TERMINAL_PATHS.THREE} className={styles.terminalBlock} />
                    <text x={TERMINAL_LABELS.THREE.X} y={TERMINAL_LABELS.THREE.Y} className={styles.terminalLabel}>{MAP_LABELS.TERMINAL_THREE}</text>
                    {/* Four */}
                    <path d={TERMINAL_PATHS.FOUR} className={styles.terminalBlock} />
                    <text x={TERMINAL_LABELS.FOUR.X} y={TERMINAL_LABELS.FOUR.Y} className={styles.terminalLabel}>{MAP_LABELS.TERMINAL_FOUR}</text>
                </g>

                {/* Live Markers */}
                {markers.map((marker) => (
                    <g
                        key={marker.id}
                        transform={`translate(${marker.x}, ${marker.y})`}
                        className={`${styles.markerGroup} ${selectedEntityId === marker.id ? styles.markerSelected : ''}`}
                        onClick={() => onSelectEntity(marker.id)}
                    >
                        {/* Shape discrimination */}
                        {marker.type === 'robot' || marker.type === 'vehicle' ? (
                            <rect
                                x={MARKER_GEOMETRY.RECT.X}
                                y={MARKER_GEOMETRY.RECT.Y}
                                width={MARKER_GEOMETRY.RECT.WIDTH}
                                height={MARKER_GEOMETRY.RECT.HEIGHT}
                                className={`${styles.markerShape} ${getStatusClass(marker.status)}`}
                                rx={MARKER_GEOMETRY.RECT.RX}
                            />
                        ) : (
                            <circle
                                r={MARKER_GEOMETRY.CIRCLE.R}
                                className={`${styles.markerShape} ${getStatusClass(marker.status)}`}
                            />
                        )}

                        <text y={MARKER_GEOMETRY.LABEL_OFFSET_Y} className={styles.markerLabel}>{marker.id}</text>
                    </g>
                ))}
            </svg>

            <div className={styles.overlay}>
                <div className={styles.overlayTitle}>MASTER AIRPORT MAP</div>
                <div className={styles.overlaySubtitle}>LIVE TRAFFIC</div>
            </div>
        </div>
    );
};
