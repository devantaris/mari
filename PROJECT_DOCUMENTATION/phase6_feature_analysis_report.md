# MARI Phase 6: Feature Correlation & Distribution Analysis
*Prepared for Mentor Review — June 1, 2026*

This report addresses the three research tasks: (1) dataset provenance, (2) correlation analysis and PCA reverse-engineering of V1–V28, and (3) distribution comparison between fraud and legitimate transactions.

---

## Task 1: Dataset Original Source

### Provenance

The dataset is the **Credit Card Fraud Detection** benchmark, produced by the **Machine Learning Group at Université Libre de Bruxelles (ULB)** in collaboration with **Worldline**, a major European payment processor. It contains **real transactions** made by European cardholders over a **48-hour window in September 2013**.

### Academic Citations

This dataset was published alongside the following peer-reviewed research:

1. **Dal Pozzolo, A.**, Caelen, O., Le Borgne, Y.-A., Waterschoot, S., Bontempi, G. — *"Learned lessons in credit card fraud detection from a practitioner perspective"*, Expert Systems with Applications, **2014**.
2. **Dal Pozzolo, A.**, Caelen, O., Johnson, R. A., Bontempi, G. — *"Calibrating Probability with Undersampling for Unbalanced Classification"*, IEEE CIDM, **2015**.
3. **Dal Pozzolo, A.**, Boracchi, G., Caelen, O., Alippi, C., Bontempi, G. — *"Credit Card Fraud Detection: A Realistic Modeling and a Novel Learning Strategy"*, IEEE TNNLS, **2017**.

### Dataset Structure

| Property | Value |
|:---|:---|
| Total transactions | **284,807** |
| Fraudulent transactions | **492** (Class = 1) |
| Legitimate transactions | **284,315** (Class = 0) |
| Fraud rate | **0.1727%** |
| PCA-transformed features | **V1 – V28** (28 anonymized principal components) |
| Raw features retained | **Time** (seconds since first transaction), **Amount** (transaction value) |
| Target variable | **Class** (0 = legitimate, 1 = fraud) |

### Why PCA Was Applied

The original raw features contained sensitive personally identifiable information (PII) — cardholder names, account numbers, merchant identifiers, geographic coordinates, etc. To enable public release while preserving privacy, ULB applied **Principal Component Analysis (PCA)** to project the original high-dimensional feature space onto 28 orthogonal components. Only `Time` and `Amount` were left in their original form.

> **Critical implication for reverse-engineering:** Because PCA produces linear combinations of *all* original features, each component (V1–V28) is a weighted mixture — not a 1:1 mapping to any single real-world variable. We can observe *correlations* with Amount and Time, but cannot definitively claim that, e.g., "V7 represents luxury purchases." The correct interpretation is mathematical: V7 captures a direction of variance in the original feature space that happens to load heavily on Amount-correlated variance.

---

## Task 2: Correlation Analysis & Reverse Engineering

We computed three types of correlation for each PCA feature against the three interpretable columns:

- **Pearson correlation** — measures linear relationship (used for Amount and Time)
- **Point-biserial correlation** — the mathematically correct method for continuous vs. binary variables (used for Class)
- **Spearman correlation** — measures monotonic (rank-based) relationship, robust to outliers (used for Amount and Time to cross-validate Pearson)

Additionally, we computed:
- **Cohen's d** — standardized effect size measuring practical separation between fraud and legit distributions
- **Mann-Whitney U test** — non-parametric significance test for distributional differences

### Full Correlation Table

| Feature | r_pb (Class) | Cohen's d | Effect Size | Pearson (Amount) | Spearman (Amount) | Pearson (Time) | Spearman (Time) | MW p-value |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **V17** | **-0.3265** | **-8.318** | Large | 0.0073 | — | -0.0733 | — | 9.2e-124 |
| **V14** | **-0.3025** | **-7.644** | Large | 0.0338 | — | -0.0988 | — | 1.5e-260 |
| **V12** | **-0.2606** | **-6.500** | Large | -0.0095 | — | 0.1243 | — | 8.4e-247 |
| **V10** | **-0.2169** | **-5.350** | Large | -0.1015 | — | 0.0306 | — | 9.6e-222 |
| **V16** | **-0.1965** | **-4.827** | Large | -0.0039 | — | 0.0119 | — | 1.8e-156 |
| **V3** | -0.1930 | **-4.736** | Large | -0.2109 | -0.0002 | **-0.4196** | **-0.4733** | 1.2e-219 |
| **V7** | -0.1873 | **-4.590** | Large | **0.3973** | **-0.0300** | 0.0847 | — | 1.5e-146 |
| **V11** | **+0.1549** | **+3.775** | Large | 0.0001 | — | -0.2477 | -0.2271 | 4.9e-226 |
| **V4** | +0.1334 | **+3.243** | Large | 0.0987 | — | -0.1053 | — | 3.6e-248 |
| V18 | -0.1115 | -2.702 | Large | 0.0357 | — | 0.0904 | — | 2.7e-77 |
| V1 | -0.1013 | -2.453 | Large | -0.2277 | -0.0867 | 0.1174 | 0.1906 | 1.7e-113 |
| V2 | +0.0913 | +2.208 | Large | **-0.5314** | **-0.5021** | -0.0106 | — | 1.7e-163 |
| V5 | -0.0950 | -2.297 | Large | **-0.3864** | -0.3141 | 0.1731 | 0.2260 | 3.1e-58 |
| V9 | -0.0977 | -2.365 | Large | -0.0442 | — | -0.0087 | — | 8.9e-154 |
| V6 | -0.0436 | -1.052 | Large | 0.2160 | 0.2055 | -0.0630 | — | 2.2e-93 |
| V21 | +0.0404 | +0.974 | Large | 0.1060 | 0.1941 | 0.0447 | — | 8.7e-80 |
| V19 | +0.0348 | +0.838 | Large | -0.0562 | — | 0.0290 | — | 2.4e-33 |
| V20 | +0.0201 | +0.484 | Small | **0.3394** | 0.2012 | -0.0509 | — | 1.1e-30 |
| V8 | +0.0199 | +0.479 | Small | -0.1031 | — | -0.0369 | — | 8.5e-34 |
| V27 | +0.0176 | +0.423 | Small | 0.0288 | — | -0.0051 | — | 1.4e-51 |
| V28 | +0.0095 | +0.230 | Small | 0.0103 | — | -0.0094 | — | 1.2e-27 |
| V26 | +0.0045 | +0.107 | Negligible | -0.0032 | — | -0.0414 | — | 3.5e-3 |
| V25 | +0.0033 | +0.080 | Negligible | -0.0478 | — | -0.2331 | -0.2592 | 1.3e-2 |
| V22 | +0.0008 | +0.019 | Negligible | -0.0648 | — | 0.1441 | — | **0.266** |
| V24 | -0.0072 | -0.174 | Negligible | 0.0051 | — | -0.0162 | — | 9.4e-7 |
| V15 | -0.0042 | -0.102 | Negligible | -0.0030 | — | -0.1835 | -0.2054 | **0.130** |
| V13 | -0.0046 | -0.110 | Negligible | 0.0053 | — | -0.0659 | — | **0.051** |
| V23 | -0.0027 | -0.065 | Negligible | -0.1126 | — | 0.0511 | — | 7.4e-3 |

*(Table sorted by |Cohen's d| descending. Spearman values shown only where they meaningfully diverge from Pearson. Bold MW p-values indicate features that are **not** statistically significant at p < 0.05.)*

---

### Key Findings

#### Fraud Detection Power (ranked by Cohen's d effect size)

The top 8 most discriminative features for separating fraud from legitimate transactions:

| Rank | Feature | Cohen's d | Direction | Interpretation |
|:---:|:---:|:---:|:---:|:---|
| 1 | V17 | -8.318 | Fraud shifts **negative** | Strongest discriminator. Fraud mean = -6.67 vs. legit mean = 0.01 |
| 2 | V14 | -7.644 | Fraud shifts **negative** | Fraud mean = -6.97 vs. legit mean = 0.01 |
| 3 | V12 | -6.500 | Fraud shifts **negative** | Fraud mean = -6.26 vs. legit mean = 0.01 |
| 4 | V10 | -5.350 | Fraud shifts **negative** | Fraud mean = -5.68 vs. legit mean = 0.01 |
| 5 | V16 | -4.827 | Fraud shifts **negative** | Fraud mean = -4.14 vs. legit mean = 0.01 |
| 6 | V3 | -4.736 | Fraud shifts **negative** | Fraud mean = -7.03 vs. legit mean = 0.01 |
| 7 | V7 | -4.590 | Fraud shifts **negative** | Fraud mean = -5.57 vs. legit mean = 0.01 |
| 8 | V11 | +3.775 | Fraud shifts **positive** | Fraud mean = 3.80 vs. legit mean = -0.01 (only top feature with positive shift) |

#### Reverse Engineering: Correlations with Amount

| Feature | Pearson | Spearman | Interpretation |
|:---:|:---:|:---:|:---|
| V2 | **-0.531** | **-0.502** | Strong, consistent monotonic relationship. This PCA direction loads heavily on Amount-related variance. |
| V7 | **+0.397** | **-0.030** | **Pearson-Spearman divergence** — the linear correlation is driven by outliers or extreme values, not a genuine monotonic trend. This is a critical finding the previous analysis missed. |
| V5 | -0.386 | -0.314 | Moderate monotonic relationship, somewhat attenuated by non-linearity. |
| V20 | +0.339 | +0.201 | Moderate relationship, partially inflated by outliers. |

#### Reverse Engineering: Correlations with Time

| Feature | Pearson | Spearman | Interpretation |
|:---:|:---:|:---:|:---|
| V3 | **-0.420** | **-0.473** | Strong monotonic relationship — V3 captures diurnal/temporal patterns. Spearman is *stronger* than Pearson, suggesting a clean monotonic trend slightly obscured by non-linear scaling. |
| V11 | -0.248 | -0.227 | Consistent moderate temporal signal. |
| V25 | -0.233 | -0.259 | Consistent moderate temporal signal. |

#### Statistical Significance Findings

- **25 of 28** features show statistically significant fraud vs. legit distributional differences (Mann-Whitney U, p < 0.05).
- **3 features are NOT significant:** V13 (p = 0.051), V15 (p = 0.130), V22 (p = 0.266). These features carry essentially no fraud-detection signal.
- Features with negligible effect sizes (V22, V23, V24, V25, V26) have Cohen's d < 0.2, meaning even where statistically significant, the practical separation is too small to be useful for classification.

---

## Task 3: Distribution Analysis (Fraud vs. Normal)

We selected the **top 8 features by |Cohen's d|** for visual distribution comparison. Each subplot shows:
- **Blue filled KDE**: Legitimate transaction density
- **Red filled KDE**: Fraudulent transaction density
- **Dashed vertical lines**: Group means (blue = legit, red = fraud)
- **Stats box**: Cohen's d, point-biserial correlation, and group means

![Distribution Comparison — Top 8 Features by Cohen's d Effect Size](./distribution_analysis.png)

### Distribution Insights

1. **V17, V14, V12, V10, V3** (negative Cohen's d): Legitimate transactions cluster tightly around 0. Fraud transactions form a pronounced **left tail** extending to -20 or beyond. The mean shift is dramatic (5–8 standard deviations), making these features individually powerful fraud indicators.

2. **V16, V7** (negative Cohen's d): Similar left-tail pattern but with somewhat more overlap between distributions, indicating moderate discriminative power on their own.

3. **V11** (positive Cohen's d = +3.775): The **only top feature where fraud shifts right** instead of left. Fraud transactions peak around +3 to +8, while legitimate transactions center near 0. This is the strongest positive fraud signal and provides complementary information to the negative-shift features.

4. **Bimodality in fraud distributions**: Several features (notably V3, V10) show bimodal or heavy-tailed fraud distributions, suggesting fraud may cluster into distinct behavioral subtypes — a finding relevant for MARI's routing architecture.

---

## Summary

> The ULB/Kaggle credit card dataset contains 284,807 European transactions with 28 PCA-anonymized features. Through multi-method correlation analysis (Pearson, point-biserial, Spearman) and Cohen's d effect size ranking, we identified **V17, V14, V12, V10, V16, V3, V7, and V11** as the 8 most discriminative features for fraud detection. Distribution analysis reveals fraud transactions exhibit dramatic mean shifts of 4–8 standard deviations in these dimensions, with 7 features shifting negative and V11 uniquely shifting positive. Cross-validation via Spearman correlations revealed that V7's apparent correlation with Amount (Pearson = 0.40) is an outlier artifact (Spearman = -0.03), while V3's temporal signal is genuinely monotonic. Three features (V13, V15, V22) show no statistically significant fraud signal and can be considered noise dimensions.
