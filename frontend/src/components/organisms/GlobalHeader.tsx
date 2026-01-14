import React from 'react';
import styles from './GlobalHeader.module.css';
import { MOCK_LOGS } from '../../constants/uiConstants';

export const GlobalHeader = () => {
    return (
        <header className={styles.header}>
            <div className={styles.logo}>
                <span className={styles.brand}>Airside Master</span>
            </div>
            <div className={styles.status}>
                <span className={styles.clock}>{MOCK_LOGS.CLOCK_TIME}</span>
                <div className={styles.user}>ADMIN</div>
            </div>
        </header>
    );
}
