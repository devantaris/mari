import React from 'react';
import { Sigma, Table, Info } from 'lucide-react';

export const Methodology: React.FC = () => {
  return (
    <div className="space-y-12 pb-20 animate-fade-in">
      {/* Page Title */}
      <section className="max-w-4xl mx-auto text-center space-y-2">
        <h2 className="text-3xl font-bold text-white tracking-tight">Methodology & Mathematical Foundations</h2>
        <p className="text-sm text-gray-400">
          The mathematical models and decision theory behind the 2D Selective Classification framework.
        </p>
      </section>

      {/* Grid of formulas */}
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Risk & Uncertainty */}
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center gap-2 text-cyber-accent">
            <Sigma size={20} />
            <h3 className="text-lg font-bold text-white">Risk & Uncertainty Metrics</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-gray-400">Ensemble Risk Mean Score (r̂)</span>
              <div className="p-3 bg-cyber-bg border border-cyber-border rounded font-mono text-xs text-white">
                r̂ = (1/B) * Σ ( σ(f_i(x)) ) , B = 5
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Calculated as the mean predicted fraud probability across 5 bootstrap-sampled XGBoost classifiers.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-gray-400">Ensemble Standard Deviation Uncertainty (û)</span>
              <div className="p-3 bg-cyber-bg border border-cyber-border rounded font-mono text-xs text-white">
                û = √[ (1/(B-1)) * Σ ( σ(f_i(x)) - r̂ )^2 ]
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Represents the epistemic uncertainty (model disagreement). If û &ge; 0.02, it indicates a high conflict zone, prompting abstention.
              </p>
            </div>
          </div>
        </div>

        {/* Dempster-Shafer */}
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center gap-2 text-purple-400">
            <Sigma size={20} />
            <h3 className="text-lg font-bold text-white">Dempster-Shafer Evidence Fusion</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-gray-400">Dempster's Combination Rule</span>
              <div className="p-3 bg-cyber-bg border border-cyber-border rounded font-mono text-xs text-white">
                m_12(A) = [ Σ_(B∩C=A) m_1(B)*m_2(C) ] / (1 - K)
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Combines independent mass functions of model probability, calibrated SVM opinion, and Isolation Forest novelty.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-gray-400">Conflict Factor (K)</span>
              <div className="p-3 bg-cyber-bg border border-cyber-border rounded font-mono text-xs text-white">
                K = Σ_(B∩C=Ø) m_1(B)*m_2(C)
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Measures the degree of conflict between the source models. If K &ge; 0.30, the signal is considered highly conflicting and routed to human review (V3) or PEND (V4).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Threshold and Param Table */}
      <div className="max-w-5xl mx-auto glass-card p-8 space-y-6">
        <div className="flex items-center gap-2 text-white">
          <Table size={20} />
          <h3 className="text-lg font-bold">Decision Threshold Mapping</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-cyber-border text-gray-400">
                <th className="py-3 px-4 font-mono font-medium">PARAMETER</th>
                <th className="py-3 px-4 font-mono font-medium">THRESHOLD VALUE</th>
                <th className="py-3 px-4 font-mono font-medium">DESCRIPTION & BEHAVIOR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border">
              <tr>
                <td className="py-3 px-4 font-mono font-semibold text-cyber-accent">T_approve (Risk)</td>
                <td className="py-3 px-4 font-mono text-white">0.30</td>
                <td className="py-3 px-4 text-gray-400">Transactions with risk below 0.3 are automatically approved if uncertainty is low.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono font-semibold text-cyber-accent">T_block (Risk)</td>
                <td className="py-3 px-4 font-mono text-white">0.80</td>
                <td className="py-3 px-4 text-gray-400">Transactions with risk above 0.8 are automatically blocked if uncertainty is low.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono font-semibold text-cyber-accent">U_threshold (Uncertainty)</td>
                <td className="py-3 px-4 font-mono text-white">0.02</td>
                <td className="py-3 px-4 text-gray-400">Bootstrap standard deviation above 0.02 indicates high model disagreement, triggering abstention.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono font-semibold text-cyber-accent">T_novelty (Outlier)</td>
                <td className="py-3 px-4 font-mono text-white">-0.08</td>
                <td className="py-3 px-4 text-gray-400">Isolation Forest anomaly score below -0.08 flags novel transaction patterns for investigation.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono font-semibold text-cyber-accent">T_svm (Second Opinion)</td>
                <td className="py-3 px-4 font-mono text-white">0.01</td>
                <td className="py-3 px-4 text-gray-400">SVM calibrated probability below 0.01 indicates high neighbor safety, clearing abstained cases.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Isotonic Calibration Info */}
      <div className="max-w-5xl mx-auto glass-card p-6 bg-gradient-to-r from-cyber-card to-cyber-card/40 flex items-start gap-4">
        <Info className="text-cyber-accent flex-shrink-0" size={24} />
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-white">Isotonic Calibration Improvement</h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            By applying isotonic calibration to the XGBoost bootstrap predictions, we aligned model outputs directly with empirical fraud rates. This process reduced the Brier score of the ensemble by <strong className="text-cyber-accent">-74.4%</strong>, ensuring that the risk values correspond mathematically to the probability of true fraud.
          </p>
        </div>
      </div>
    </div>
  );
};
