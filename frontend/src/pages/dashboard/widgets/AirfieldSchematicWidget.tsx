import React from 'react';
import { Map } from 'lucide-react';
import styles from '../../MasterDashboardPage.module.css';

export const AirfieldSchematicWidget: React.FC = () => {
    // Static Placeholder as per prompt
    return (
        <div style={{
            width: '100%', height: '100%', background: '#f8fafc',
            borderRadius: '8px', border: '1px dashed #cbd5e1',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', position: 'relative', overflow: 'hidden'
        }}>

            {/* Visual Decor */}
            <div style={{ position: 'absolute', top: '20px', left: '20px', fontWeight: 700, color: '#94a3b8' }}>
                SECTOR A - TERMINAL VIEW
            </div>

            {/* Mock Graphics */}
            <div style={{
                width: '60%', height: '120px', border: '3px solid #cbd5e1',
                marginBottom: '20px', borderRadius: '8px', display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: '#cbd5e1',
                fontWeight: 800, fontSize: '1.5rem'
            }}>
                TERMINAL
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', background: '#3b82f6', borderRadius: '50%', boxShadow: '0 4px 6px rgba(59,130,246,0.3)' }} />
                <div style={{ width: '40px', height: '40px', background: '#10b981', borderRadius: '50%' }} />
                <div style={{ width: '40px', height: '40px', background: '#f59e0b', borderRadius: '50%' }} />
            </div>

            <div style={{ marginTop: '20px', color: '#64748b', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Map size={14} /> Live Schematic Connection
            </div>
        </div>
    );
};
