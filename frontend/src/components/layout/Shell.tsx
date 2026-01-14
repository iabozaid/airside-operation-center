import React, { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutGrid,
    Plane,
    Car,
    Bot,
    Ticket,
    BarChart3,
    FlaskConical
} from 'lucide-react';
import styles from './Shell.module.css';

interface ShellProps {
    children: ReactNode;
}

const Shell: React.FC<ShellProps> = ({ children }) => {
    return (
        <div className={styles.container}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.brandContainer}>
                    <div className={`${styles.brand} text-h2`}>
                        Airside Master
                    </div>
                    <div className={styles.brandSubtitle}>
                        Operations Platform
                    </div>
                </div>

                <nav className={styles.nav}>
                    <NavItem to="/dashboard" label="Dashboard" icon={LayoutGrid} />
                    <NavItem to="/ops" label="Operations" icon={Plane} />
                    <NavItem to="/fleet" label="Fleet Controls" icon={Car} />
                    <NavItem to="/robots" label="Robotics" icon={Bot} />
                    {/* <NavItem to="/tickets" label="Tickets" icon={Ticket} /> */}
                    {/* <NavItem to="/analytics" label="Analytics" icon={BarChart3} /> */}

                    <div className={styles.spacer} />

                    <NavItem to="/simulation" label="Simulation" icon={FlaskConical} highlight />
                </nav>

                <div className={styles.systemStatus}>
                    <div className={`${styles.statusLabel} text-tiny`}>System Status</div>
                    <div className={styles.row}>
                        <div className={styles.dot} />
                        <span className="text-small">Operational</span>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className={styles.main}>
                {/* Header */}
                <header className={styles.header}>
                    <div className={styles.headerTitleMain}>AVIATION OPERATIONS COMMAND CENTER</div>
                    <div className={styles.headerControls}>
                        <div className={styles.clock}>09:41:00</div>
                        <div className={`${styles.demoBadge} text-tiny`}>
                            DEMO MODE
                        </div>
                        <div className={styles.avatar}>
                            OP
                        </div>
                    </div>
                </header>

                {/* Viewport content */}
                <main className={styles.content}>
                    {children}
                </main>
            </div>
        </div>
    );
};

const NavItem = ({ to, label, icon: Icon, highlight }: { to: string, label: string, icon: React.ElementType, highlight?: boolean }) => (
    <NavLink
        to={to}
        className={({ isActive }) => `
            ${styles.navLink} 
            ${isActive ? styles.navLinkActive : ''} 
            ${isActive && highlight ? styles.navLinkHighlight : ''}
        `}
    >
        <Icon size={20} />
        <span className="text-small">{label}</span>
    </NavLink>
);

export default Shell;
