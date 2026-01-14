import React, { useEffect, useState } from 'react';
import { Clock, User } from 'lucide-react';
import styles from './TopBar.module.css';

export const TopBar: React.FC = () => {
    const [time, setTime] = useState<string>('');

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            // Force 24h format matching screenshot "15:52:13"
            setTime(now.toLocaleTimeString('en-GB', { hour12: false }));
        };
        updateTime();
        const timer = setInterval(updateTime, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className={styles.topBar}>
            <div className={styles.brand}>
                AVIATION OPERATIONS COMMAND CENTER
            </div>

            <div className={styles.controls}>
                <div className={styles.timeWidget}>
                    <Clock size={16} />
                    <span>{time}</span>
                </div>

                <div className={styles.demoBadge}>
                    DEMO MODE
                </div>

                <div className={styles.userWidget}>
                    <User size={20} color="#cbd5e1" />
                </div>
            </div>
        </div>
    );
};
