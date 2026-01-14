import React from 'react';
import { FleetAsset } from '../../state/fleetTypes';
import { MapContainer, MapMarker } from '../../components/MapContainer/MapContainer';

interface FleetMapProps {
    assets: FleetAsset[];
    selectedId?: string;
    onSelect: (asset: FleetAsset) => void;
}

export const FleetMap: React.FC<FleetMapProps> = ({ assets, selectedId, onSelect }) => {

    // Transform FleetAssets to MapMarkers
    const markers: MapMarker[] = assets
        .filter(a => a.location) // Only map assets with location
        .map(a => ({
            id: a.id,
            lat: a.location!.lat,
            lng: a.location!.lng,
            label: a.name,
            status: a.status,
            type: 'asset' // Uses 'asset' icon logic in MapContainer
        }));

    const handleSelectEntity = (id: string | null) => {
        if (!id) return;
        const asset = assets.find(a => a.id === id);
        if (asset) onSelect(asset);
    };

    return (
        <MapContainer
            markers={markers}
            selectedEntityId={selectedId}
            onSelectEntity={handleSelectEntity}
            zoom={14.5} // Slightly zoomed in for vehicles
        />
    );
};
