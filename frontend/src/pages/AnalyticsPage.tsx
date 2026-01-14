
import React from 'react';
import { CommandCenterLayout } from '../layout/CommandCenterLayout';
import { GlassCard } from '../components/ui/GlassCard';
import styles from './ContextPage.module.css';

/*
  Authority: Context Under Implementation
*/

export function AnalyticsPage() {
    return (
        <CommandCenterLayout>
            <div className={styles.stubContainer}>
                <GlassCard className={styles.stubCard}>
                    <h2 className={styles.stubTitle}>DATAMART MIGRATION</h2>
                    <p className={styles.stubText}>
                        Historical reporting and predictive modeling contexts are offline for schema upgrades.
                        Live operational metrics remain available on the main dashboard.
                    </p>
                    <a href="/ops" className={styles.stubButton}>
                        RETURN TO OPERATIONS
                    </a>
                </GlassCard>
            </div>
        </CommandCenterLayout>
    );
}
