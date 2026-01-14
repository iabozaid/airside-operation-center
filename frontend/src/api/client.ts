import { AppEvent, EvidenceItem } from '../state/eventReducer';

// Use relative path by default to allow Vite Proxy to handle CORS
const API_BASE = import.meta.env.VITE_API_BASE ?? "";

function getHeaders() {
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

async function fetchJson(endpoint: string, options: RequestInit = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    const headers = { ...getHeaders(), ...(options.headers as any) };

    const res = await fetch(url, { ...options, headers });

    if (res.status === 401) {
        api.logout();
        throw new Error("Unauthorized");
    }

    if (res.status === 204) {
        return null;
    }

    if (!res.ok) {
        const contentType = res.headers.get("Content-Type");
        if (contentType && contentType.includes("application/json")) {
            const err = await res.json();
            throw new Error(`API Error ${res.status}: ${err.detail || JSON.stringify(err)}`);
        } else {
            const text = await res.text();
            throw new Error(`API Error ${res.status}: ${text}`);
        }
    }

    const contentType = res.headers.get("Content-Type");
    if (contentType && contentType.includes("application/json")) {
        return res.json();
    }
    return res.text();
}

export const api = {
    async login(username: string, password: string) {
        const formData = new FormData();
        formData.append("username", username);
        formData.append("password", password);

        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            body: formData
        });

        if (!res.ok) throw new Error("Login failed");
        const data = await res.json();
        if (data.access_token) {
            localStorage.setItem("token", data.access_token);
        }
        return data;
    },

    logout() {
        localStorage.removeItem("token");
        window.location.href = "/login";
    },

    async getSnapshot() {
        const results = await Promise.allSettled([
            fetchJson('/incidents'),
            fetchJson('/tickets'),
            fetchJson('/fleet/assets')
        ]);

        const [incRes, ticRes, astRes] = results;

        return {
            incidents: incRes.status === 'fulfilled' ? incRes.value : [],
            tickets: ticRes.status === 'fulfilled' ? ticRes.value : [],
            assets: astRes.status === 'fulfilled' ? astRes.value : []
        };
    },

    // Actions
    async transitionIncident(id: string, toState: string) {
        return fetchJson(`/incidents/${id}/transition`, {
            method: 'POST',
            body: JSON.stringify({ to_state: toState, triggered_by: 'operator' })
        });
    },

    async startSimulation() {
        return fetchJson(`/simulation/start`, { method: 'POST' });
    },

    async simulate(subsystem: string, action: string) {
        return fetchJson(`/simulation/${subsystem}/${action}`, { method: 'POST' });
    },

    async getMe() {
        return fetchJson('/auth/me');
    },

    async claimIncident(id: string) {
        return fetchJson(`/incidents/${id}/claim`, { method: 'POST' });
    },

    async getIncidentEvidence(id: string): Promise<EvidenceItem[]> {
        return fetchJson(`/incidents/${id}/evidence`);
    },

    async triggerScenario(scenarioId: string) {
        // Mapping UI scenarios to backend endpoints
        if (scenarioId === 'standard') {
            return fetchJson('/simulation/soc/create_incident', { method: 'POST' });
        }
        return fetchJson(`/simulation/scenarios/${scenarioId}/start`, { method: 'POST' });
    }
};
