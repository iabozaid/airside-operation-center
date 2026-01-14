
import React, { useMemo } from 'react';
import styles from './MapContainer.module.css';
import { OpsMap as AirportMap } from './OpsMap';
import { MapMarkerProps } from './MapMarker';
import { MAP_PROJECTION } from '../../maps/mapProjection';

/* 
  Authority: Component Contract Enforcement
  Status: SVG Implementation (Sprint 2)
*/

export interface MapMarker {
    id: string;
    lat: number;
    lng: number;
    label?: string;
    status?: string;
    type?: 'incident' | 'asset' | 'ticket';
}

export interface MapContainerProps {
    center?: { lat: number; lng: number };
    zoom?: number;
    markers?: MapMarker[];
    selectedEntityId?: string | null;
    onSelectEntity?: (id: string | null) => void;
    onViewportChange?: (center: { lat: number; lng: number }, zoom: number) => void;
}

export function MapContainer({
    center = MAP_PROJECTION.DEFAULT_CENTER,
    zoom = MAP_PROJECTION.DEFAULT_ZOOM,
    markers = [],
    selectedEntityId,
    onSelectEntity,
    onViewportChange
}: MapContainerProps) {

    // Projection Logic (Demo Scale)
    // Center (24.965, 46.700) -> (500, 300)
    const project = (lat: number, lng: number) => {
        const { SCALE_LAT, SCALE_LNG, CENTER_LAT, CENTER_LNG, OFFSET_X, OFFSET_Y } = MAP_PROJECTION;

        const x = OFFSET_X + (lng - CENTER_LNG) * SCALE_LNG;
        const y = OFFSET_Y - (lat - CENTER_LAT) * SCALE_LAT;

        return { x, y };
    };

    const projectedMarkers = useMemo(() => {
        return markers.map(m => {
            const { x, y } = project(m.lat, m.lng);
            return {
                id: m.id,
                x,
                y,
                type: (m.type || 'incident') as any,
                status: m.status || 'open',
            };
        });
    }, [markers]);

    return (
        <div className={`${styles.container} ${styles.viewport}`}>
            <AirportMap
                markers={projectedMarkers as any}
                selectedEntityId={selectedEntityId || undefined}
                onSelectEntity={(id: string) => onSelectEntity?.(id || null)}
                viewport={{ center, zoom }}
                onViewportChange={(v: any) => onViewportChange?.(v.center, v.zoom)}
            />

            {/* HUD Overlay */}
            <div className={styles.hudTopLeft}>
                <div className={styles.coordinateBox}>
                    LAT: {center.lat} <br />
                    LNG: {center.lng}
                </div>
                <div className={styles.zoomLevel}>MAP MODE: LIVE</div>
            </div>

            <div className={styles.placeholderLabel}>
                MATARAT OPS MAP <br />
                <small>LIVE GEOMETRY</small>
            </div>

            <div className={styles.legend}>
                <div><strong>Map Reference</strong></div>
                <div className={styles.legendContent}>
                    <div>Terminals One to Three</div>
                </div>
            </div>
        </div>
    );
}
