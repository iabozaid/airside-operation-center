# Design Rationale & Visual Options
**Type**: Visual Authority Definition
**Purpose**: Define 3 distinct aesthetic directions for the Airport Command Center.

## Typography Strategy
**Requirement**: Legibility at distance (Command Center Wall) + Density (Workstation).
**Selection**: [Inter](https://fonts.google.com/specimen/Inter) or [Roboto](https://fonts.google.com/specimen/Roboto).
**Scale**:
- **Display**: 32px (Headers, KPI)
- **Heading**: 20px (Section Titles)
- **Body**: 16px (Standard Reading - Critical for Operator Fatigue)
- **Dense**: 14px (Data Tables)
- **Micro**: 12px (Metadata/Timestamps - Minimum legible)

## Color System Options

### Option A: "International" (Safe, Corporate, Slate)
*The default choice for aviation software. Professional, low-risk, calm.*
- **Background**: Slate-900 (`#0f172a`)
- **Surface**: Slate-800 (`#1e293b`)
- **Accent**: Blue-600 (`#2563eb`) - Standard Action
- **Status**:
  - Critical: Red-600 (`#dc2626`)
  - Warning: Amber-500 (`#f59e0b`)
  - Good: Emerald-500 (`#10b981`)
- **Text**: White / Slate-300

### Option B: "Midnight Command" (High Contrast, Tactical, Obsidian)
*Optimized for low-light control rooms. High contrast for alert visibility.*
- **Background**: Neutral-950 (`#0a0a0a`) - Pure Black feel
- **Surface**: Neutral-900 (`#171717`) - Subtle distinction
- **Accent**: Indigo-500 (`#6366f1`) - Sharp, Digital
- **Status**:
  - Critical: Rose-600 (`#e11d48`) - Neon hint
  - Warning: Orange-500 (`#f97316`)
  - Good: Cyan-500 (`#06b6d4`)
- **Text**: Gray-50 / Gray-400

### Option C: "Polar" (High Key, Sterile, Medical)
*Daytime operations or brightly lit environments. Clinical precision.*
- **Background**: Gray-100 (`#f3f4f6`)
- **Surface**: White (`#ffffff`)
- **Accent**: Teal-700 (`#0f766e`) - Authoritative, calm
- **Status**:
  - Critical: Red-700 (`#b91c1c`) - Darker for readability on light
  - Warning: Yellow-600 (`#ca8a04`)
  - Good: Green-700 (`#15803d`)
- **Text**: Slate-900 / Slate-500

## Layout Contracts (Non-Negotiable)
- **Header**: Fixed 64px.
- **Main**: Flex Grow. Zone 1 (Map) + Zone 2 (Queue).
- **Workbench**: Fixed 320px.
- **Queue**: Fixed 420px (Sidebar).

## Visual Evidence Contracts
Every interface MUST explicitly render:
1. **Live Camera Placeholder** (Crosshatched box with REC indicator).
2. **Media Gallery** (Grid of 16:9 thumbnails).
3. **Map Markers** with distinct shapes/colors for Human vs Asset.
