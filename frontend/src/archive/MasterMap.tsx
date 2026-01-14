import React, { useMemo } from 'react';
import { Incident, Asset } from '../state/eventReducer';

interface MasterMapProps {
    incidents: Incident[];
    assets: Asset[];
    selectedId: string | null;
    onSelect: (id: string) => void;
}

const ZONES = {
    'Airside Perimeter': { x: 150, y: 150, width: 200, height: 100, color: 'rgba(255,0,0,0.1)' },
    'Apron Transfer Zone': { x: 450, y: 250, width: 200, height: 200, color: 'rgba(0,255,0,0.1)' },
    'Landside Access Road': { x: 100, y: 450, width: 600, height: 50, color: 'rgba(0,0,255,0.1)' }
};

export const MasterMap: React.FC<MasterMapProps> = ({ incidents, assets, selectedId, onSelect }) => {

    // Deterministic placement
    const getCoordinates = (id: string, zoneId?: string) => {
        const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        let zone = ZONES['Airside Perimeter'];
        if (zoneId && ZONES[zoneId as keyof typeof ZONES]) {
            zone = ZONES[zoneId as keyof typeof ZONES];
        } else {
            // Fallback or random distribution based on hash
            const keys = Object.keys(ZONES);
            zone = ZONES[keys[hash % keys.length] as keyof typeof ZONES];
        }

        return {
            x: zone.x + (hash % zone.width),
            y: zone.y + (hash % zone.height)
        };
    };

    return (
        <svg width="100%" height="100%" viewBox="0 0 800 600" style={{ background: '#f8fafc' }}>
            {/* Outline */}
            <rect x="0" y="0" width="800" height="600" fill="#f8fafc" />
            <path d="M 50 100 L 750 100 L 750 500 L 50 500 Z" fill="none" stroke="#e2e8f0" strokeWidth="4" />

            {/* Zones */}
            {Object.entries(ZONES).map(([name, zone]) => (
                <g key={name}>
                    <rect x={zone.x} y={zone.y} width={zone.width} height={zone.height} fill={zone.color} stroke="#cbd5e0" strokeDasharray="4 4" />
                    <text x={zone.x + 5} y={zone.y + 15} fontSize="10" fill="#718096">{name}</text>
                </g>
            ))}

            {/* Assets (IN_SERVICE Only) */}
            {assets.filter(a => a.status === 'IN_SERVICE').map(asset => {
                const coords = getCoordinates(asset.id, asset.zone_id); // Use real zone logic if avail
                return (
                    <g key={asset.id} transform={`translate(${coords.x}, ${coords.y})`}>
                        <rect x="-6" y="-6" width="12" height="12" fill="var(--col-nominal)" stroke="white" strokeWidth="1" />
                        <text y="14" fontSize="8" textAnchor="middle" fill="var(--text-secondary)">{asset.type[0]}</text>
                    </g>
                );
            })}

            {/* Incidents */}
            {incidents.filter(i => i.state !== 'Closed').map(inc => {
                const coords = getCoordinates(inc.id, inc.zone_id);
                const isSelected = inc.id === selectedId;
                return (
                    <g
                        key={inc.id}
                        transform={`translate(${coords.x}, ${coords.y})`}
                        onClick={(e) => { e.stopPropagation(); onSelect(inc.id); }}
                        style={{ cursor: 'pointer' }}
                    >
                        <circle
                            r={isSelected ? 16 : 12}
                            fill={inc.severity === 'critical' ? 'var(--col-critical)' : 'var(--col-info)'}
                            stroke="white"
                            strokeWidth="2"
                            opacity={isSelected ? 1 : 0.9}
                        />
                        {isSelected && <circle r="20" fill="none" stroke="var(--col-info)" strokeWidth="2" strokeDasharray="2 2" />}
                        <text y="4" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">!</text>
                    </g>
                );
            })}
        </svg>
    );
};
