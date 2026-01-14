import React, { createContext, useContext, useEffect, useState } from 'react';
import { sseClient, CanonicalEventType } from '../infrastructure/sse_client';

interface EventContextType {
    isConnected: boolean;
    subscribe: (event: CanonicalEventType, callback: (data: any) => void) => () => void;
    // We expose the raw client for specialized needs, but encourage subscribe()
    client: typeof sseClient;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Sync connection state
        const handleConnectionChange = (status: boolean) => setIsConnected(status);
        sseClient.on('connection.change', handleConnectionChange);

        // Auto-connect on mount
        sseClient.connect();

        return () => {
            sseClient.off('connection.change', handleConnectionChange);
            sseClient.disconnect();
        };
    }, []);

    const subscribe = (event: CanonicalEventType, callback: (data: any) => void) => {
        sseClient.on(event, callback);
        return () => {
            sseClient.off(event, callback);
        };
    };

    return (
        <EventContext.Provider value={{ isConnected, subscribe, client: sseClient }}>
            {children}
        </EventContext.Provider>
    );
};

export const useEventStream = () => {
    const context = useContext(EventContext);
    if (!context) {
        throw new Error('useEventStream must be used within an EventProvider');
    }
    return context;
};
