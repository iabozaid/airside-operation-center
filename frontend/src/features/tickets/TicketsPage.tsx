import React, { useState, useEffect } from 'react';
import { TicketQueue } from './TicketQueue';
import { TicketWorkbench } from './TicketWorkbench';
import { Ticket } from '../../state/ticketTypes';

export const TicketsPage: React.FC = () => {
    const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [tickets, setTickets] = useState<Ticket[]>([]);

    // UI Contract: Loading & Error States
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        setError(null);

        fetch('/tickets')
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(data => {
                if (mounted) {
                    setTickets(Array.isArray(data) ? data : []);
                }
            })
            .catch(err => {
                console.error("Failed to fetch tickets", err);
                if (mounted) setError("Failed to load tickets");
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });

        return () => { mounted = false; };
    }, []);

    const handleSelect = (ticket: Ticket) => {
        setSelectedTicket(ticket);
        setSelectedId(ticket.id);
    };

    if (loading) return <div style={{ padding: 20, color: '#fff' }}>Loading Tickets...</div>;
    if (error) return <div style={{ padding: 20, color: 'var(--color-error)' }}>Error: {error}</div>;

    return (
        <div style={{ display: 'flex', height: '100%' }}>
            {/* Zone 1: Queue */}
            <div style={{
                width: 'var(--sidebar-width)',
                backgroundColor: 'var(--color-bg-surface)',
                height: '100%',
                borderRight: '1px solid var(--color-bg-sidebar)',
                overflow: 'hidden'
            }}>
                <TicketQueue
                    tickets={tickets}
                    onSelect={handleSelect}
                    selectedId={selectedId}
                />
            </div>

            {/* Zone 2: Context / Map (Placeholder) */}
            <div style={{
                flex: 1,
                backgroundColor: '#1a1f24',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-dim)'
            }}>
                {/* Future Map Integration */}
                <div>TICKET GEOSPATIAL VIEW</div>
            </div>

            {/* Zone 3: Workbench */}
            <div style={{
                width: 400,
                backgroundColor: 'var(--color-bg-surface)',
                borderLeft: '1px solid var(--color-bg-sidebar)',
                height: '100%'
            }}>
                <TicketWorkbench selectedTicket={selectedTicket} />
            </div>
        </div>
    );
};
