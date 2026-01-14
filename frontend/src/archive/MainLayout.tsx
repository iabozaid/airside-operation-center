import React, { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Activity, Ticket, Truck, BarChart2, Shield, LogOut } from 'lucide-react';
import { api } from '../api/client';
import { useAppState } from '../App';

export const MainLayout: React.FC = () => {
    const { state } = useAppState();
    const [user, setUser] = useState<{ username: string, roles: string[] } | null>(null);

    useEffect(() => {
        api.getMe().then(setUser).catch(console.error);
    }, []);

    const handleLogout = () => {
        api.logout();
    };

    const linkStyle = ({ isActive }: { isActive: boolean }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        color: isActive ? 'var(--col-info)' : 'var(--text-secondary)',
        fontWeight: isActive ? 'bold' : 'normal',
        borderBottom: isActive ? '2px solid var(--col-info)' : '2px solid transparent',
        padding: '18px 0',
        textDecoration: 'none'
    });

    const logoPlaceholderStyle: React.CSSProperties = {
        width: 40,
        height: 40,
        border: '1px dashed var(--col-neutral)',
        borderRadius: 4,
        background: '#f7fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.6rem',
        color: 'var(--text-secondary)',
        textAlign: 'center',
        lineHeight: 1
    };

    const roleLabel = user?.roles?.includes('manager') ? 'Manager' : (user ? 'Operator' : 'Demo Operator');

    return (
        <div className="app-wrapper">
            <header className="header" style={{ height: 60, padding: '0 24px' }}>
                {/* Branding Left */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={logoPlaceholderStyle}>Client Logo</div>
                    <div style={{ width: 1, height: 30, background: 'var(--border-subtle)' }}></div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                        ATSS Matarat — Command Center
                    </div>
                </div>

                {/* Navigation */}
                <nav style={{ display: 'flex', gap: '32px', height: '100%' }}>
                    <NavLink to="/ops" style={linkStyle}><Activity size={18} /> OPS</NavLink>
                    <NavLink to="/tickets" style={linkStyle}><Ticket size={18} /> TICKETS</NavLink>
                    <NavLink to="/fleet" style={linkStyle}><Truck size={18} /> FLEET</NavLink>
                    <NavLink to="/analytics" style={linkStyle}><BarChart2 size={18} /> ANALYTICS</NavLink>
                    <NavLink to="/admin" style={linkStyle}><Shield size={18} /> ADMIN</NavLink>
                </nav>

                {/* Status & User */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {/* Connection Status */}
                    <div style={{
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        color: state.isConnected ? 'var(--col-nominal)' : 'var(--col-critical)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                    }}>
                        <div style={{
                            width: 8, height: 8, borderRadius: '50%',
                            background: state.isConnected ? 'var(--col-nominal)' : 'var(--col-critical)',
                            boxShadow: state.isConnected ? '0 0 8px var(--col-nominal)' : 'none'
                        }}></div>
                        {state.isConnected ? 'LIVE' : 'OFFLINE'}
                    </div>

                    <div style={{ width: 1, height: 30, background: 'var(--border-subtle)' }}></div>

                    {/* Branding Right + User */}
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{user?.username || 'admin'}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{roleLabel}</div>
                        </div>
                        <div style={logoPlaceholderStyle}>ATSS Logo</div>
                    </div>

                    <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} title="Logout">
                        <LogOut size={18} />
                    </button>
                </div>
            </header>
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};
