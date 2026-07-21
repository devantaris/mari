# Dempster-Shafer Theory — Equations, Algorithms & Mathematical Reference

> **Project:** Risk-Aware Fraud Transaction Decision System  
> **Purpose:** Complete mathematical reference for paper editing  
> **Source Files:** Extracted from codebase implementation

---

## 1. Frame of Discernment

The system operates on a binary frame of discernment:

$$\Theta = \{F, L\}$$

where:
- $F$ = Fraud (the transaction is fraudulent)
- $L$ = Legitimate (the transaction is legitimate)

The power set is:

$$2^\Theta = \{\emptyset, \{F\}, \{L\}, \{F, L\}\}$$

By convention, $m(\emptyset) = 0$ (closed-world assumption). The three operative focal elements are:

| Symbol | Focal Element | Meaning |
|--------|--------------|---------|
| $m(F)$ | $\{F\}$ | Mass assigned to Fraud |
| $m(L)$ | $\{L\}$ | Mass assigned to Legitimate |
| $m(F,L)$ | $\{F, L\} = \Theta$ | Mass assigned to Ignorance (uncommitted belief) |

**Constraint (valid BPA):**

$$m(F) + m(L) + m(F,L) = 1, \quad m(F), m(L), m(F,L) \geq 0$$

> **Source:** [decision_engine.py](file:///c:/Users/Devansh/Desktop/Risk Aware Fraud Transaction Decision System/backend/engine/decision_engine.py)

---

## 2. Basic Probability Assignment (BPA) — Mass Functions from Evidence Sources

Three independent evidence sources produce mass functions. Each source assigns belief to $\{F\}$, $\{L\}$, and the full frame $\{F,L\}$ (ignorance).

---

### 2.1 Source 1: XGBoost Ensemble

Let $\mu$ be the mean predicted fraud probability across $N$ ensemble members, and $\sigma$ the standard deviation.

**Normalised disagreement:**

$$\sigma_{\text{norm}} = \min\!\Big(\max\!\Big(\frac{\sigma}{0.05},\; 0\Big),\; 1\Big)$$

**Uncertainty weight** (maximum ignorance contribution = 0.50):

$$w_u = \sigma_{\text{norm}} \times 0.50$$

**Mass assignments:**

$$m_1(F) = \mu \cdot (1 - w_u)$$

$$m_1(L) = (1 - \mu) \cdot (1 - w_u)$$

$$m_1(F,L) = w_u$$

> **Interpretation:** When ensemble members disagree (high $\sigma$), up to 50% of the mass is redirected to ignorance, explicitly encoding model uncertainty.  
> **Source:** [decision_engine.py, L159–170](file:///c:/Users/Devansh/Desktop/Risk Aware Fraud Transaction Decision System/backend/engine/decision_engine.py#L159-L170)

---

### 2.2 Source 2: Isolation Forest (Anomaly Detector)

Let $s_{\text{raw}}$ be the raw decision function score from the Isolation Forest (higher = more normal).

**Sigmoid transformation to anomaly degree:**

$$a = \text{clip}\!\left(\frac{1}{1 + e^{\,s_{\text{raw}} \times 20}},\; 0,\; 1\right)$$

**Mass assignments** (base ignorance = 0.40):

$$m_2(F) = a \cdot (1 - 0.40) = 0.60\,a$$

$$m_2(L) = (1 - a) \cdot (1 - 0.40) = 0.60\,(1 - a)$$

$$m_2(F,L) = 0.40$$

> **Interpretation:** The anomaly detector always reserves 40% ignorance — it signals novelty, not fraud directly. The steep sigmoid ($\times 20$) sharpens the anomaly/normal boundary.  
> **Source:** [decision_engine.py, L172–182](file:///c:/Users/Devansh/Desktop/Risk Aware Fraud Transaction Decision System/backend/engine/decision_engine.py#L172-L182)

---

### 2.3 Source 3: Calibrated SVM

Let $p_{\text{svm}}$ be the calibrated SVM probability of fraud.

**Confidence measure:**

$$c = \text{clip}\!\big(|p_{\text{svm}} - 0.5| \times 2,\; 0,\; 1\big)$$

**Adaptive ignorance** (base = 0.45, minimum = 0.15):

$$\iota = 0.45 - (0.45 - 0.15) \cdot c = 0.45 - 0.30\,c$$

**Mass assignments:**

$$m_3(F) = p_{\text{svm}} \cdot (1 - \iota)$$

$$m_3(L) = (1 - p_{\text{svm}}) \cdot (1 - \iota)$$

$$m_3(F,L) = \iota$$

> **Interpretation:** When the SVM is uncertain ($p_{\text{svm}} \approx 0.5$, so $c \approx 0$), ignorance is maximal at 0.45. When confident ($c \to 1$), ignorance drops to 0.15.  
> **Source:** [decision_engine.py, L184–195](file:///c:/Users/Devansh/Desktop/Risk Aware Fraud Transaction Decision System/backend/engine/decision_engine.py#L184-L195)

---

## 3. Dempster's Rule of Combination

Given two mass functions $m_1$ and $m_2$ over $\Theta = \{F, L\}$, Dempster's rule combines them as follows.

### 3.1 Conflict Mass

$$K = m_1(F) \cdot m_2(L) + m_1(L) \cdot m_2(F)$$

$K$ is the degree of conflict — the total mass assigned to the empty set $\emptyset$ before normalisation.

### 3.2 Normalisation Factor

$$\mathcal{N} = 1 - K$$

### 3.3 Combined Masses (Conjunctive Combination with Normalisation)

$$m_{1 \oplus 2}(F) = \frac{m_1(F)\,m_2(F) + m_1(F)\,m_2(F,L) + m_1(F,L)\,m_2(F)}{\mathcal{N}}$$

$$m_{1 \oplus 2}(L) = \frac{m_1(L)\,m_2(L) + m_1(L)\,m_2(F,L) + m_1(F,L)\,m_2(L)}{\mathcal{N}}$$

$$m_{1 \oplus 2}(F,L) = \frac{m_1(F,L)\,m_2(F,L)}{\mathcal{N}}$$

### 3.4 Sequential Three-Source Fusion

The system applies the rule sequentially (associative):

$$m_{12} = m_1 \oplus m_2$$

$$m_{123} = m_{12} \oplus m_3$$

> **Source:** [decision_engine.py, L197–216](file:///c:/Users/Devansh/Desktop/Risk Aware Fraud Transaction Decision System/backend/engine/decision_engine.py#L197-L216)

---

## 4. Belief and Plausibility Functions

After fusion, the final combined mass $m$ yields:

### 4.1 Belief (Lower Bound of Probability)

$$\text{Bel}(F) = m(F)$$

$$\text{Bel}(L) = m(L)$$

### 4.2 Plausibility (Upper Bound of Probability)

$$\text{Pl}(F) = m(F) + m(F,L)$$

$$\text{Pl}(L) = m(L) + m(F,L)$$

### 4.3 Belief Interval

The true probability of fraud lies within:

$$P(F) \in \big[\text{Bel}(F),\;\text{Pl}(F)\big]$$

### 4.4 Ignorance (Epistemic Uncertainty)

$$\text{Ignorance} = m(F,L) = \text{Pl}(F) - \text{Bel}(F)$$

> **Source:** [decision_engine.py, L218–225](file:///c:/Users/Devansh/Desktop/Risk Aware Fraud Transaction Decision System/backend/engine/decision_engine.py#L218-L225)

---

## 5. Decision Routing Algorithm

### 5.1 V1 — Risk Matrix Thresholds

| Parameter | Symbol | Value |
|-----------|--------|-------|
| Decline threshold | $T_{\text{decline}}$ | 0.80 |
| Escalate threshold | $T_{\text{escalate}}$ | 0.60 |
| Step-up auth threshold | $T_{\text{auth}}$ | 0.30 |
| Uncertainty threshold | $U_{\text{thresh}}$ | 0.02 |
| Anomaly threshold | $A_{\text{thresh}}$ | −0.08 |

**Algorithm — V1 Decision Matrix:**

```
Input: Risk score μ, Uncertainty σ, Anomaly score s_raw

1. IF s_raw < A_thresh (novelty detected):
       → ESCALATE_INVEST

2. ELIF μ ≥ T_decline AND σ < U_thresh:
       → DECLINE                     (high risk, low uncertainty)

3. ELIF μ ≥ T_escalate AND σ ≥ U_thresh:
       → ESCALATE_INVEST             (high risk, high uncertainty)

4. ELIF μ < T_auth AND σ ≥ U_thresh:
       → ABSTAIN                     (low risk, high uncertainty)

5. ELIF T_auth ≤ μ < T_decline:
       → STEP_UP_AUTH                (medium risk zone)

6. ELSE:
       → APPROVE
```

> **Source:** [decision_engine.py, L231–361](file:///c:/Users/Devansh/Desktop/Risk Aware Fraud Transaction Decision System/backend/engine/decision_engine.py#L231-L361)

---

### 5.2 V3 — Dempster-Shafer Fusion Sub-Routing

When V1 routes to `ESCALATE_INVEST`, the D-S fusion layer refines the decision:

```
Input: Combined masses m(F), m(L), m(F,L), Conflict K

1. IF K ≥ 0.25:
       → HUMAN_ESCALATE              (sources fundamentally disagree)

2. ELIF Bel(F) ≥ 0.91 AND Ignorance ≤ 0.05:
       → AUTO_DECLINE                (overwhelming evidence of fraud)

3. ELIF Ignorance ≥ 0.10:
       → HUMAN_ESCALATE              (too much epistemic uncertainty)

4. ELIF Bel(F) ≥ 0.35:
       → STEP_UP_AUTH                (moderate fraud belief)

5. ELSE:
       → HUMAN_ESCALATE              (default: send to human analyst)
```

> **Key insight:** Conflict $K$ acts as a meta-diagnostic. High conflict signals that the models are producing contradictory evidence, warranting human review regardless of the individual scores.

---

## 6. Ensemble Risk Scoring

### 6.1 Mean Risk Score

$$\mu = \frac{1}{N} \sum_{i=1}^{N} P_i$$

where $P_i$ is the fraud probability from the $i$-th model (or fold), and $N$ is the number of ensemble members.

### 6.2 Predictive Uncertainty (Standard Deviation)

$$\sigma = \sqrt{\frac{1}{N} \sum_{i=1}^{N} (P_i - \mu)^2}$$

> **Source:** [phase2_uncertainty.py, L76–77](file:///c:/Users/Devansh/Desktop/Risk Aware Fraud Transaction Decision System/phase2_uncertainty.py#L76-L77)

---

## 7. Calibration & Reliability Metrics

### 7.1 Brier Score

$$BS = \frac{1}{N} \sum_{i=1}^{N} (P_i - Y_i)^2$$

where $P_i$ is the predicted probability and $Y_i \in \{0, 1\}$ is the true label.

> **Interpretation:** $BS = 0$ is perfect; $BS = 1$ is worst. Measures both calibration and discrimination.  
> **Source:** [phase5_reliability.py, L68](file:///c:/Users/Devansh/Desktop/Risk Aware Fraud Transaction Decision System/phase5_reliability.py#L68)

### 7.2 Class Imbalance Handling

$$\text{scale\_pos\_weight} = \frac{|\text{Negatives}|}{|\text{Positives}|}$$

Applied in XGBoost to counterbalance the extreme class skew in fraud detection.

> **Source:** [phase1_xgboost.py, L40](file:///c:/Users/Devansh/Desktop/Risk Aware Fraud Transaction Decision System/phase1_xgboost.py#L40)

---

## 8. Anomaly Detection (Isolation Forest)

### 8.1 Anomaly Score

$$S_{\text{anomaly}} = -s_{\text{raw}}$$

where $s_{\text{raw}}$ is the Isolation Forest `decision_function` output (higher = more normal).

### 8.2 Novelty Flag

$$\text{Novelty} = 
\begin{cases} 
\text{True} & \text{if } s_{\text{raw}} < -0.08 \\
\text{False} & \text{otherwise}
\end{cases}$$

**Hyperparameter:** `contamination = 0.001`

> **Source:** [phase4_outlier.py](file:///c:/Users/Devansh/Desktop/Risk Aware Fraud Transaction Decision System/phase4_outlier.py), [decision_engine.py](file:///c:/Users/Devansh/Desktop/Risk Aware Fraud Transaction Decision System/backend/engine/decision_engine.py)

---

## 9. Statistical Analysis (Phase 6)

### 9.1 Cohen's d Effect Size

$$s_{\text{pooled}} = \sqrt{\frac{(n_1 - 1)\,\sigma_1^2 + (n_2 - 1)\,\sigma_2^2}{n_1 + n_2 - 2}}$$

$$d = \frac{\mu_1 - \mu_2}{s_{\text{pooled}}}$$

| $|d|$ Range | Interpretation |
|-------------|----------------|
| < 0.2 | Negligible |
| 0.2 – 0.5 | Small |
| 0.5 – 0.8 | Medium |
| > 0.8 | Large |

### 9.2 Correlation Methods Used

| Method | Use Case |
|--------|----------|
| Point-Biserial | Binary vs. continuous variable |
| Pearson | Linear correlation between continuous variables |
| Spearman | Rank-based (monotonic) correlation |
| Mann-Whitney U | Non-parametric test for group differences |

> **Source:** [phase6_correlation_distribution.py, L27–34](file:///c:/Users/Devansh/Desktop/Risk Aware Fraud Transaction Decision System/phase6_correlation_distribution.py#L27-L34)

---

## 10. Feature Engineering

### 10.1 Time-of-Day Extraction

$$\text{Hour} = \left\lfloor \frac{\text{Time}}{3600} \right\rfloor \mod 24$$

### 10.2 Log-Transformed Amount

$$\text{Amount}_{\text{log}} = \ln(1 + \text{Amount})$$

> This stabilises variance and reduces the influence of extreme transaction amounts.

---

## 11. Cost Model & Expected Loss

### 11.1 Expected Loss

$$\mathbb{E}[\text{Loss}] = P(\text{Fraud}) \times C_{\text{fraud}}$$

where $C_{\text{fraud}}$ is the simulated fraud cost (e.g., \$1,000 or \$5,000).

### 11.2 Net Utility

$$U_{\text{net}} = -\mathbb{E}[\text{Loss}] - C_{\text{action}}$$

### 11.3 Action Cost Matrix

| Action | Cost |
|--------|------|
| STEP_UP_AUTH | \$10 |
| MANUAL_REVIEW / ESCALATE / ABSTAIN | \$50 |
| False Negative (missed fraud) | \$5,000 |
| False Positive (auto-block legitimate) | \$200 |

---

## 12. Explainability (SHAP)

### 12.1 Additive Feature Attribution

$$\hat{y} = \phi_0 + \sum_{j=1}^{M} \phi_j$$

where $\phi_0$ is the base value (average model output) and $\phi_j$ is the SHAP value for feature $j$.

### 12.2 Reason Code Generation

For transactions routed to `PEND`, the top-3 contributing features are selected:

$$\text{Top-3} = \text{argsort}_{j}\big(|\phi_j|\big)[-3:]$$

Output format: `PEND_V14_V17_V10` (features ranked by $|\phi_j|$ descending).

> **Source:** [decision_engine.py, L362–374](file:///c:/Users/Devansh/Desktop/Risk Aware Fraud Transaction Decision System/backend/engine/decision_engine.py#L362-L374), [phase3_explainability.py](file:///c:/Users/Devansh/Desktop/Risk Aware Fraud Transaction Decision System/phase3_explainability.py)

---

## Summary of Key Symbols

| Symbol | Definition |
|--------|-----------|
| $\Theta$ | Frame of discernment $\{F, L\}$ |
| $m(A)$ | Basic Probability Assignment (mass) for focal element $A$ |
| $m(F,L)$ | Ignorance — uncommitted mass to the full frame |
| $K$ | Conflict mass between two evidence sources |
| $\mathcal{N}$ | Normalisation factor $= 1 - K$ |
| $\text{Bel}(A)$ | Belief function — lower probability bound |
| $\text{Pl}(A)$ | Plausibility function — upper probability bound |
| $\oplus$ | Dempster's combination operator |
| $\mu$ | Mean ensemble fraud probability |
| $\sigma$ | Ensemble standard deviation (predictive uncertainty) |
| $\phi_j$ | SHAP value for feature $j$ |
| $d$ | Cohen's d effect size |

---

*Document generated from codebase analysis. All equations correspond to implemented logic — see linked source files for code-level verification.*
