import React from 'react';
import { OpsIncident } from '../../state/opsTypes';
import { AlertCircle, CheckCircle, Navigation, ShieldAlert, UserPlus, FileText } from 'lucide-react';
import styles from './IncidentDetailPanel.module.css';

interface IncidentDetailPanelProps {
    incident: OpsIncident | null;
    onAction: (action: string, incidentId: string) => void;
}

export const IncidentDetailPanel: React.FC<IncidentDetailPanelProps> = ({ incident, onAction }) => {

    if (!incident) {
        return (
            <div className={styles.panelWrapper}>
                <div className={styles.emptyState}>
                    <FileText size={48} color="#cbd5e1" />
                    <p>Select an incident from the queue to view details and take action.</p>
                </div>
            </div>
        );
    }

    const isAcknowledged = incident.status !== 'open';

    return (
        <div className={styles.panelWrapper}>
            <div className={styles.header}>
                <div className={styles.headerTop}>
                    <div className={styles.headerIcon}>
                        <AlertCircle size={28} />
                    </div>
                    <span className={styles.priorityBadge}>{incident.priority} Priority</span>
                </div>

                <h2 className={styles.title}>{incident.title}</h2>
                <div className={styles.meta}>
                    <span>ID #{incident.id}</span>
                    <span>•</span>
                    <span>{incident.timestamp}</span>
                </div>
            </div>

            <div className={styles.scrollBody}>
                {/* Context */}
                <div className={styles.section}>
                    <div className={styles.sectionTitle}>Location & Context</div>
                    <div className={styles.locationCard}>
                        <div className={styles.locMain}>Terminal 2, Gate B12</div>
                        <div className={styles.locSub}>Asset: Fire Sensor FD-88</div>
                        <button className={styles.linkBtn} onClick={() => onAction('center', incident.id)}>
                            <Navigation size={14} style={{ display: 'inline', marginRight: 4 }} />
                            Center on map
                        </button>
                    </div>
                </div>

                {/* Summary */}
                <div className={styles.section}>
                    <div className={styles.sectionTitle}>Incident Summary</div>
                    <p className={styles.summaryText}>
                        {incident.raw?.description || "Automated alert triggered by infrastructure monitoring system. Immediate verification required."}
                    </p>
                    <div className={styles.kvRow}>
                        <span className={styles.kvKey}>Source</span>
                        <span className={styles.kvVal}>System Sensor</span>
                    </div>
                    <div className={styles.kvRow}>
                        <span className={styles.kvKey}>Status</span>
                        <span className={styles.kvVal}>{incident.status.replace('_', ' ').toUpperCase()}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className={styles.section}>
                    <div className={styles.sectionTitle}>Actions</div>

                    <button
                        className={styles.primaryBtn}
                        onClick={() => onAction('acknowledge', incident.id)}
                        disabled={isAcknowledged}
                    >
                        <CheckCircle size={20} />
                        {isAcknowledged ? 'Incident Acknowledged' : 'Acknowledge Incident'}
                    </button>

                    <div className={styles.secondaryGrid}>
                        <button className={styles.secondaryBtn} onClick={() => onAction('assign', incident.id)}>
                            <UserPlus size={18} />
                            Assign
                        </button>
                        <button className={`${styles.secondaryBtn} ${styles.escalateBtn}`} onClick={() => onAction('escalate', incident.id)}>
                            <ShieldAlert size={18} />
                            Escalate
                        </button>
                    </div>
                </div>

                {/* Timeline Placeholder */}
                <div className={styles.section}>
                    <div className={styles.sectionTitle}>Activity Timeline</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic' }}>
                        • Incident detected {incident.timestamp}
                    </div>
                </div>
            </div>
        </div>
    );
};
