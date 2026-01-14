
import React from 'react';
import { CommandCenterLayout } from '../layout/CommandCenterLayout';
import { GlassCard } from '../components/ui/GlassCard';
import styles from './ContextPage.module.css';

/*
  Authority: Context Under Implementation
*/

export function TicketsPage() {
    return (
        <CommandCenterLayout>
            <div className={styles.stubContainer}>
                <GlassCard className={styles.stubCard}>
                    <h2 className={styles.stubTitle}>TICKET DESK MIGRATION</h2>
                    <p className={styles.stubText}>
                        Support Ticket workflows are being re-routed to the unified Workbench.
                        Legacy ticketing context is restricted during this phase.
                    </p>
                    <a href="/ops" className={styles.stubButton}>
                        RETURN TO OPERATIONS
                    </a>
                </GlassCard>
            </div>
        </CommandCenterLayout>
    );
}
