// Projection Logic (Lat/Lng -> SVG)
// Riyadh Approx Bounds (Demo)
const BOUNDS = {
    TL: { lat: 24.98, lng: 46.68 },
    BR: { lat: 24.94, lng: 46.72 },
    WIDTH: 800,
    HEIGHT: 600
};

export const projectToSVG = (lat: number, lng: number): { x: number, y: number } => {
    // Linear Interpolation
    const x = ((lng - BOUNDS.TL.lng) / (BOUNDS.BR.lng - BOUNDS.TL.lng)) * BOUNDS.WIDTH;
    const y = ((BOUNDS.TL.lat - lat) / (BOUNDS.TL.lat - BOUNDS.BR.lat)) * BOUNDS.HEIGHT;
    return { x, y };
};

export const getEntityColor = (type: string): string => {
    // Returns CSS Var Name
    switch (type) {
        case 'visitor': return 'var(--color-status-neutral)';
        case 'vehicle': return 'var(--color-status-warning)';
        case 'robot': return 'var(--color-accent)';
        default: return 'var(--color-text-primary)';
    }
};
