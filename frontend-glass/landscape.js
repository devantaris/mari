/* ========================================================
   Glass Lens — Decision Landscape Canvas
   2D Risk × Uncertainty visualization with decision regions
   ======================================================== */

// ---- State ----
let canvas, ctx;
let transactionHistory = [];
let currentPoint = null;
let isDark = true;

// ---- Decision Region Colors (Vibrant Neon to match CSS) ----
const REGION_COLORS = {
    dark: {
        APPROVE: { fill: 'rgba(0, 255, 204, 0.1)', border: 'rgba(0, 255, 204, 0.4)' },
        ABSTAIN: { fill: 'rgba(189, 0, 255, 0.1)', border: 'rgba(189, 0, 255, 0.4)' },
        STEP_UP_AUTH: { fill: 'rgba(255, 170, 0, 0.1)', border: 'rgba(255, 170, 0, 0.4)' },
        ESCALATE_INVEST: { fill: 'rgba(255, 51, 102, 0.1)', border: 'rgba(255, 51, 102, 0.4)' },
        DECLINE: { fill: 'rgba(255, 0, 51, 0.1)', border: 'rgba(255, 0, 51, 0.4)' },
    },
    light: {
        APPROVE: { fill: 'rgba(0, 255, 204, 0.15)', border: 'rgba(0, 255, 204, 0.6)' },
        ABSTAIN: { fill: 'rgba(189, 0, 255, 0.15)', border: 'rgba(189, 0, 255, 0.6)' },
        STEP_UP_AUTH: { fill: 'rgba(255, 170, 0, 0.15)', border: 'rgba(255, 170, 0, 0.6)' },
        ESCALATE_INVEST: { fill: 'rgba(255, 51, 102, 0.15)', border: 'rgba(255, 51, 102, 0.6)' },
        DECLINE: { fill: 'rgba(255, 0, 51, 0.15)', border: 'rgba(255, 0, 51, 0.6)' },
    },
};

const DOT_COLORS = {
    APPROVE: '#00ffcc',
    ABSTAIN: '#bd00ff',
    STEP_UP_AUTH: '#ffaa00',
    ESCALATE_INVEST: '#ff3366',
    DECLINE: '#ff0033',
};

// ---- Thresholds from decision_engine.py ----
const T_DECLINE = 0.80;
const T_ESCALATE = 0.60;
const T_AUTH = 0.30;
const U_THRESHOLD = 0.02;

// ---- Canvas coordinate system ----
// X-axis: Risk Score  [0.0, 1.0]
// Y-axis: Uncertainty [0.0, 0.10] (displayed top=high, bottom=low)
const RISK_MIN = 0, RISK_MAX = 1;
const UNC_MIN = 0, UNC_MAX = 0.10;

// Margins
const MARGIN = { top: 16, right: 16, bottom: 44, left: 54 };

function getPlotArea() {
    const dpr = window.devicePixelRatio || 1;
    const w = (canvas.width / dpr) - MARGIN.left - MARGIN.right;
    const h = (canvas.height / dpr) - MARGIN.top - MARGIN.bottom;
    return { x: MARGIN.left, y: MARGIN.top, w, h };
}

function riskToX(risk) {
    const { x, w } = getPlotArea();
    return x + ((risk - RISK_MIN) / (RISK_MAX - RISK_MIN)) * w;
}

function uncToY(unc) {
    const { y, h } = getPlotArea();
    // Invert: high uncertainty at top
    return y + h - ((unc - UNC_MIN) / (UNC_MAX - UNC_MIN)) * h;
}

// ---- Drawing ----
function drawRegions() {
    const theme = isDark ? 'dark' : 'light';
    const colors = REGION_COLORS[theme];
    const { y, h } = getPlotArea();

    const regions = [
        // APPROVE: risk < 0.30, uncertainty < 0.02
        {
            decision: 'APPROVE',
            path: () => {
                ctx.beginPath();
                ctx.moveTo(riskToX(0), uncToY(0));
                ctx.lineTo(riskToX(T_AUTH), uncToY(0));
                ctx.lineTo(riskToX(T_AUTH), uncToY(U_THRESHOLD));
                ctx.lineTo(riskToX(0), uncToY(U_THRESHOLD));
                ctx.closePath();
            },
        },
        // ABSTAIN: risk < 0.30, uncertainty >= 0.02
        {
            decision: 'ABSTAIN',
            path: () => {
                ctx.beginPath();
                ctx.moveTo(riskToX(0), uncToY(U_THRESHOLD));
                ctx.lineTo(riskToX(T_AUTH), uncToY(U_THRESHOLD));
                ctx.lineTo(riskToX(T_AUTH), uncToY(UNC_MAX));
                ctx.lineTo(riskToX(0), uncToY(UNC_MAX));
                ctx.closePath();
            },
        },
        // STEP_UP_AUTH: 0.30 <= risk < 0.60, any uncertainty
        // and 0.60 <= risk < 0.80, uncertainty < 0.02
        {
            decision: 'STEP_UP_AUTH',
            path: () => {
                ctx.beginPath();
                // Left block: 0.30 to 0.60, full height
                ctx.moveTo(riskToX(T_AUTH), uncToY(0));
                ctx.lineTo(riskToX(T_ESCALATE), uncToY(0));
                ctx.lineTo(riskToX(T_ESCALATE), uncToY(UNC_MAX));
                ctx.lineTo(riskToX(T_AUTH), uncToY(UNC_MAX));
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                // Right block: 0.60 to 0.80, uncertainty < 0.02
                ctx.beginPath();
                ctx.moveTo(riskToX(T_ESCALATE), uncToY(0));
                ctx.lineTo(riskToX(T_DECLINE), uncToY(0));
                ctx.lineTo(riskToX(T_DECLINE), uncToY(U_THRESHOLD));
                ctx.lineTo(riskToX(T_ESCALATE), uncToY(U_THRESHOLD));
                ctx.closePath();
            },
        },
        // ESCALATE_INVEST: risk >= 0.60, uncertainty >= 0.02
        {
            decision: 'ESCALATE_INVEST',
            path: () => {
                ctx.beginPath();
                ctx.moveTo(riskToX(T_ESCALATE), uncToY(U_THRESHOLD));
                ctx.lineTo(riskToX(RISK_MAX), uncToY(U_THRESHOLD));
                ctx.lineTo(riskToX(RISK_MAX), uncToY(UNC_MAX));
                ctx.lineTo(riskToX(T_ESCALATE), uncToY(UNC_MAX));
                ctx.closePath();
            },
        },
        // DECLINE: risk >= 0.80, uncertainty < 0.02
        {
            decision: 'DECLINE',
            path: () => {
                ctx.beginPath();
                ctx.moveTo(riskToX(T_DECLINE), uncToY(0));
                ctx.lineTo(riskToX(RISK_MAX), uncToY(0));
                ctx.lineTo(riskToX(RISK_MAX), uncToY(U_THRESHOLD));
                ctx.lineTo(riskToX(T_DECLINE), uncToY(U_THRESHOLD));
                ctx.closePath();
            },
        },
    ];

    regions.forEach(r => {
        const c = colors[r.decision];
        ctx.fillStyle = c.fill;
        ctx.strokeStyle = c.border;
        ctx.lineWidth = 1;
        r.path();
        ctx.fill();
        ctx.stroke();
    });
}

function drawAxes() {
    const { x, y, w, h } = getPlotArea();
    const textColor = isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)';
    const lineColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)';

    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1;

    // X-axis labels
    ctx.fillStyle = textColor;
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    for (let r = 0; r <= 1; r += 0.2) {
        const px = riskToX(r);
        ctx.fillText(r.toFixed(1), px, y + h + 6);

        // Grid line
        ctx.beginPath();
        ctx.moveTo(px, y);
        ctx.lineTo(px, y + h);
        ctx.stroke();
    }

    // X-axis title
    ctx.fillStyle = textColor;
    ctx.font = '12px "Inter", sans-serif';
    ctx.fillText('Risk Score →', x + w / 2, y + h + 24);

    // Y-axis labels
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.font = '11px "JetBrains Mono", monospace';

    for (let u = 0; u <= 0.10; u += 0.02) {
        const py = uncToY(u);
        ctx.fillText(u.toFixed(2), x - 6, py);

        // Grid line
        ctx.beginPath();
        ctx.moveTo(x, py);
        ctx.lineTo(x + w, py);
        ctx.stroke();
    }

    // Y-axis title
    ctx.save();
    ctx.translate(14, y + h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.font = '12px "Inter", sans-serif';
    ctx.fillText('Uncertainty ↑', 0, 0);
    ctx.restore();
}

function drawThresholdLines() {
    const { y, h } = getPlotArea();
    const color = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)';

    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;

    // Vertical threshold lines (risk)
    [T_AUTH, T_ESCALATE, T_DECLINE].forEach(t => {
        ctx.beginPath();
        ctx.moveTo(riskToX(t), y);
        ctx.lineTo(riskToX(t), y + h);
        ctx.stroke();
    });

    // Horizontal threshold (uncertainty)
    const { x, w } = getPlotArea();
    ctx.beginPath();
    ctx.moveTo(x, uncToY(U_THRESHOLD));
    ctx.lineTo(x + w, uncToY(U_THRESHOLD));
    ctx.stroke();

    ctx.setLineDash([]);
}

function drawPoints() {
    // History points (faded)
    transactionHistory.forEach((pt, i) => {
        const alpha = Math.max(0.15, 1 - (i / transactionHistory.length) * 0.8);
        const color = DOT_COLORS[pt.decision] || '#00e5ff';
        const px = riskToX(pt.risk);
        const py = uncToY(Math.min(pt.uncertainty, UNC_MAX));

        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = 4;
        ctx.shadowColor = color;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    });

    // Current point (glowing)
    if (currentPoint) {
        const color = DOT_COLORS[currentPoint.decision] || '#00e5ff';
        const px = riskToX(currentPoint.risk);
        const py = uncToY(Math.min(currentPoint.uncertainty, UNC_MAX));

        // Glow
        ctx.beginPath();
        ctx.arc(px, py, 14, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(px, py, 2, px, py, 14);
        grad.addColorStop(0, color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fill();

        // Dot
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.shadowBlur = 0;
    }
}

function render() {
    isDark = document.documentElement.getAttribute('data-theme') !== 'light';

    // Clear inline styles so CSS can recalculate 100% width correctly
    canvas.style.width = '';
    canvas.style.height = '';

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    // Force a perfect square based on width
    const size = rect.width;

    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    // Lock the inline styles to the square dimension
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';

    // Clear
    ctx.clearRect(0, 0, size, size);

    drawRegions();
    drawAxes();
    drawThresholdLines();
    drawPoints();
}

// ---- Public API ----
export function initLandscape(canvasEl) {
    canvas = canvasEl;
    ctx = canvas.getContext('2d');
    render();
}

export function plotTransaction(risk, uncertainty, decision) {
    // Add previous current to history
    if (currentPoint) {
        transactionHistory.unshift(currentPoint);
        if (transactionHistory.length > 30) transactionHistory.pop();
    }
    currentPoint = { risk, uncertainty, decision };
    render();
}

export function clearHistory() {
    transactionHistory = [];
    currentPoint = null;
    render();
}
