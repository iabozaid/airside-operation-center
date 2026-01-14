import React from 'react';

export const Workbench: React.FC = () => {
    return (
        <div style={{ padding: 'var(--space-4)', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <div className="text-h2">WORKBENCH</div>
                <div className="text-tiny" style={{ color: 'var(--color-text-secondary)' }}>INCIDENT DETAILS & MEDIA</div>
            </div>

            {/* Empty State / Select Prompt */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f9fafb',
                border: '1px dashed #d1d5db',
                borderRadius: '8px',
                color: 'var(--color-text-secondary)'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>📋</div>
                    <div className="text-small">Select an Incident from Queue</div>
                </div>
            </div>

            {/* Placeholder for Actions (DISABLED per DEMO_MODE) */}
            <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', backgroundColor: '#fffbe6', border: '1px solid #ffe58f', borderRadius: '4px' }}>
                <div className="text-tiny" style={{ color: '#b7eb8f', fontWeight: 700, marginBottom: 4 }}>DEMO MODE RESTRICTION</div>
                <div className="text-small" style={{ fontSize: '12px' }}>
                    Manual resolution is disabled. Use Simulation Control.
                </div>
            </div>
        </div>
    );
};
