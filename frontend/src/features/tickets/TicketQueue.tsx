import React from 'react';
import { Ticket } from '../../state/ticketTypes';

interface TicketQueueProps {
    onSelect: (ticket: Ticket) => void;
    selectedId?: string;
    tickets: Ticket[];
}

export const TicketQueue: React.FC<TicketQueueProps> = ({ onSelect, selectedId, tickets }) => {

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'var(--color-status-error)';
            case 'in_progress': return 'var(--color-status-warning)';
            case 'resolved': return 'var(--color-status-success)';
            default: return 'var(--color-text-dim)';
        }
    };

    return (
        <div style={{ height: '100%', overflowY: 'auto', borderRight: '1px solid var(--color-bg-sidebar)' }}>
            <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-bg-sidebar)', backgroundColor: 'var(--color-bg-surface-dim)' }}>
                <div className="text-small" style={{ fontWeight: 600 }}>TICKET QUEUE <span style={{ opacity: 0.7 }}>({tickets.length})</span></div>
            </div>
            {tickets.length === 0 ? (
                <div style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--color-text-dim)' }}>No tickets found.</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {tickets.map(ticket => (
                        <div
                            key={ticket.id}
                            onClick={() => onSelect(ticket)}
                            style={{
                                padding: 'var(--space-3) var(--space-4)',
                                borderBottom: '1px solid var(--color-bg-sidebar)',
                                borderLeft: `4px solid ${getStatusColor(ticket.status)}`,
                                cursor: 'pointer',
                                backgroundColor: ticket.id === selectedId ? 'var(--color-bg-hover)' : 'transparent'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span className="text-small" style={{ fontWeight: 600 }}>{ticket.id.slice(0, 8)}...</span>
                                <span className="text-tiny" style={{ color: 'var(--color-text-secondary)' }}>
                                    {ticket.created_at_utc ? new Date(ticket.created_at_utc).toLocaleTimeString() : 'N/A'}
                                </span>
                            </div>
                            <div className="text-tiny" style={{ marginTop: 2, fontWeight: 500 }}>{ticket.title}</div>
                            <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                                <span className="text-tiny" style={{
                                    backgroundColor: 'var(--color-bg-canvas)',
                                    padding: '1px 4px',
                                    borderRadius: 2,
                                    border: '1px solid var(--color-bg-sidebar)'
                                }}>{ticket.status.toUpperCase()}</span>
                                <span className="text-tiny" style={{ color: 'var(--color-text-dim)' }}>{ticket.priority.toUpperCase()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
