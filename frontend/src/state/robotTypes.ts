export interface Robot {
    id: string;
    name: string;
    type: string; // 'cleaner' | 'security' | 'delivery' | 'inspection'
    status: string; // 'active' | 'charging' | 'idle' | 'maintenance'
    battery_level: number;
    last_heartbeat_utc: string;
    location?: { lat: number; lng: number };
}
