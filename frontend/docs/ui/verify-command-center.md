# Command Center Verification Checklist
**Authority**: Mandatory Compliance Check.
**Warning**: ANY unchecked item = BLOCKED delivery.

## 1. Global Health
- [ ] **Startup**: `npm run dev` starts with **ZERO** errors.
- [ ] **Runtime**: No console errors on initial load.

## 2. Layout & Scroll (The "No Scroll" Rule)
- [ ] **Root Shell**: Verify `html` and `body` have `overflow: hidden` on `/ops`.
- [ ] **Main Dashboard**: Resize window to 1024x768. Ensure **NO** scrollbars appear on the window.
- [ ] **Horizontal Scroll**: At ≥ 768px width, ensure **NO** horizontal scrolling.
- [ ] **Whitelisted Scroll Only**:
    -   `OperationsQueue` container scrolls internally.
    -   `Workbench` content container scrolls internally.
    -   **NO** other element scrolls.
- [ ] **Anti-Cheat Guard**: Verify NO `::-webkit-scrollbar { display: none }` or `scrollbar-width: none` masking used to hide bugs.

## 3. Token Discipline (Hard Gate - Expanded)
- [ ] **Code Scan**: Grep `src/components`, `src/layout`, `src/pages` for forbidden literals:
    -   `#` (hex colors) -> Must be 0 matches.
    -   `rgb(`, `rgba(`, `hsl(`, `hsla(` -> Must be 0 matches.
    -   `px` (except `0px`), `rem`, `em` -> Must be components-free (0 matches in component/layout/page styles).
-   **Visual**: No "default Blue" links.

## 4. Route Safety
-   [ ] **/fleet**: Renders "Consolidated into Ops" + Link to `/ops`.
-   [ ] **/tickets**: Renders "Consolidated into Ops" + Link to `/ops`.
-   [ ] **/analytics**: Renders "Consolidated into Ops" + Link to `/ops`.
-   [ ] **No 404s**: All legacy routes resolve.

## 5. Map Contract (UI Evidence)
-   [ ] **Placeholder**: Renders with grid overlay.
-   [ ] **HUD**: Visibly displays Lat/Lng values.
-   [ ] **Interaction**: Clicking a marker updates visible UI state (selection highlight, panel update). (Console logs alone are NOT enough).

## 6. Accessibility & Motion
-   [ ] **Focus**: Tab navigation shows visible **Green/Accent Focus Ring**.
-   [ ] **Motion**: Enable "Reduce Motion" in OS/DevTools. Verify animations/transitions stop.

## 7. Artifact Binding (Mandatory)
-   [ ] **Walkthrough**: `walkthrough.md` MUST contain the exact text: "Compliance Status: This implementation is COMPLETE only after passing the “Command Center Verification Checklist”."
