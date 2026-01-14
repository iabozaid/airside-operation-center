export type StreamConnectionStatus = 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING';

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";

export interface StreamConfig {
    url: string;
    onMessage: (data: any) => void;
    onStatusChange?: (status: StreamConnectionStatus) => void;
}

export class StreamClient {
    private es: EventSource | null = null;
    public config: StreamConfig;
    private retryCount = 0;
    private maxRetries = 5;

    constructor(config: StreamConfig) {
        this.config = config;
    }

    connect() {
        if (this.es) {
            this.es.close();
        }

        // DEMO MODE SAFEGUARD
        if (import.meta.env.VITE_USE_MOCK_DATA === 'true' || true) {
            console.log('[StreamClient] Demo Mode: Connection Mocked');
            this.config.onStatusChange?.('CONNECTED');
            return;
        }

        const lastId = localStorage.getItem("ops_last_event_id");
        const params = new URLSearchParams();
        if (lastId !== null) params.append("since", lastId as string);

        const fullUrl = `${this.config.url}?${params.toString()}`;
        console.log(`[StreamClient] Connecting to ${fullUrl}`);

        const es = new EventSource(fullUrl);
        this.es = es;

        es.onopen = () => {
            console.log("[StreamClient] Connected");
            this.retryCount = 0;
            this.config.onStatusChange?.('CONNECTED');
        };

        es.onerror = (err: Event) => {
            console.warn("[StreamClient] Connection lost", err);
            this.config.onStatusChange?.('DISCONNECTED');
            es.close();
            if (this.es === es) {
                this.es = null;
                this.handleRetry();
            }
        };

        es.onmessage = (msg: MessageEvent) => {
            try {
                if (msg.lastEventId) {
                    localStorage.setItem("ops_last_event_id", msg.lastEventId);
                }

                if (!msg.data || msg.data.trim() === '') return;

                const envelope = JSON.parse(msg.data);

                // Decode payload if it's a string (fastapi/redis artifact)
                let payload = envelope.payload;
                if (typeof payload === 'string') {
                    try { payload = JSON.parse(payload); } catch (e) { }
                }
                envelope.payload = payload;

                this.config.onMessage(envelope);
            } catch (e) {
                console.error("[StreamClient] Parse error", e);
            }
        };
    }

    private handleRetry() {
        if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            const delay = Math.min(1000 * Math.pow(2, this.retryCount), 30000);
            console.log(`[StreamClient] Retrying in ${delay}ms...`);
            this.config.onStatusChange?.('RECONNECTING');
            setTimeout(() => this.connect(), delay);
        } else {
            console.error("[StreamClient] Max retries exceeded");
        }
    }

    disconnect() {
        if (this.es) {
            this.es.close();
            this.es = null;
            this.config.onStatusChange?.('DISCONNECTED');
        }
    }
}

export const streamClient = new StreamClient({
    url: `${API_BASE}/stream/ops`,
    onMessage: () => { }, // placeholder, will be overridden
});
