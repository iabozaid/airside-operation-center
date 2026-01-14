
import React from 'react';
import { CommandCenterLayout } from '../layout/CommandCenterLayout';
import { GlassCard } from '../components/ui/GlassCard';
import styles from './ContextPage.module.css';

/*
  Authority: Context Under Implementation
*/

export function FleetPage() {
    return (
        <CommandCenterLayout>
            <div className={styles.stubContainer}>
                <GlassCard className={styles.stubCard}>
                    <h2 className={styles.stubTitle}>FLEET CONTEXT MIGRATION</h2>
                    <p className={styles.stubText}>
                        Deep integration with Fleet Management systems is currently being consolidated into the central Operations Dashboard.
                        Please use the main dashboard for active fleet tracking.
                    </p>
                    <a href="/ops" className={styles.stubButton}>
                        RETURN TO OPERATIONS
                    </a>
                </GlassCard>
            </div>
        </CommandCenterLayout>
    );
}
