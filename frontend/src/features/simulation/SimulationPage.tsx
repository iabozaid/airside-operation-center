import React, { useState } from 'react';

export const SimulationPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const startSimulation = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await fetch('/simulation/start', { method: 'POST' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setResult(data);
        } catch (err: any) {
            console.error("Simulation failed", err);
            setError(err.message || "Failed to start simulation");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: 'var(--space-6)', color: 'var(--color-text-primary)' }}>
            <h1 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-4)' }}>Simulation Control</h1>

            <div style={{
                backgroundColor: 'var(--color-bg-surface)',
                padding: 'var(--space-6)',
                borderRadius: 'var(--radius-md)',
                maxWidth: 600
            }}>
                <p style={{ marginBottom: 'var(--space-4)', color: 'var(--color-text-secondary)' }}>
                    Trigger the "Default Demo Scenario" which injects 3 incidents (Geofence, Overspeed, Collision) and resets asset states.
                </p>

                <button
                    onClick={startSimulation}
                    disabled={loading}
                    style={{
                        padding: 'var(--space-3) var(--space-6)',
                        backgroundColor: loading ? 'var(--color-bg-surface-dim)' : 'var(--color-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: 'var(--font-size-md)',
                        fontWeight: 600
                    }}
                >
                    {loading ? "Starting..." : "Start Simulation Scenario"}
                </button>

                {error && (
                    <div style={{
                        marginTop: 'var(--space-4)',
                        padding: 'var(--space-3)',
                        backgroundColor: 'var(--color-bg-error-dim)',
                        color: 'var(--color-error)',
                        borderRadius: 'var(--radius-sm)'
                    }}>
                        Error: {error}
                    </div>
                )}

                {result && (
                    <div style={{
                        marginTop: 'var(--space-4)',
                        padding: 'var(--space-4)',
                        backgroundColor: 'var(--color-bg-success-dim)',
                        border: '1px solid var(--color-success)',
                        borderRadius: 'var(--radius-sm)'
                    }}>
                        <div style={{ fontWeight: 600, color: 'var(--color-success)' }}>Simulation Started Successfully</div>
                        <pre style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-size-sm)', overflowX: 'auto' }}>
                            {JSON.stringify(result, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};
