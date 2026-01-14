# Verification: Context Pages & Architecture

## Objective
Verify that all strict architectural routes exist, use the V2 Design System, and adhere to "Context Switching" rules.

## strict Route Checklist (Must No-Op 404)
- [ ] **`/ops`**: Commands Center Dashboard (Main).
- [ ] **`/fleet`**: Fleet Management Context (Stub).
- [ ] **`/tickets`**: Ticketing Context (Stub).
- [ ] **`/analytics`**: Analytics Context (Stub).
- [ ] **`/simulation`**: Simulation Control Plane (Functional).

## Visual Authority & Token Gates
- [ ] **Token Discipline**: `verify_tokens.py` must pass with exit code 0.
- [ ] **Stubs**: Must show "Context Under Implementation" with darker aesthetics (Deep Obsidian).
- [ ] **Simulation**: Must include "Standard Operations" card and "Time Warp" controls.

## Layout & Scroll Rules
- [ ] **No Body Scroll**: `document.body.style.overflow` should be `hidden`.
- [ ] **Content Scroll**: Only specific zones (Workbench/Queue/SimulationContainer) should scroll.

## Manual Test Steps
1. Navigate to `/ops`. Confirm 3-zone layout.
2. Click "Fleet Manager" in sidebar (or type `/fleet`). Confirm Stub Page loads.
3. Click "Return to Operations" button. Confirm navigation back to `/ops`.
4. Navigate to `/simulation`. Confirm Scenario Grid appears.
5. Resize window > 768px. Confirm NO horizontal scrollbars.
