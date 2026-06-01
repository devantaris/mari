"""
MARI Phase 6 — Feature Correlation & Distribution Analysis
Comprehensive multi-method correlation analysis with effect size ranking
and annotated distribution comparison plots.
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats
import os
import json

sns.set_theme(style="darkgrid")
plt.rcParams.update({
    'figure.facecolor': '#1e1e2e',
    'axes.facecolor': '#181825',
    'text.color': '#cdd6f4',
    'axes.labelcolor': '#cdd6f4',
    'xtick.color': '#cdd6f4',
    'ytick.color': '#cdd6f4',
    'axes.edgecolor': '#313244',
    'grid.color': '#313244',
})

def cohens_d(group1, group2):
    """Calculate Cohen's d effect size between two groups."""
    n1, n2 = len(group1), len(group2)
    var1, var2 = group1.var(), group2.var()
    pooled_std = np.sqrt(((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2))
    if pooled_std == 0:
        return 0.0
    return (group1.mean() - group2.mean()) / pooled_std

def interpret_d(d):
    """Interpret Cohen's d magnitude."""
    d = abs(d)
    if d < 0.2:
        return "Negligible"
    elif d < 0.5:
        return "Small"
    elif d < 0.8:
        return "Medium"
    else:
        return "Large"

def main():
    print("=" * 70)
    print("MARI Phase 6 — Reanalysis (Opus)")
    print("=" * 70)

    df = pd.read_csv("creditcard.csv")
    print(f"Loaded: {df.shape[0]:,} rows, {df.shape[1]} columns\n")

    pca_cols = [f"V{i}" for i in range(1, 29)]
    fraud = df[df["Class"] == 1]
    legit = df[df["Class"] == 0]
    print(f"Legit: {len(legit):,}  |  Fraud: {len(fraud):,}  |  Fraud %: {len(fraud)/len(df)*100:.4f}%\n")

    doc_dir = "PROJECT_DOCUMENTATION"
    os.makedirs(doc_dir, exist_ok=True)

    # =========================================================================
    # PART 1: Correlation Analysis (Pearson + Spearman + Point-Biserial)
    # =========================================================================
    print("=" * 70)
    print("PART 1: Multi-method Correlation Analysis")
    print("=" * 70)

    results = []
    for col in pca_cols:
        # Pearson with Amount and Time
        pearson_amount, p_amount = stats.pearsonr(df[col], df["Amount"])
        pearson_time, p_time = stats.pearsonr(df[col], df["Time"])
        spearman_amount, sp_amount = stats.spearmanr(df[col], df["Amount"])
        spearman_time, sp_time = stats.spearmanr(df[col], df["Time"])

        # Point-biserial for Class (binary) — the mathematically correct
        # correlation method for continuous vs binary variable
        pb_class, p_class = stats.pointbiserialr(df["Class"], df[col])

        # Also compute regular Pearson for comparison
        pearson_class, _ = stats.pearsonr(df[col], df["Class"])

        # Mann-Whitney U test (non-parametric: are fraud/legit distributions different?)
        u_stat, u_pval = stats.mannwhitneyu(
            fraud[col], legit[col], alternative='two-sided'
        )

        # Cohen's d effect size
        d = cohens_d(fraud[col], legit[col])

        results.append({
            "Feature": col,
            "Pearson_Class": round(pearson_class, 6),
            "PointBiserial_Class": round(pb_class, 6),
            "PB_pvalue": p_class,
            "Pearson_Amount": round(pearson_amount, 6),
            "Spearman_Amount": round(spearman_amount, 6),
            "Pearson_Time": round(pearson_time, 6),
            "Spearman_Time": round(spearman_time, 6),
            "MannWhitney_U": u_stat,
            "MannWhitney_p": u_pval,
            "Cohens_d": round(d, 4),
            "Effect_Size": interpret_d(d),
        })

    res_df = pd.DataFrame(results)
    res_df.to_csv(os.path.join(doc_dir, "v1_v28_correlations.csv"), index=False)

    # Print summary tables
    print("\n--- Correlation with Class (Fraud) ---")
    print(f"{'Feature':<8} {'Pearson':>10} {'Pt-Biserial':>12} {'Cohen d':>10} {'Effect':>12} {'MW p-val':>12}")
    print("-" * 68)
    for _, r in res_df.sort_values("Cohens_d").iterrows():
        pval_str = f"{r['MannWhitney_p']:.2e}" if r['MannWhitney_p'] > 0 else "< 1e-300"
        print(f"{r['Feature']:<8} {r['Pearson_Class']:>10.4f} {r['PointBiserial_Class']:>12.4f} "
              f"{r['Cohens_d']:>10.4f} {r['Effect_Size']:>12} {pval_str:>12}")

    print("\n--- Correlation with Amount ---")
    print(f"{'Feature':<8} {'Pearson':>10} {'Spearman':>10}")
    print("-" * 30)
    for _, r in res_df.reindex(res_df['Pearson_Amount'].abs().sort_values(ascending=False).index).head(10).iterrows():
        print(f"{r['Feature']:<8} {r['Pearson_Amount']:>10.4f} {r['Spearman_Amount']:>10.4f}")

    print("\n--- Correlation with Time ---")
    print(f"{'Feature':<8} {'Pearson':>10} {'Spearman':>10}")
    print("-" * 30)
    for _, r in res_df.reindex(res_df['Pearson_Time'].abs().sort_values(ascending=False).index).head(10).iterrows():
        print(f"{r['Feature']:<8} {r['Pearson_Time']:>10.4f} {r['Spearman_Time']:>10.4f}")

    # =========================================================================
    # PART 2: Identify truly discriminative features via effect size ranking
    # =========================================================================
    print("\n" + "=" * 70)
    print("PART 2: Feature Discrimination Ranking (by |Cohen's d|)")
    print("=" * 70)

    ranked = res_df.copy()
    ranked["abs_d"] = ranked["Cohens_d"].abs()
    ranked = ranked.sort_values("abs_d", ascending=False)

    print(f"\n{'Rank':<6} {'Feature':<8} {'Cohen d':>10} {'Effect':>12} {'Direction':>12}")
    print("-" * 50)
    for i, (_, r) in enumerate(ranked.iterrows(), 1):
        direction = "Fraud UP" if r["Cohens_d"] > 0 else "Fraud DN"
        print(f"{i:<6} {r['Feature']:<8} {r['Cohens_d']:>10.4f} {r['Effect_Size']:>12} {direction:>12}")

    # Select top 8 features by effect size for distribution analysis
    top_features = list(ranked.head(8)["Feature"])
    print(f"\nSelected for distribution plots: {top_features}")

    # =========================================================================
    # PART 3: Distribution Analysis with statistical annotations
    # =========================================================================
    print("\n" + "=" * 70)
    print("PART 3: Distribution Analysis (Fraud vs Normal)")
    print("=" * 70)

    n_features = len(top_features)
    n_cols = 2
    n_rows = (n_features + 1) // 2
    fig, axes = plt.subplots(n_rows, n_cols, figsize=(16, 4 * n_rows), facecolor='#1e1e2e')
    fig.suptitle(
        "Fraud vs Legitimate Distribution Comparison\n"
        "Top Features Ranked by Cohen's d Effect Size",
        fontsize=18, color='#cdd6f4', weight='bold', y=0.98
    )

    axes_flat = axes.flatten()

    for i, col in enumerate(top_features):
        ax = axes_flat[i]
        ax.set_facecolor('#181825')

        row = res_df[res_df["Feature"] == col].iloc[0]
        d_val = row["Cohens_d"]
        pb_val = row["PointBiserial_Class"]

        # KDE plots
        sns.kdeplot(data=legit, x=col, label="Legit", color="#89b4fa",
                    fill=True, alpha=0.35, ax=ax, linewidth=2, warn_singular=False)
        sns.kdeplot(data=fraud, x=col, label="Fraud", color="#f38ba8",
                    fill=True, alpha=0.35, ax=ax, linewidth=2, warn_singular=False)

        # Add vertical mean lines
        legit_mean = legit[col].mean()
        fraud_mean = fraud[col].mean()
        ax.axvline(legit_mean, color="#89b4fa", linestyle="--", alpha=0.7, linewidth=1.5)
        ax.axvline(fraud_mean, color="#f38ba8", linestyle="--", alpha=0.7, linewidth=1.5)

        # Annotation box with stats
        stats_text = (
            f"Cohen's d = {d_val:+.3f} ({interpret_d(d_val)})\n"
            f"r_pb = {pb_val:+.4f}\n"
            f"μ_legit = {legit_mean:.2f}\n"
            f"μ_fraud = {fraud_mean:.2f}"
        )
        ax.text(0.97, 0.97, stats_text, transform=ax.transAxes,
                fontsize=8.5, verticalalignment='top', horizontalalignment='right',
                bbox=dict(boxstyle='round,pad=0.4', facecolor='#313244', alpha=0.85, edgecolor='#585b70'),
                color='#cdd6f4', family='monospace')

        ax.set_title(f"{col}", fontsize=14, color='#cdd6f4', weight='semibold')
        ax.set_xlabel(col, fontsize=11)
        ax.set_ylabel("Density", fontsize=11)
        ax.legend(facecolor='#1e1e2e', edgecolor='#313244', labelcolor='#cdd6f4', fontsize=9)

    # Hide unused subplot if odd number of features
    for j in range(i + 1, len(axes_flat)):
        axes_flat[j].set_visible(False)

    plt.tight_layout(rect=[0, 0.02, 1, 0.95])
    plot_path = os.path.join(doc_dir, "distribution_analysis.png")
    plt.savefig(plot_path, dpi=150, facecolor=fig.get_facecolor())
    plt.close()
    print(f"Saved distribution plot: {plot_path}")

    print(f"\nDone. All outputs saved to {doc_dir}/")

if __name__ == "__main__":
    main()
