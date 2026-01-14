export interface FleetAsset {
    id: string;
    asset_type: string; // 'patrol' | 'bus' | 'truck' | 'maintenance' | 'follow_me'
    name: string;
    status: string; // 'active' | 'idle' | 'moving' | 'repair' | 'offline'
    last_heartbeat_utc?: string;
    location?: { lat: number; lng: number };
    driver?: string;
    speed_kmh?: number;
    stream_url?: string;
}
