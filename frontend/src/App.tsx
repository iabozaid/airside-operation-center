import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Shell from './components/layout/Shell';
import { EventProvider } from './contexts/EventContext';

// Canonical Imports (Prevents Duplicates)
import {
    OpsPage,
    TicketsPage,
    FleetDashboardPage,
    RoboticsDashboardPage, // Updated
    AnalyticsPage,
    MasterDashboardPage,
    PlaceholderPage,
    OperationsDashboardPage,
    SimulationControlPage
} from './pages';

const App: React.FC = () => {
    return (
        <EventProvider>
            <BrowserRouter>
                <Shell>
                    <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<MasterDashboardPage />} />

                        {/* Swapped OpsPage for new OperationsDashboardPage */}
                        <Route path="/ops" element={<OperationsDashboardPage />} />

                        <Route path="/fleet" element={<FleetDashboardPage />} />
                        <Route path="/robots" element={<RoboticsDashboardPage />} />
                        {/* Unified Command Center Routing */}
                        <Route path="/tickets" element={<Navigate to="/ops?view=tickets&tab=active&panel=control" replace />} />
                        <Route path="/analytics" element={<Navigate to="/ops?view=analytics&tab=active&panel=intel" replace />} />
                        <Route path="/incident/:id" element={<OperationsDashboardPage />} /> {/* Placeholder to prevent 404, maps to Ops for now */}
                        <Route path="/simulation" element={<SimulationControlPage />} />
                    </Routes>
                </Shell>
            </BrowserRouter>
        </EventProvider>
    );
};

export default App;
// Force Re-Render
