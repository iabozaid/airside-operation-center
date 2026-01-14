import React from 'react';
import { Robot } from '../../state/robotTypes';
import { MapContainer, MapMarker } from '../../components/MapContainer/MapContainer';

interface RobotMapProps {
    robots: Robot[];
    selectedId?: string;
    onSelect: (robot: Robot) => void;
}

export const RobotMap: React.FC<RobotMapProps> = ({ robots, selectedId, onSelect }) => {
    
    // Transform Robots to MapMarkers
    const markers: MapMarker[] = robots
        .filter(r => r.location)
        .map(r => ({
            id: r.id,
            lat: r.location!.lat,
            lng: r.location!.lng,
            label: r.name,
            status: r.status,
            type: 'asset' // Reuse asset icon for now, or add specific robot icon logic later
        }));

    const handleSelectEntity = (id: string | null) => {
        if (!id) return;
        const robot = robots.find(r => r.id === id);
        if (robot) onSelect(robot);
    };

    return (
        <MapContainer 
            markers={markers}
            selectedEntityId={selectedId}
            onSelectEntity={handleSelectEntity}
            zoom={15.0} // High zoom for indoor/robot awareness?
        />
    );
};
