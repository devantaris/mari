/* ========================================================
   MARI — Main Application Logic
   Handles API calls, rendering, animations, and UI state
   ======================================================== */

import { initLandscape, plotTransaction, clearHistory } from './landscape.js';

// ---- Config ----
const API_URL = (version) => `/api/predict?version=${version}`;
const DIRECT_API_URL = (version) => `http://localhost:8000/predict?version=${version}`;

// ---- Decision Metadata ----
// SVG icon factory — clean minimal fintech strokes (24×24 viewbox)
const SVG_ICONS = {
    shieldCheck: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>',
    pauseCircle: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="10" y1="15" x2="10" y2="9"/><line x1="14" y1="15" x2="14" y2="9"/></svg>',
    lockKeyhole: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1"/></svg>',
    alertTriangle: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    xOctagon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
};

const DECISION_META = {
    APPROVE: {
        icon: SVG_ICONS.shieldCheck, class: 'verdict-approve',
        label: 'Approved',
        explanation: 'Transaction is safe. Low risk with high model confidence.',
    },
    AUTO_APPROVE: {
        icon: SVG_ICONS.shieldCheck, class: 'verdict-approve',
        label: 'Auto Approved',
        explanation: 'Transaction is safe. Low risk with high model confidence.',
    },
    ABSTAIN: {
        icon: SVG_ICONS.pauseCircle, class: 'verdict-abstain',
        label: 'Abstain — Deferred',
        explanation: 'Low risk but the ensemble models disagree. Decision deferred for safety.',
    },
    STEP_UP_AUTH: {
        icon: SVG_ICONS.lockKeyhole, class: 'verdict-stepup',
        label: 'Step-Up Authentication',
        explanation: 'Medium risk detected. Additional authentication required (e.g., OTP, biometric).',
    },
    STEP_UP: {
        icon: SVG_ICONS.lockKeyhole, class: 'verdict-stepup',
        label: 'Step-Up Authentication',
        explanation: 'Medium risk detected. Additional authentication required (e.g., OTP, biometric).',
    },
    ESCALATE_INVEST: {
        icon: SVG_ICONS.alertTriangle, class: 'verdict-escalate',
        label: 'Escalate to Analyst',
        explanation: 'High risk with model uncertainty, or novel behavior detected. Routed to human fraud analyst.',
    },
    HUMAN_ESCALATE: {
        icon: SVG_ICONS.alertTriangle, class: 'verdict-escalate',
        label: 'Human Escalate',
        explanation: 'High risk with model uncertainty, or novel behavior detected. Routed to human fraud analyst.',
    },
    DECLINE: {
        icon: SVG_ICONS.xOctagon, class: 'verdict-decline',
        label: 'Declined',
        explanation: 'High risk with high model confidence. Transaction auto-blocked.',
    },
    AUTO_DECLINE: {
        icon: SVG_ICONS.xOctagon, class: 'verdict-decline',
        label: 'Auto Declined',
        explanation: 'Dempster-Shafer resolved uncertainty to confirm high-confidence fraud. Transaction auto-blocked.',
    },
    PEND: {
        icon: SVG_ICONS.pauseCircle, class: 'verdict-abstain',
        label: 'Pending Decision (PEND)',
        explanation: 'Unresolved uncertainty detected. Held in pending state with automated reason codes.',
    }
};

// ---- Preset Demo Payloads ----
// Instead of brute-forcing (random features never trigger high fraud scores),
// presets construct realistic demo responses that show what each decision looks like.
// "Generate Random" still calls the real API.
const PRESET_DEMOS = {
    approve: () => [160760.0, -0.674466064578314, 1.40810501967799, -1.11062205357093, -1.32836577843066, 1.38899603254837, -1.30843906707795, 1.88587890268717, -0.614232966299775, 0.311652212453101, 0.65075700363522, -0.857784661547805, -0.229961445775592, -0.19981700479103, 0.266371326329879, -0.0465441684754424, -0.741398089749789, -0.605616644106022, -0.39256818789208, -0.162648311024695, 0.394321820843914, 0.0800842396026648, 0.810033595602455, -0.224327230436412, 0.707899237446867, -0.13583702273753, 0.0451021964988772, 0.533837219064273, 0.291319252625364, 23.0, 0.0],
    decline: () => [57007.0, -1.27124419171437, 2.46267526851135, -2.85139500331783, 2.3244800653478, -1.37224488981369, -0.948195686538643, -3.06523436172054, 1.16692694787211, -2.26877058844813, -4.88114292689057, 2.25514748870463, -4.68638689759229, 0.652374668512965, -6.17428834800643, 0.594379608016446, -4.84969238709652, -6.53652073527011, -3.11909388163881, 1.71549441975915, 0.560478075726644, 0.652941051330455, 0.0819309763507574, -0.221347831198339, -0.523582159233306, 0.224228161862968, 0.756334522703558, 0.632800477330469, 0.250187092757197, 0.01, 0.0],
    stepup: () => [26217.0, -17.9506309618309, 11.0670686608049, -20.7426595223452, 6.07553050760549, -13.3897649672385, -4.53288835377002, -15.1881457975285, 12.1010620553144, -4.02687989330881, -9.01741297442937, 6.07064975176212, -8.56786450085983, -0.0019002661806679, -9.30123300164911, 0.0197959820179134, -7.35212004645984, -13.923225303931, -4.98830380644959, 1.34765631107896, 1.71290938237055, 1.7971341252338, -1.27567465936041, -0.705045810296498, 0.102039840024336, 1.17747721389029, -0.23873007615266, 1.55446335204436, 0.547947820129286, 1.0, 3.0],
    abstain: () => [141487.0, 1.44743458080402, 0.138511183635237, -0.576768746002758, 4.24487022367047, -0.102371423150805, 0.578114987371433, -0.701464590994561, 0.369376729649194, -0.351267603151895, 0.161401713773405, 1.00912477307042, -0.180862634373815, 0.125546518064188, -3.43097834029619, -0.361421339544459, 2.999298180107, 0.886773431995449, 2.39897191611555, -2.10108736045659, 0.209728844087776, 0.189460105978499, 0.233639104982466, 0.0106652506766296, -0.630912006329531, -0.547101109385506, -0.0451407490684571, 0.0493892975579404, 0.0692335501352738, 179.63, 0.0],
    escalate: () => [128759.0, -1.2721170378153, 1.82761538129723, -3.81060977838022, 0.583759429066067, -0.641241659911406, -1.38904348579078, -1.95405395436729, 1.17391997369635, -2.05319134425828, -3.34506130667145, 2.37640423683332, -2.53805206931871, -0.0904541466730078, -2.42616754529086, -1.61864781114481, -3.51594398365266, -6.19900773693385, -2.41060577215255, 0.760435151630973, -0.0272684521661314, 0.858998001255691, 0.858774883586953, 0.0830791493463243, 0.741676007542821, -0.173233871025323, 0.534870071750152, 0.183562195629891, 0.0203162223012201, 0.76, 0.0],
};

// ---- State ----
let history = [];
let isAnalyzing = false;

// ---- DOM Refs ----
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ---- Helpers ----
function gaussRand() {
    // Box-Muller transform for normal distribution
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function generateRandomTransaction() {
    const time = Math.random() * 172800;
    const amount = Math.random() * 4999 + 1;
    const pca = Array.from({ length: 28 }, () => gaussRand());
    const lastTxnTime = history.length > 0 ? history[0].features[0] : time;
    const deltaTime = Math.max(0, time - lastTxnTime);
    return [time, ...pca, amount, deltaTime];
}

function formatCurrency(val) {
    if (val == null) return '—';
    const sign = val < 0 ? '−' : '';
    return `${sign}$${Math.abs(val).toFixed(2)}`;
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
}

// ---- API ----

async function callAPI(features) {
    // Try proxy first (Vite dev), fall back to direct
    let lastErr;
    const versionSelect = document.getElementById('versionSelect');
    const version = versionSelect ? versionSelect.value : 'V4';
    for (const url of [API_URL(version), DIRECT_API_URL(version)]) {
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ features }),
            });
            if (!res.ok) { lastErr = new Error(`HTTP ${res.status}`); continue; }
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            return data.result || data;
        } catch (e) {
            lastErr = e;
            continue;
        }
    }
    throw lastErr || new Error('API not reachable');
}

async function checkHealth() {
    const status = $('#apiStatus');
    // Try proxy first (avoids CORS), then direct
    for (const url of ['/api/', 'http://localhost:8000/']) {
        try {
            const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
            if (res.ok) {
                status.className = 'status-indicator online';
                status.querySelector('.status-text').textContent = 'API Connected';
                return true;
            }
        } catch {
            continue;
        }
    }
    status.className = 'status-indicator offline';
    status.querySelector('.status-text').textContent = 'API Offline';
    return false;
}

// ---- Rendering ----
function showState(state) {
    const empty = $('#emptyState');
    const loading = $('#loadingState');
    const layers = $('#layersContainer');

    empty.classList.toggle('hidden', state !== 'empty');
    loading.classList.toggle('hidden', state !== 'loading');
    layers.classList.toggle('hidden', state !== 'analysis');
}

function renderAnalysis(features, payload) {
    // Transaction Summary
    $('#txnAmount').textContent = `$${features[features.length - 2].toFixed(2)}`;
    $('#txnTime').textContent = formatTime(features[0]);

    // Layer 1: Risk
    const risk = payload.risk_score || 0;
    const tier = payload.tier || 'low_risk';
    $('#riskScore').textContent = risk.toFixed(6);
    const riskProg = $('#riskProgress');
    riskProg.style.width = `${Math.min(risk * 100, 100)}%`;

    // Color the progress bar based on tier
    if (tier === 'high_risk') {
        riskProg.style.background = `linear-gradient(90deg, var(--color-stepup), var(--color-decline))`;
        riskProg.style.color = 'var(--color-decline)';
        riskProg.style.boxShadow = '0 0 15px var(--color-decline)';
    } else if (tier === 'medium_risk') {
        riskProg.style.background = `linear-gradient(90deg, var(--color-approve), var(--color-stepup))`;
        riskProg.style.color = 'var(--color-stepup)';
        riskProg.style.boxShadow = '0 0 15px var(--color-stepup)';
    } else {
        riskProg.style.background = `linear-gradient(90deg, var(--color-primary), var(--color-approve))`;
        riskProg.style.color = 'var(--color-approve)';
        riskProg.style.boxShadow = '0 0 15px var(--color-approve)';
    }

    // Tier badge
    const tierBadge = $('#tierBadge');
    tierBadge.textContent = tier.replace('_', ' ');
    tierBadge.className = 'tier-badge ' + (
        tier === 'high_risk' ? 'tier-high' :
            tier === 'medium_risk' ? 'tier-medium' : 'tier-low'
    );

    // Risk explanation
    const riskExpl = risk >= 0.8 ? 'The ensemble of 5 models strongly agrees this transaction shows fraud patterns.' :
        risk >= 0.3 ? 'The ensemble detects suspicious signals. Some fraud indicators are present.' :
            'The 5-model ensemble finds no significant fraud indicators in this transaction.';
    $('#riskExplanation').textContent = riskExpl;

    // Layer 2: Uncertainty
    const uncertainty = payload.uncertainty || 0;
    const isHighUncertainty = uncertainty >= 0.02;
    $('#uncertaintyValue').textContent = uncertainty.toFixed(6);

    const confBadge = $('#confidenceBadge');
    confBadge.textContent = isHighUncertainty ? 'High Disagreement' : 'Models Agree';
    confBadge.className = 'confidence-badge ' + (isHighUncertainty ? 'confidence-low' : 'confidence-high');

    // Simulate ensemble bars (we don't have individual model probs, so simulate around the mean)
    for (let i = 0; i < 5; i++) {
        const bar = $(`#ebar${i}`);
        const simulated = Math.max(0, Math.min(1, risk + (gaussRand() * uncertainty)));
        bar.style.height = `${Math.max(5, simulated * 100)}%`;

        // Color based on individual probability
        if (simulated > 0.6) {
            bar.style.background = `linear-gradient(to top, transparent, var(--color-decline))`;
            bar.style.boxShadow = `0 -5px 10px rgba(255, 0, 51, 0.4)`;
        } else if (simulated > 0.3) {
            bar.style.background = `linear-gradient(to top, transparent, var(--color-stepup))`;
            bar.style.boxShadow = `0 -5px 10px rgba(255, 170, 0, 0.4)`;
        } else {
            bar.style.background = `linear-gradient(to top, transparent, var(--color-primary))`;
            bar.style.boxShadow = `0 -5px 10px rgba(0, 229, 255, 0.4)`;
        }
    }

    const uncExpl = isHighUncertainty
        ? `Standard deviation of ${uncertainty.toFixed(4)} across the 5 bootstrap models indicates significant disagreement. The models are not confident in their assessment.`
        : `Standard deviation of ${uncertainty.toFixed(4)} shows strong consensus among all 5 models. The assessment is reliable.`;
    $('#uncertaintyExplanation').textContent = uncExpl;

    // Layer 3: Novelty
    const anomalyScore = payload.explanations?.anomaly_score;
    const noveltyFlag = payload.novelty_flag || false;
    $('#anomalyScore').textContent = anomalyScore != null ? anomalyScore.toFixed(6) : 'N/A';

    const novBadge = $('#noveltyBadge');
    novBadge.textContent = noveltyFlag ? 'Novel Pattern' : 'Known Pattern';
    novBadge.className = 'novelty-badge ' + (noveltyFlag ? 'novelty-novel' : 'novelty-normal');

    // Position anomaly dot: map score range roughly [-0.3, 0.1] to [0%, 100%]
    const anomalyDot = $('#anomalyDot');
    if (anomalyScore != null) {
        const mapped = Math.min(100, Math.max(0, ((anomalyScore + 0.3) / 0.4) * 100));
        anomalyDot.style.left = `${mapped}%`;
        anomalyDot.style.display = 'block';
    } else {
        anomalyDot.style.display = 'none';
    }

    const novExpl = noveltyFlag
        ? 'The Isolation Forest (trained solely on legitimate transactions) flags this transaction as having an unseen behavioral pattern.'
        : 'This transaction matches known legitimate behavioral patterns. No novel anomalies detected.';
    $('#noveltyExplanation').textContent = novExpl;

    // Verdict
    const decision = payload.decision || 'APPROVE';
    const meta = DECISION_META[decision] || DECISION_META.APPROVE;
    const verdictCard = $('#verdictCard');

    // Remove old classes
    verdictCard.className = 'verdict-card glass-card layer-hidden ' + meta.class;

    $('#verdictIcon').innerHTML = meta.icon;
    $('#verdictDecision').textContent = decision.replace(/_/g, ' ');
    $('#verdictExplanation').textContent = meta.explanation;

    // Routing rule - fetched directly from API trace for active version
    const trace = payload.trace || {};
    $('#verdictRule').textContent = trace.rule_triggered || '—';

    // Cost
    const costs = payload.costs || {};
    $('#costLoss').textContent = formatCurrency(costs.expected_loss);
    $('#costReview').textContent = formatCurrency(costs.manual_review_cost);
    $('#costUtility').textContent = formatCurrency(costs.net_utility);

    // Meta
    const pmeta = payload.meta || {};
    $('#metaModel').textContent = pmeta.model_version || '—';
    $('#metaMethod').textContent = pmeta.uncertainty_method || '—';
    $('#metaTimestamp').textContent = pmeta.timestamp || '—';

    // RENDER X-RAY DETAIL PANEL
    const v1Dec = trace.v1_decision;
    const v2Dec = trace.v2_decision;
    const v2Prob = trace.v2_svm_prob;
    
    // V2 Second Opinion Trace
    $('#xrayV2Prob').textContent = v2Prob != null ? v2Prob.toFixed(6) : '0.000000';
    const v2Badge = $('#xrayV2Status');
    if (v1Dec === 'ABSTAIN') {
        if (v2Dec === 'APPROVE') {
            v2Badge.textContent = 'Cleared to APPROVE';
            v2Badge.className = 'xray-status-badge tier-low';
        } else {
            v2Badge.textContent = 'Retained as ABSTAIN';
            v2Badge.className = 'xray-status-badge tier-medium';
        }
    } else {
        v2Badge.textContent = 'Not Applicable';
        v2Badge.className = 'xray-status-badge';
    }

    // V3 Dempster-Shafer Trace
    const v3Dec = trace.v3_decision;
    const belF = trace.ds_bel_F;
    const ign = trace.ds_ignorance;
    const K = trace.ds_conflict_K;
    const xrayV3 = $('#xrayV3');
    
    if (v2Dec === 'ESCALATE_INVEST') {
        xrayV3.style.opacity = '1';
        $('#xrayV3Belief').textContent = belF != null ? belF.toFixed(6) : '0.000000';
        $('#xrayV3Ignorance').textContent = ign != null ? ign.toFixed(6) : '0.000000';
        $('#xrayV3Conflict').textContent = K != null ? K.toFixed(6) : '0.000000';
    } else {
        xrayV3.style.opacity = '0.4';
        $('#xrayV3Belief').textContent = '—';
        $('#xrayV3Ignorance').textContent = '—';
        $('#xrayV3Conflict').textContent = '—';
    }

    // V4 SHAP Explanation Trace
    const v4Dec = trace.v4_decision;
    const reasonCode = trace.shap_reason_code;
    const shapFeatures = trace.shap_features || [];
    const xrayV4 = $('#xrayV4');
    const v4ReasonEl = $('#xrayV4Reason');
    const v4ChartEl = $('#xrayV4ShapChart');
    
    if (v4Dec === 'PEND') {
        xrayV4.style.opacity = '1';
        v4ReasonEl.textContent = reasonCode || 'PEND_UNRESOLVED';
        
        v4ChartEl.innerHTML = shapFeatures.map(f => {
            const absVal = Math.abs(f.value);
            const pct = Math.min(100, Math.max(5, (absVal / 0.8) * 100)); // scale max 0.8 log-odds to 100%
            const barClass = f.value > 0 ? 'shap-bar-pos' : 'shap-bar-neg';
            const arrow = f.value > 0 ? '▲' : '▼';
            
            return `<div class="shap-row">
                <div class="shap-feat-label">
                    <span>${f.feature} (${arrow})</span>
                    <span class="mono">${f.value > 0 ? '+' : ''}${f.value.toFixed(4)}</span>
                </div>
                <div class="shap-bar-container">
                    <div class="shap-bar ${barClass}" style="width: ${pct}%"></div>
                </div>
            </div>`;
        }).join('');
    } else {
        xrayV4.style.opacity = '0.4';
        v4ReasonEl.textContent = 'Not Applicable';
        v4ChartEl.innerHTML = '';
    }

    // Plot on landscape
    plotTransaction(risk, uncertainty, decision);

    // Animate layers sequentially
    animateLayers();

    // Add to history
    addToHistory(features, payload);
}

function animateLayers() {
    const layers = ['txnSummary', 'layer1', 'layer2', 'layer3', 'flowConnector', 'verdictCard', 'xrayPanel'];
    const delays = [0, 200, 500, 800, 1100, 1300, 1500];

    // First reset all to hidden
    layers.forEach(id => {
        const el = $(`#${id}`);
        if (el) {
            el.classList.remove('layer-visible');
            el.classList.add('layer-hidden');
        }
    });

    // Then reveal sequentially
    layers.forEach((id, i) => {
        setTimeout(() => {
            const el = $(`#${id}`);
            if (el) {
                el.classList.remove('layer-hidden');
                el.classList.add('layer-visible');
            }
        }, delays[i]);
    });
}

    // First reset all to hidden
    layers.forEach(id => {
        const el = $(`#${id}`);
        el.classList.remove('layer-visible');
        el.classList.add('layer-hidden');
    });

    // Then reveal sequentially
    layers.forEach((id, i) => {
        setTimeout(() => {
            const el = $(`#${id}`);
            el.classList.remove('layer-hidden');
            el.classList.add('layer-visible');
        }, delays[i]);
    });
}

function addToHistory(features, payload) {
    const entry = {
        decision: payload.decision,
        risk: payload.risk_score,
        amount: features[features.length - 2],
        features,
        payload,
    };
    history.unshift(entry);
    if (history.length > 20) history.pop();
    renderHistory();
}

function renderHistory() {
    const list = $('#historyList');
    if (history.length === 0) {
        list.innerHTML = '<p class="history-empty">No transactions yet</p>';
        return;
    }

    list.innerHTML = history.map((h, i) => {
        const meta = DECISION_META[h.decision] || DECISION_META.APPROVE;
        const colorVar = `var(--color-${h.decision.includes('APPROVE') ? 'approve' :
            (h.decision === 'ABSTAIN' || h.decision === 'PEND') ? 'abstain' :
                h.decision.includes('STEP_UP') ? 'stepup' :
                    h.decision.includes('ESCALATE') ? 'escalate' : 'decline'})`;
        const bgVar = `var(--color-${h.decision.includes('APPROVE') ? 'approve' :
            (h.decision === 'ABSTAIN' || h.decision === 'PEND') ? 'abstain' :
                h.decision.includes('STEP_UP') ? 'stepup' :
                    h.decision.includes('ESCALATE') ? 'escalate' : 'decline'}-bg)`;

        return `<div class="history-item" data-index="${i}">
      <span class="history-risk">${h.risk.toFixed(4)}</span>
      <span class="history-decision" style="background:${bgVar};color:${colorVar}">${h.decision.replace(/_/g, ' ')}</span>
    </div>`;
    }).join('');

    // Click to re-render
    list.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', () => {
            const idx = parseInt(item.dataset.index);
            const h = history[idx];
            showState('analysis');
            renderAnalysis(h.features, h.payload);
        });
    });
}

// ---- Main Event Handlers ----
async function handleGenerate(features, isPreset = false, presetName = null) {
    if (isAnalyzing) return;
    isAnalyzing = true;

    showState('loading');

    try {
        let payload;

        if (isPreset && presetName && PRESET_DEMOS[presetName]) {
            // Preset returns raw feature vector
            features = PRESET_DEMOS[presetName]();
        }
        
        // Evaluate the raw transaction with the real backend API
        payload = await callAPI(features);

        showState('analysis');
        renderAnalysis(features, payload);
    } catch (err) {
        showState('empty');
        // Show inline error
        const empty = $('#emptyState');
        empty.querySelector('h2').textContent = 'Connection Error';
        empty.querySelector('p').innerHTML =
            `Could not reach the API at <code>localhost:8000</code>.<br/>Make sure the FastAPI backend is running.`;
        setTimeout(() => {
            empty.querySelector('h2').textContent = 'Transaction X-Ray';
            empty.querySelector('p').innerHTML =
                'Generate or select a transaction to see it pass through<br/>the three detection layers.';
        }, 5000);
    } finally {
        isAnalyzing = false;
        // Reset loading text for next use
        const loadingText = document.querySelector('#loadingState p');
        if (loadingText) loadingText.textContent = 'Analyzing transaction…';
    }
}

// ---- Theme Toggle ----
const SUN_SVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
const MOON_SVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    $('#themeToggle .theme-icon').innerHTML = next === 'dark' ? SUN_SVG : MOON_SVG;
    localStorage.setItem('mari-theme', next);
    // Re-render landscape canvas
    initLandscape($('#landscapeCanvas'));
}

// ---- Init ----
function init() {
    // Restore theme
    const saved = localStorage.getItem('mari-theme');
    if (saved) {
        document.documentElement.setAttribute('data-theme', saved);
        $('#themeToggle .theme-icon').innerHTML = saved === 'dark' ? SUN_SVG : MOON_SVG;
    }

    // Init landscape canvas
    initLandscape($('#landscapeCanvas'));

    // Check API health
    checkHealth();
    setInterval(checkHealth, 15000);

    // Generate Random button
    $('#btnGenerate').addEventListener('click', () => {
        const features = generateRandomTransaction();
        handleGenerate(features);
    });

    // Version dropdown change triggers re-evaluation of the current active transaction
    $('#versionSelect').addEventListener('change', () => {
        if (history.length > 0) {
            const currentTxn = history[0];
            handleGenerate(currentTxn.features);
        }
    });

    // Preset buttons
    $$('.btn-preset').forEach(btn => {
        btn.addEventListener('click', () => {
            const preset = btn.dataset.preset;
            handleGenerate(null, true, preset);
        });
    });

    // Theme toggle
    $('#themeToggle').addEventListener('click', toggleTheme);

    // ---- Tab hover-reveal for about section ----
    const tabCloseTimers = {};
    $$('.tab-btn').forEach(btn => {
        const tab = btn.dataset.tab;
        const contentId = 'content' + tab.charAt(0).toUpperCase() + tab.slice(1);
        const content = document.getElementById(contentId);
        if (!content) return;

        const openTab = () => {
            clearTimeout(tabCloseTimers[tab]);
            // Close all others
            $$('.tab-btn').forEach(b => b.classList.remove('active'));
            $$('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            content.classList.add('active');
        };

        const closeTab = () => {
            tabCloseTimers[tab] = setTimeout(() => {
                btn.classList.remove('active');
                content.classList.remove('active');
            }, 120); // small delay so mouse can reach content panel
        };

        btn.addEventListener('mouseenter', openTab);
        btn.addEventListener('mouseleave', closeTab);
        content.addEventListener('mouseenter', () => clearTimeout(tabCloseTimers[tab]));
        content.addEventListener('mouseleave', closeTab);
    });


    // Handle window resize for canvas
    window.addEventListener('resize', () => {
        initLandscape($('#landscapeCanvas'));
    });
}


document.addEventListener('DOMContentLoaded', init);
