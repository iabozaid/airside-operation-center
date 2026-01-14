import React, { useState } from 'react';
import styles from './Workbench.module.css';
import { OpsIncident } from '../../state/opsTypes';
import { EvidenceItem } from '../../state/eventReducer';
import { UI_FLAGS, MOCK_LOGS } from '../../constants/uiConstants';

interface WorkbenchProps {
    selectedIncident: OpsIncident | null;
    onClaim: (id: string) => Promise<void>;
    onViewEvidence: (id: string) => Promise<void>;
    evidence: EvidenceItem[];
    loadingEvidence: boolean;
}

export function Workbench({
    selectedIncident,
    onClaim,
    onViewEvidence,
    evidence,
    loadingEvidence
}: WorkbenchProps) {
    const [activeTab, setActiveTab] = useState<'details' | 'evidence'>('details');

    if (!selectedIncident) {
        return (
            <div className={styles.empty}>
                <p>SELECT AN ITEM TO VIEW DETAILS</p>
            </div>
        );
    }

    const handleEvidenceClick = () => {
        setActiveTab('evidence');
        onViewEvidence(selectedIncident.id);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleInfo}>
                    <div className={styles.title}>{selectedIncident.title}</div>
                    <span className={styles.idBadge}>ID: {selectedIncident.id}</span>
                </div>
                <div className={styles.actions}>
                    <button
                        className={styles.actionButton}
                        onClick={() => onClaim(selectedIncident.id)}
                        title="Claim Incident"
                    >
                        CLAIM INCIDENT
                    </button>
                    <div className={styles.tabs}>
                        <button
                            className={`${styles.tab} ${activeTab === 'details' ? styles.active : ''}`}
                            onClick={() => setActiveTab('details')}
                        >
                            Details
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'evidence' ? styles.active : ''}`}
                            onClick={handleEvidenceClick}
                        >
                            Evidence
                        </button>
                    </div>
                </div>
            </div>

            <div className={styles.content}>
                {activeTab === 'details' ? (
                    <>
                        <div className={styles.column}>
                            <div className={styles.sectionHeader}>Details</div>
                            <div className={styles.field}>
                                <label>Status</label>
                                <div>{selectedIncident.status.toUpperCase()}</div>
                            </div>
                            <div className={styles.field}>
                                <label>Priority</label>
                                <div>{selectedIncident.priority.toUpperCase()}</div>
                            </div>
                            <div className={styles.field}>
                                <label>Location</label>
                                <div>{selectedIncident.location.lat}, {selectedIncident.location.lng}</div>
                            </div>
                        </div>

                        <div className={styles.column}>
                            <div className={styles.sectionHeader}>Activity Log</div>
                            <div className={styles.log}>
                                <div className={styles.logItem}>[RECORDED] System flagged anomaly</div>
                                <div className={styles.logItem}>[RECORDED] Initial report received</div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className={styles.evidencePanel}>
                        <div className={styles.sectionHeader}>Attached Evidence</div>
                        {loadingEvidence ? (
                            <div>Loading evidence...</div>
                        ) : evidence.length === UI_FLAGS.IS_EMPTY ? (
                            <div>No evidence found.</div>
                        ) : (
                            <div className={styles.evidenceGrid}>
                                {evidence.map(ev => (
                                    <div key={ev.id} className={styles.evidenceItem}>
                                        <strong>{ev.type.toUpperCase()}</strong>: {ev.label}
                                        <br />
                                        <small>{ev.timestamp}</small>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
