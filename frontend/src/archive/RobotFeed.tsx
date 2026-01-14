import React from 'react';

export const RobotFeed: React.FC = () => {
    return (
        <div className="panel" style={{ padding: '8px', marginBottom: '8px', borderLeft: '4px solid var(--col-nominal)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Robotic Inspection Feed — Virtual Inspector</h4>
                <div style={{ fontSize: '0.7rem', color: 'var(--col-nominal)' }}>● LIVE</div>
            </div>
            <div style={{ background: '#000', height: '150px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333' }}>
                {/* Mock Video Player */}
                <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#666', fontSize: '2rem' }}>▶</div>
                    <div style={{ color: '#666', fontSize: '0.8rem' }}>CAM-04 (Airside)</div>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                {[1, 2, 3].map(i => (
                    <div key={i} style={{ flex: 1, height: '40px', background: '#e2e8f0', borderRadius: '2px' }}></div>
                ))}
            </div>
        </div>
    );
};
