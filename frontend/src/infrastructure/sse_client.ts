
type EventHandler = (data: any) => void;

class BrowserEventEmitter {
    private handlers: { [key: string]: EventHandler[] } = {};

    on(event: string, handler: EventHandler) {
        if (!this.handlers[event]) {
            this.handlers[event] = [];
        }
        this.handlers[event].push(handler);
    }

    off(event: string, handler: EventHandler) {
        if (!this.handlers[event]) return;
        this.handlers[event] = this.handlers[event].filter(h => h !== handler);
    }

    emit(event: string, data: any) {
        if (!this.handlers[event]) return;
        this.handlers[event].forEach(h => h(data));
    }
}

// Contract: sse_contract.md (Fix #3 & #4)
// Canonical Events
export type CanonicalEventType =
    | 'incident.created'
    | 'incident.updated'
    | 'incident.resolved'
    | 'asset.moved'
    | 'asset.status_changed'
    | 'ticket.created'
    | 'ticket.updated'
    | 'telemetry.updated'
    | 'system.heartbeat'
    | 'system.reset';

// Envelope Schema
export interface SSEEnvelope {
    id: string;
    event: CanonicalEventType;
    timestamp_utc: string;
    data: any;
}

const HEARTBEAT_TIMEOUT_MS = 15000; // 15s Threshold
const RECONNECT_DELAY_MS = 2000;


class SSEClient extends BrowserEventEmitter {
    private eventSource: EventSource | null = null;
    private heartbeatTimer: ReturnType<typeof setTimeout> | null = null;
    private isConnected = false;

    constructor(private url: string = '/stream/ops') {
        super();
    }

    public connect() {
        if (this.eventSource) return;

        // DEMO MODE SAFEGUARD
        if (import.meta.env.VITE_USE_MOCK_DATA === 'true' || true) {
            console.log('[SSE] Demo Mode: Connection Mocked');
            this.isConnected = true;
            this.emit('connection.change', true);
            return;
        }

        console.log('[SSE] Connecting to', this.url);
        console.log('[SSE] Connecting to', this.url);
        // Using Vite Proxy
        const es = new EventSource(this.url);
        this.eventSource = es;

        es.onopen = () => {
            console.log('[SSE] Connected');
            this.isConnected = true;
            this.resetHeartbeat();
            this.emit('connection.change', true);
        };

        es.onmessage = (rawEvent) => {
            try {
                // Note: SSE standard sends 'data' as string. 
                // Our backend sends the JSON envelope INSIDE that data field, 
                // OR the event type is named in the SSE stream itself.
                // sse_contract.md says JSON Structure.
                // Let's assume standard behavior: EventSource handles 'event' type if backend sets it.
                // WE MUST BE CAREFUL: standard onmessage only catches 'message' type events.
                // If backend uses custom event names (event: incident.created), we need listeners for those.

                // STRATEGY: Backend likely sends minimal SSE with 'data' containing the Envelope.
                // Or backend utilizes SSE event naming.
                // Given sse_contract.md "Event Envelope", let's parse rawEvent.data.

                const envelope: SSEEnvelope = JSON.parse(rawEvent.data);
                this.handleEnvelope(envelope);

            } catch (e) {
                console.error('[SSE] Parse Error', e);
            }
        };

        es.onerror = (err) => {
            console.error('[SSE] Connection Error', err);
            this.disconnect();
            setTimeout(() => this.connect(), RECONNECT_DELAY_MS);
        };
    }

    private handleEnvelope(envelope: SSEEnvelope) {
        this.resetHeartbeat();

        // Canonical Routing
        switch (envelope.event) {
            case 'system.heartbeat':
                // just keepalive
                break;
            case 'system.reset':
                console.warn('[SSE] SYSTEM RESET RECEIVED');
                window.location.reload(); // Hard Reset per Contract
                break;
            default:
                this.emit(envelope.event, envelope.data);
                this.emit('message', envelope); // Wildcard
                break;
        }
    }

    private resetHeartbeat() {
        if (this.heartbeatTimer) clearTimeout(this.heartbeatTimer);
        this.heartbeatTimer = setTimeout(() => {
            console.error('[SSE] Heartbeat Timeout');
            this.isConnected = false;
            this.emit('connection.change', false);
            // Optional: Reconnect?
            this.disconnect();
            this.connect();
        }, HEARTBEAT_TIMEOUT_MS);
    }

    public disconnect() {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
        if (this.heartbeatTimer) clearTimeout(this.heartbeatTimer);
        this.isConnected = false;
        this.emit('connection.change', false);
    }
}

export const sseClient = new SSEClient();
