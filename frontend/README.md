# Airside Operation Center (AOC)

**Unified Command & Control Interface**

A next-generation frontend for managing critical airside operations, featuring real-time dashboards, incident management, and high-fidelity simulation capabilities.

## 🚀 Key Features

### 1. Master Dashboard
A centralized view of the entire airport status.
- **Live Traffic**: Active, delayed, and critical flight metrics.
- **Gate Efficiency**: Utilization heatmaps and status monitoring.
- **Resource Allocation**: Real-time tracking of crew and ground support teams.
- **Meteorology**: Integrated weather data for operational planning.

### 2. Simulation Control (`/simulation`)
A dedicated environment for training and system verification.
- **Scenario Injection**: Run predefined scenarios (e.g., Fleet Safety Violations, Baggage Robotics Failure).
- **Safe Execution**: Completely isolated from production data using a "Demo Mode Safeguard".
- **Instant Feedback**: Visual progress tracking and rigorous state management.

### 3. Unified Operations Console (`/ops`)
The primary workbench for operators.
- **Incident Queue**: Prioritized list of active alerts and tickets.
- **Situational Map**: Geospatial visualization of assets and incidents.
- **SLA Tracking**: Real-time countdowns for efficient resolution.

## 🛠️ Technology Stack
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite (Lightning-fast HMR)
- **Styling**: CSS Modules (Scoped, performance-first)
- **Icons**: Lucide React

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation
```bash
npm install
```

### Development
Start the local development server (Default port: 5173 or 5174).
```bash
npm run dev
```

### Build for Production
Create an optimized static build in the `dist/` directory.
```bash
npm run build
```

## 🔐 Security & Access
- **Demo Mode**: The application includes a built-in demo mode for offline demonstration and testing.
- **Authentication**: JWT-based flow (Mocked in demo mode).

---
*Command & Control Systems Division*
