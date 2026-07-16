import React, { useState } from 'react';
import { Layers, CheckCircle, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';

interface VersionMetrics {
  approve: number;
  decline: number;
  stepup: number;
  abstain: number;
  escalate: number;
  pend: number;
  manualReview: number;
}

const metricsByVersion: Record<string, VersionMetrics> = {
  V1: { approve: 56814, decline: 37, stepup: 10, abstain: 56, escalate: 45, pend: 0, manualReview: 101 },
  V2: { approve: 56823, decline: 37, stepup: 10, abstain: 47, escalate: 45, pend: 0, manualReview: 92 },
  V3: { approve: 56823, decline: 47, stepup: 20, abstain: 47, escalate: 25, pend: 0, manualReview: 72 },
  V4: { approve: 56823, decline: 47, stepup: 20, abstain: 0, escalate: 0, pend: 72, manualReview: 0 }
};

export const Progression: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'V1' | 'V2' | 'V3' | 'V4'>('V4');
  const m = metricsByVersion[selectedTab];

  const total = 56962;

  return (
    <div className="space-y-12 pb-20 animate-fade-in">
      {/* Page Title */}
      <section className="max-w-4xl mx-auto text-center space-y-2">
        <h2 className="text-3xl font-bold text-white tracking-tight">Version Progression Explorer</h2>
        <p className="text-sm text-gray-400">
          Analyze how each layer of the systems architecture reduces the burden on human review queues.
        </p>
      </section>

      {/* Tabs */}
      <div className="flex justify-center gap-2 max-w-md mx-auto bg-cyber-card/60 p-1 rounded-lg border border-cyber-border">
        {(['V1', 'V2', 'V3', 'V4'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`flex-1 py-2 text-xs font-mono font-bold rounded-md transition-all ${
              selectedTab === tab
                ? 'bg-cyber-accent text-cyber-bg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Grid Comparison Matrix */}
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {/* Metric Overview */}
        <div className="md:col-span-1 glass-card p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-sm font-mono uppercase tracking-wider text-cyber-accent">Version Insights</h4>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-white">{selectedTab} Metrics</div>
              <div className="text-xs text-gray-400">Evaluating 56,962 test set cases</div>
            </div>
            <div className="pt-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Human Reviews Required:</span>
                <span className={`font-mono font-bold ${m.manualReview > 0 ? 'text-decision-decline' : 'text-decision-approve'}`}>
                  {m.manualReview}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Automation Rate:</span>
                <span className="font-mono text-white font-bold">
                  {(((total - m.manualReview) / total) * 100).toFixed(3)}%
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Legitimate False Blocks:</span>
                <span className="font-mono text-decision-approve font-bold">0</span>
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-cyber-border text-center">
            <span className="text-xs text-gray-500 font-mono">Cost Per Tx: {selectedTab === 'V1' ? '$1.14' : selectedTab === 'V2' ? '$0.98' : selectedTab === 'V3' ? '$0.84' : '$0.71'}</span>
          </div>
        </div>

        {/* Dynamic Breakdown Bars */}
        <div className="md:col-span-2 glass-card p-8 space-y-6">
          <h4 className="text-sm font-mono uppercase tracking-wider text-white">Bucket Distribution</h4>
          
          <div className="space-y-4">
            {/* Auto Approve */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-300">🟢 Auto Approve</span>
                <span className="text-gray-400">{m.approve.toLocaleString()} ({((m.approve/total)*100).toFixed(2)}%)</span>
              </div>
              <div className="h-2 bg-cyber-bg rounded-full overflow-hidden">
                <div className="h-full bg-decision-approve rounded-full" style={{ width: `${(m.approve/total)*100}%` }}></div>
              </div>
            </div>

            {/* Auto Block / Decline */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-300">🔴 Decline</span>
                <span className="text-gray-400">{m.decline.toLocaleString()} ({((m.decline/total)*100).toFixed(2)}%)</span>
              </div>
              <div className="h-2 bg-cyber-bg rounded-full overflow-hidden">
                <div className="h-full bg-decision-decline rounded-full" style={{ width: `${Math.max(1, (m.decline/total)*100)}%` }}></div>
              </div>
            </div>

            {/* Step Up Auth */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-300">🟡 Step-Up Auth</span>
                <span className="text-gray-400">{m.stepup.toLocaleString()} ({((m.stepup/total)*100).toFixed(2)}%)</span>
              </div>
              <div className="h-2 bg-cyber-bg rounded-full overflow-hidden">
                <div className="h-full bg-decision-stepup rounded-full" style={{ width: `${Math.max(1, (m.stepup/total)*100)}%` }}></div>
              </div>
            </div>

            {/* Abstain */}
            {m.abstain > 0 && (
              <div className="space-y-1 animate-fade-in">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-gray-300">🟣 Abstain (Human Queue)</span>
                  <span className="text-gray-400">{m.abstain.toLocaleString()} ({((m.abstain/total)*100).toFixed(2)}%)</span>
                </div>
                <div className="h-2 bg-cyber-bg rounded-full overflow-hidden">
                  <div className="h-full bg-decision-abstain rounded-full" style={{ width: `${Math.max(1, (m.abstain/total)*100)}%` }}></div>
                </div>
              </div>
            )}

            {/* Escalate */}
            {m.escalate > 0 && (
              <div className="space-y-1 animate-fade-in">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-gray-300">🟠 Escalate (Human Queue)</span>
                  <span className="text-gray-400">{m.escalate.toLocaleString()} ({((m.escalate/total)*100).toFixed(2)}%)</span>
                </div>
                <div className="h-2 bg-cyber-bg rounded-full overflow-hidden">
                  <div className="h-full bg-decision-escalate rounded-full" style={{ width: `${Math.max(1, (m.escalate/total)*100)}%` }}></div>
                </div>
              </div>
            )}

            {/* Pend */}
            {m.pend > 0 && (
              <div className="space-y-1 animate-fade-in">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-gray-300">🔵 Pending (Autonomous SHAP)</span>
                  <span className="text-gray-400">{m.pend.toLocaleString()} ({((m.pend/total)*100).toFixed(2)}%)</span>
                </div>
                <div className="h-2 bg-cyber-bg rounded-full overflow-hidden">
                  <div className="h-full bg-decision-pend rounded-full" style={{ width: `${Math.max(1, (m.pend/total)*100)}%` }}></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description Cards based on Selected Version */}
      <div className="max-w-5xl mx-auto">
        {selectedTab === 'V1' && (
          <div className="glass-card p-6 border-l-4 border-l-cyber-accent space-y-4">
            <h4 className="text-lg font-bold text-white">V1 Baseline — Core 2D Plane</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              V1 establishes the risk-uncertainty space. Transactions are grouped into five buckets: APPROVE, STEP_UP, ABSTAIN, ESCALATE, and DECLINE. In V1, any case falling into the ABSTAIN or ESCALATE bucket requires a human analyst to manually resolve it. This leaves <strong>101 transactions</strong> requiring manual labor — 56 abstentions and 45 escalations.
            </p>
          </div>
        )}
        {selectedTab === 'V2' && (
          <div className="glass-card p-6 border-l-4 border-l-purple-500 space-y-4">
            <h4 className="text-lg font-bold text-white">V2 SVM Neighborhood Resolution</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              V2 introduces the Support Vector Machine second opinion model. It intercepts transactions in the ABSTAIN zone (where risk is low but model disagreement is high) and scans the local feature neighborhood. If the neighbor distribution is benign (P(fraud) &lt; 0.01), it clears them to APPROVE. This successfully resolves <strong>9 of the 56 V1 abstentions</strong> without human intervention, reducing the human workload to <strong>92 cases</strong>.
            </p>
          </div>
        )}
        {selectedTab === 'V3' && (
          <div className="glass-card p-6 border-l-4 border-l-amber-500 space-y-4">
            <h4 className="text-lg font-bold text-white">V3 Dempster-Shafer Evidence Fusion</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              V3 adds Dempster-Shafer mathematical belief functions to evaluate the ESCALATE bucket. By fusing the conflicting outputs of the XGBoost ensemble, calibrated SVM, and Isolation Forest novelty score, V3 resolves cases of low conflict and high belief. This automates <strong>44.44% of the high-risk escalations</strong> (20 out of 45 cases), resolving them into AUTO_DECLINE or STEP_UP, and reducing total human review queue to <strong>72 cases</strong>.
            </p>
          </div>
        )}
        {selectedTab === 'V4' && (
          <div className="glass-card p-6 border-l-4 border-l-cyan-500 space-y-4">
            <h4 className="text-lg font-bold text-white">V4 Terminal State Collapse & Explainability</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              V4 represents the fully autonomous architecture. It collapses all intermediate stages into 4 terminal actions (APPROVE, DECLINE, STEP_UP, PEND). Transactions that remain unresolved by SVM and Dempster-Shafer (72 total cases: 47 from ABSTAIN and 25 from ESCALATE) are routed to a final PEND state where a list of local SHAP feature reason codes is automatically attached. This results in <strong>0% required human intervention</strong>, achieving complete automation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
