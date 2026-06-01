import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import os

# Set style for rich aesthetics
sns.set_theme(style="darkgrid")
plt.rcParams['figure.facecolor'] = '#1e1e2e'
plt.rcParams['axes.facecolor'] = '#181825'
plt.rcParams['text.color'] = '#cdd6f4'
plt.rcParams['axes.labelcolor'] = '#cdd6f4'
plt.rcParams['xtick.color'] = '#cdd6f4'
plt.rcParams['ytick.color'] = '#cdd6f4'
plt.rcParams['axes.edgecolor'] = '#313244'
plt.rcParams['grid.color'] = '#313244'

def main():
    print("=== MARI Phase 6: Feature Correlation & Distribution Analysis ===")
    
    # 1. Load the original dataset
    data_path = "creditcard.csv"
    if not os.path.exists(data_path):
        print(f"Error: {data_path} not found in the root directory.")
        return
        
    print("Loading creditcard.csv...")
    df = pd.read_csv(data_path)
    print(f"Dataset shape: {df.shape}")
    
    # 2. Correlation Analysis
    pca_cols = [f"V{i}" for i in range(1, 29)]
    target_cols = ["Class", "Amount", "Time"]
    
    # Calculate correlations
    corr_matrix = df[pca_cols + target_cols].corr()
    
    # Extract correlations for V1-V28 with target columns
    corr_targets = corr_matrix.loc[pca_cols, target_cols]
    
    print("\n=== Correlations of V1-V28 with Class, Amount, Time ===")
    print(corr_targets.to_string())
    
    # Ensure PROJECT_DOCUMENTATION directory exists
    doc_dir = "PROJECT_DOCUMENTATION"
    os.makedirs(doc_dir, exist_ok=True)
    
    # Save correlation table to csv in PROJECT_DOCUMENTATION
    csv_path = os.path.join(doc_dir, "v1_v28_correlations.csv")
    corr_targets.to_csv(csv_path)
    print(f"\nSaved correlations to '{csv_path}'")
    
    # Find top correlated features with Class
    corr_class = corr_targets["Class"].sort_values()
    print("\nTop 5 Negatively Correlated with Class (Higher value = Lower chance of fraud):")
    for col, val in corr_class.head(5).items():
        print(f"  {col}: {val:.4f}")
        
    print("\nTop 5 Positively Correlated with Class (Higher value = Higher chance of fraud):")
    for col, val in corr_class.tail(5).items():
        if col != "Class":  # exclude self correlation
            print(f"  {col}: {val:.4f}")
            
    # 3. Distribution Analysis
    # Let's pick the top 3 negatively and top 3 positively correlated features
    top_neg = list(corr_class.head(3).index)
    top_pos = list(corr_class.tail(4).index) # tail(4) contains Class, so we exclude it below
    top_pos = [c for c in top_pos if c != "Class"][:3]
    
    selected_features = top_neg + top_pos
    print(f"\nSelected features for distribution analysis: {selected_features}")
    
    # Create distribution comparison plots (Fraud vs Normal)
    fig, axes = plt.subplots(3, 2, figsize=(16, 18), facecolor='#1e1e2e')
    fig.suptitle("Fraud vs Normal Distribution Comparison\n(Most Strongly Correlated PCA Features)", 
                 fontsize=18, color='#cdd6f4', weight='bold')
    
    axes = axes.flatten()
    
    for i, col in enumerate(selected_features):
        ax = axes[i]
        ax.set_facecolor('#181825')
        
        # Plot kde plots for Class 0 vs 1
        sns.kdeplot(data=df[df["Class"] == 0], x=col, label="Legit (Class 0)", color="#89b4fa", fill=True, alpha=0.4, ax=ax, linewidth=2)
        sns.kdeplot(data=df[df["Class"] == 1], x=col, label="Fraud (Class 1)", color="#f38ba8", fill=True, alpha=0.4, ax=ax, linewidth=2)
        
        ax.set_title(f"Distribution of {col} (Corr with Class: {corr_targets.loc[col, 'Class']:.4f})", 
                     fontsize=14, color='#cdd6f4', weight='semibold')
        ax.set_xlabel(col, color='#cdd6f4', fontsize=12)
        ax.set_ylabel("Density", color='#cdd6f4', fontsize=12)
        ax.legend(facecolor='#1e1e2e', edgecolor='#313244', labelcolor='#cdd6f4')
        
    plt.tight_layout(rect=[0, 0.03, 1, 0.95])
    plot_path = os.path.join(doc_dir, "distribution_analysis.png")
    plt.savefig(plot_path, dpi=150, facecolor=fig.get_facecolor())
    print(f"\nGenerated and saved distribution plot to '{plot_path}'")
    
    # 4. Correlation with Amount and Time (for reverse engineering)
    print("\n=== Features strongly correlated with Amount ===")
    corr_amount = corr_targets["Amount"].abs().sort_values(ascending=False)
    for col, val in corr_amount.head(5).items():
        print(f"  {col}: {corr_targets.loc[col, 'Amount']:.4f}")
        
    print("\n=== Features strongly correlated with Time ===")
    corr_time = corr_targets["Time"].abs().sort_values(ascending=False)
    for col, val in corr_time.head(5).items():
        print(f"  {col}: {corr_targets.loc[col, 'Time']:.4f}")

if __name__ == "__main__":
    main()
