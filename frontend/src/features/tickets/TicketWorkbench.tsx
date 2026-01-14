import React, { useState } from 'react';
import { Ticket } from '../../state/ticketTypes';
// Using inline styles or creating a new module? 
// Reusing Workbench.module.css?
import styles from '../../components/Workbench/Workbench.module.css';

interface TicketWorkbenchProps {
    selectedTicket: Ticket | null;
}

export const TicketWorkbench: React.FC<TicketWorkbenchProps> = ({ selectedTicket }) => {
    const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');

    if (!selectedTicket) {
        return (
            <div className={styles.empty}>
                <p>SELECT A TICKET TO VIEW DETAILS</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleInfo}>
                    <div className={styles.title}>{selectedTicket.title}</div>
                    <span className={styles.idBadge}>ID: {selectedTicket.id}</span>
                </div>
                <div className={styles.actions}>
                    <button
                        className={styles.actionButton}
                        title="Update Ticket"
                        onClick={() => alert("Update feature coming soon")}
                    >
                        UPDATE
                    </button>
                    <div className={styles.tabs}>
                        <button
                            className={`${styles.tab} ${activeTab === 'details' ? styles.active : ''}`}
                            onClick={() => setActiveTab('details')}
                        >
                            Details
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'history' ? styles.active : ''}`}
                            onClick={() => setActiveTab('history')}
                        >
                            History
                        </button>
                    </div>
                </div>
            </div>

            <div className={styles.content}>
                {activeTab === 'details' ? (
                    <>
                        <div className={styles.column}>
                            <div className={styles.sectionHeader}>Ticket Details</div>
                            <div className={styles.field}>
                                <label>Status</label>
                                <div>{selectedTicket.status.toUpperCase()}</div>
                            </div>
                            <div className={styles.field}>
                                <label>Priority</label>
                                <div>{selectedTicket.priority.toUpperCase()}</div>
                            </div>
                            <div className={styles.field}>
                                <label>SLA Deadline</label>
                                <div>{new Date(selectedTicket.sla_deadline_utc).toLocaleString()}</div>
                            </div>
                            <div className={styles.field}>
                                <label>Assignee</label>
                                <div>{selectedTicket.assignee_id || 'Unassigned'}</div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className={styles.log}>
                        <div className={styles.logItem}>[HISTORY] Ticket created</div>
                        <div className={styles.logItem}>[HISTORY] SLA Timer started</div>
                    </div>
                )}
            </div>
        </div>
    );
};
