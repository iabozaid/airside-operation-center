export const MAP_DIMENSIONS = {
    ORIGIN: 0,
    WIDTH: 800,
    HEIGHT: 600,
    VIEWBOX: "0 0 800 600"
};

export const RUNWAY_GEOMETRY = {
    ROTATION: "rotate(-15, 400, 300)",
    LEFT: {
        X: 350,
        Y: 50,
        WIDTH: 40,
        HEIGHT: 500,
        RX: 4,
        LABEL_TOP: { X: 370, Y: 80 },
        LABEL_BOTTOM: { X: 370, Y: 530 }
    },
    RIGHT: {
        X: 450,
        Y: 50,
        WIDTH: 40,
        HEIGHT: 500,
        RX: 4,
        LABEL_TOP: { X: 470, Y: 80 }
    }
};

export const TERMINAL_PATHS = {
    ONE: "M 200,250 L 300,250 L 320,350 L 180,350 Z",
    TWO: "M 350,250 L 450,250 L 470,350 L 330,350 Z",
    THREE: "M 500,250 L 600,250 L 620,350 L 480,350 Z",
    FOUR: "M 650,250 L 750,250 L 770,350 L 630,350 Z"
};

export const TERMINAL_LABELS = {
    ONE: { X: 250, Y: 300 },
    TWO: { X: 400, Y: 300 },
    THREE: { X: 550, Y: 300 },
    FOUR: { X: 700, Y: 300 }
};

export const MARKER_GEOMETRY = {
    RECT: {
        X: -6,
        Y: -6,
        WIDTH: 12,
        HEIGHT: 12,
        RX: 2
    },
    CIRCLE: {
        R: 6
    },
    LABEL_OFFSET_Y: -10
};

export const MAP_LABELS = {
    RUNWAY_LEFT_TOP: "01L",
    RUNWAY_LEFT_BOTTOM: "19R",
    RUNWAY_RIGHT_TOP: "01R",
    TERMINAL_ONE: "T1",
    TERMINAL_TWO: "T2",
    TERMINAL_THREE: "T3",
    TERMINAL_FOUR: "T4",
};
export const MARKER_ANIMATION = {
    SELECTED_RADIUS_BASE: 12,
    NORMAL_RADIUS: 8,
    PULSE_R_OFFSET_START: 4,
    PULSE_R_OFFSET_END: 8,
    R_OFFSET_RING: 6,
    DURATION: "1.5s",
    OPACITY_START: "0.8",
    OPACITY_END: "0",
    OPACITY_RING: "0.5",
    TRANSITION: "all 0.3s ease",
    STROKE_WIDTH: "2"
};
