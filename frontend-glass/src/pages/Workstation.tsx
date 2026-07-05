import React, { useState, useEffect } from 'react';
import { useStore, Version, HistoryItem } from '../store/useStore';
import { generateRandomTransaction, PRESETS } from '../utils/math';
import { Play, RotateCcw, AlertOctagon, HelpCircle, ArrowRight, ShieldCheck, AlertCircle, Eye } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ReferenceLine, ResponsiveContainer, Dot } from 'recharts';

export const Workstation: React.FC = () => {
  const {
    activeVersion,
    setActiveVersion,
    currentTxn,
    setCurrentTxn,
    history,
    addHistoryItem,
    clearHistory,
    apiStatus,
    setApiStatus
  } = useStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check health on mount
  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(() => setApiStatus('connected'))
      .catch(() => setApiStatus('disconnected'));
  }, [setApiStatus]);

  const handlePredict = async (features: number[], isPreset = false, label = 'Random run') => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (apiStatus === 'connected') {
        const res = await fetch(`/api/predict?version=${activeVersion}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ features })
        });
        if (!res.ok) throw new Error('API server returned error');
        data = await res.json();
      } else {
        // Local simulation fallback if FastAPI backend is not running
        const prob = Math.random();
        const std = Math.random() * 0.05;
        const anomaly = Math.random() * 0.2 - 0.1;
        let decision = 'APPROVE';
        
        if (activeVersion === 'V1') {
          if (prob < 0.3) decision = std >= 0.02 ? 'ABSTAIN' : 'APPROVE';
          else if (prob >= 0.8) decision = std >= 0.02 ? 'ESCALATE_INVEST' : 'DECLINE';
          else decision = 'STEP_UP_AUTH';
        } else if (activeVersion === 'V2') {
          if (prob < 0.3) {
            decision = std >= 0.02 ? (Math.random() > 0.5 ? 'APPROVE' : 'STEP_UP_AUTH') : 'APPROVE';
          } else if (prob >= 0.8) {
            decision = std >= 0.02 ? 'ESCALATE_INVEST' : 'DECLINE';
          } else decision = 'STEP_UP_AUTH';
        } else if (activeVersion === 'V3') {
          if (prob < 0.3) {
            decision = std >= 0.02 ? (Math.random() > 0.5 ? 'APPROVE' : 'STEP_UP_AUTH') : 'APPROVE';
          } else if (prob >= 0.8) {
            decision = std >= 0.02 ? (Math.random() > 0.6 ? 'AUTO_DECLINE' : 'STEP_UP_AUTH') : 'DECLINE';
          } else decision = 'STEP_UP_AUTH';
        } else { // V4
          if (prob < 0.3) {
            decision = std >= 0.02 ? (Math.random() > 0.5 ? 'APPROVE' : 'STEP_UP_AUTH') : 'APPROVE';
          } else if (prob >= 0.8) {
            decision = std >= 0.02 ? (Math.random() > 0.6 ? 'DECLINE' : 'STEP_UP_AUTH') : 'DECLINE';
          } else {
            decision = Math.random() > 0.5 ? 'PEND' : 'STEP_UP_AUTH';
          }
        }

        data = {
          decision,
          probability: prob,
          uncertainty: std,
          anomaly_score: anomaly,
          diagnostic: {
            v2_svm_prob: Math.random() * 0.05,
            v2_resolved: std >= 0.02 && prob < 0.3,
            v3_belief: Math.random(),
            v3_ignorance: Math.random() * 0.1,
            v3_conflict: Math.random() * 0.3,
            v4_reason_code: 'HIGH_UNCERTAINTY_V4',
            v4_shap_contributions: [
              { feature: 'V17', value: -0.85 },
              { feature: 'V14', value: 0.42 },
              { feature: 'Amount', value: -0.12 }
            ]
          }
        };
      }

      const txnData = {
        features,
        amount: features[29],
        time: features[0],
        decision: data.decision,
        risk: data.probability,
        uncertainty: data.uncertainty,
        novelty: data.anomaly_score,
        diagnostic: data.diagnostic || {}
      };
      
      setCurrentTxn(txnData);

      const historyItem: HistoryItem = {
        id: `TX-${Math.floor(100000 + Math.random() * 900000)}`,
        timestamp: new Date().toLocaleTimeString(),
        amount: features[29],
        risk: data.probability,
        uncertainty: data.uncertainty,
        version: activeVersion,
        finalBucket: data.decision,
        features,
        novelty: data.anomaly_score,
        diagnostic: data.diagnostic || {}
      };

      addHistoryItem(historyItem);
    } catch (err: any) {
      setError(err.message || 'An error occurred during evaluation');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRandom = () => {
    const features = generateRandomTransaction();
    handlePredict(features, false, 'Random run');
  };

  const handleLoadPreset = (presetName: string) => {
    const features = PRESETS[presetName];
    if (features) {
      handlePredict(features, true, `Preset: ${presetName}`);
    }
  };

  const getPillColor = (dec: string | null) => {
    if (!dec) return 'bg-gray-800 text-gray-400 border-gray-700';
    switch (dec) {
      case 'APPROVE':
      case 'AUTO_APPROVE':
        return 'bg-decision-approve/10 text-decision-approve border-decision-approve/30 shadow-[0_0_15px_rgba(0,255,204,0.1)]';
      case 'ABSTAIN':
        return 'bg-decision-abstain/10 text-decision-abstain border-decision-abstain/30';
      case 'STEP_UP_AUTH':
      case 'STEP_UP':
        return 'bg-decision-stepup/10 text-decision-stepup border-decision-stepup/30';
      case 'ESCALATE_INVEST':
      case 'HUMAN_ESCALATE':
        return 'bg-decision-escalate/10 text-decision-escalate border-decision-escalate/30';
      case 'DECLINE':
      case 'AUTO_DECLINE':
      case 'BLOCK':
        return 'bg-decision-decline/10 text-decision-decline border-decision-decline/30 shadow-[0_0_15px_rgba(255,0,51,0.1)]';
      case 'PEND':
        return 'bg-decision-pend/10 text-decision-pend border-decision-pend/30 shadow-[0_0_15px_rgba(56,189,248,0.1)]';
      default:
        return 'bg-gray-800 text-gray-400 border-gray-700';
    }
  };

  // Coordinates data for scatter chart
  const scatterData = currentTxn.risk !== null && currentTxn.uncertainty !== null
    ? [{ x: currentTxn.risk, y: currentTxn.uncertainty, name: currentTxn.decision }]
    : [];

  return (
    <div className="grid lg:grid-cols-3 gap-8 pb-20 animate-fade-in">
      {/* LEFT COLUMN: Controls & Presets */}
      <div className="space-y-6 lg:col-span-1">
        {/* Controls Card */}
        <div className="glass-card p-6 space-y-6">
          <h3 className="text-sm font-mono uppercase tracking-wider text-white">Workstation Input</h3>
          
          <div className="space-y-2">
            <label className="text-xs text-gray-400 font-medium">Select Evaluation Version</label>
            <div className="grid grid-cols-4 gap-1 p-1 bg-cyber-bg border border-cyber-border rounded-lg">
              {(['V1', 'V2', 'V3', 'V4'] as Version[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setActiveVersion(v)}
                  className={`py-1.5 text-xs font-mono font-bold rounded transition-all ${
                    activeVersion === v
                      ? 'bg-cyber-accent text-cyber-bg'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerateRandom}
            disabled={loading}
            className="w-full py-3 btn-gradient flex items-center justify-center gap-2 text-sm"
          >
            <Play size={16} /> ⚡ Generate Random
          </button>

          <div className="relative text-center">
            <span className="absolute inset-x-0 top-1/2 border-b border-cyber-border -translate-y-1/2"></span>
            <span className="relative px-3 bg-cyber-card text-[11px] text-gray-500 font-mono uppercase">or load preset scenario</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleLoadPreset('approve')}
              className="py-2 px-3 border border-cyber-border rounded hover:border-decision-approve/30 hover:bg-decision-approve/5 text-left text-xs font-mono text-gray-300 flex items-center gap-1.5 transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-decision-approve"></span> Approve
            </button>
            <button
              onClick={() => handleLoadPreset('stepup')}
              className="py-2 px-3 border border-cyber-border rounded hover:border-decision-stepup/30 hover:bg-decision-stepup/5 text-left text-xs font-mono text-gray-300 flex items-center gap-1.5 transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-decision-stepup"></span> Step-Up
            </button>
            <button
              onClick={() => handleLoadPreset('abstain')}
              className="py-2 px-3 border border-cyber-border rounded hover:border-decision-abstain/30 hover:bg-decision-abstain/5 text-left text-xs font-mono text-gray-300 flex items-center gap-1.5 transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-decision-abstain"></span> Abstain
            </button>
            <button
              onClick={() => handleLoadPreset('escalate')}
              className="py-2 px-3 border border-cyber-border rounded hover:border-decision-escalate/30 hover:bg-decision-escalate/5 text-left text-xs font-mono text-gray-300 flex items-center gap-1.5 transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-decision-escalate"></span> Escalate
            </button>
            <button
              onClick={() => handleLoadPreset('decline')}
              className="py-2 px-3 border border-cyber-border rounded hover:border-decision-decline/30 hover:bg-decision-decline/5 text-left text-xs font-mono text-gray-300 flex items-center gap-1.5 transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-decision-decline"></span> Block
            </button>
            <button
              onClick={() => handleLoadPreset('pend')}
              className="py-2 px-3 border border-cyber-border rounded hover:border-decision-pend/30 hover:bg-decision-pend/5 text-left text-xs font-mono text-gray-300 flex items-center gap-1.5 transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-decision-pend"></span> PEND (V4)
            </button>
          </div>
        </div>

        {/* History Log */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-mono uppercase tracking-wider text-white">Session History</h3>
            {history.length > 0 && (
              <button onClick={clearHistory} className="text-gray-500 hover:text-white transition-colors">
                <RotateCcw size={14} />
              </button>
            )}
          </div>
          
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {history.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-500 font-sans">No transactions evaluated yet</div>
            ) : (
              history.map((h, i) => (
                <div
                  key={h.id}
                  onClick={() => setCurrentTxn(h)}
                  className={`p-3 rounded border border-cyber-border hover:border-gray-600 bg-cyber-bg/40 cursor-pointer flex justify-between items-center transition-all ${
                    currentTxn.features === h.features ? 'border-cyber-accent/30 bg-cyber-card/60' : ''
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-mono font-bold text-white">{h.id}</div>
                    <div className="text-[10px] text-gray-500 font-sans">${h.amount.toFixed(2)} · {h.timestamp}</div>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getPillColor(h.finalBucket)}`}>
                    {h.finalBucket}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* CENTER & RIGHT COLUMNS: Scatter plot & diagnostics */}
      <div className="space-y-6 lg:col-span-2">
        {currentTxn.features === null ? (
          <div className="glass-card p-20 flex flex-col items-center justify-center text-center space-y-4 min-h-[450px]">
            <div className="text-gray-500 text-3xl">◇</div>
            <h3 className="text-lg font-bold text-white">Experiment Chamber</h3>
            <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
              Inject a simulated transaction or preset using the left control panel to observe live decision routing.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Live Verdict pill */}
            <div className="glass-card p-6 flex flex-wrap justify-between items-center gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Active Evaluation Verdict</span>
                <div className="text-2xl font-bold text-white flex items-center gap-2">
                  <span>Routing Bucket:</span>
                  <span className={`text-base font-mono px-3 py-1 rounded-full border ${getPillColor(currentTxn.decision)}`}>
                    {currentTxn.decision}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end text-right font-mono text-xs">
                <span className="text-gray-500">Evaluation Mode</span>
                <span className="text-cyber-accent font-semibold">{activeVersion} Active Engine</span>
              </div>
            </div>

            {/* 2D Decision Grid Plot */}
            <div className="glass-card p-6">
              <h4 className="text-xs font-mono uppercase tracking-wider text-gray-400 mb-4">Risk × Uncertainty 2D Coordinate Space</h4>
              
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                    <XAxis
                      type="number"
                      dataKey="x"
                      name="Risk"
                      domain={[0, 1.0]}
                      stroke="#475569"
                      tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                    />
                    <YAxis
                      type="number"
                      dataKey="y"
                      name="Uncertainty"
                      domain={[0, 0.05]}
                      stroke="#475569"
                    />
                    {/* Draggable threshold lines */}
                    <ReferenceLine x={0.3} stroke="#ffaa00" strokeDasharray="3 3" label={{ value: 'T_approve', position: 'top', fill: '#ffaa00', fontSize: 10 }} />
                    <ReferenceLine x={0.8} stroke="#ff0033" strokeDasharray="3 3" label={{ value: 'T_block', position: 'top', fill: '#ff0033', fontSize: 10 }} />
                    <ReferenceLine y={0.02} stroke="#bd00ff" strokeDasharray="3 3" label={{ value: 'U_threshold', position: 'right', fill: '#bd00ff', fontSize: 10 }} />
                    <Scatter name="Transaction" data={scatterData} fill="#00d4aa">
                      {scatterData.map((entry, index) => (
                        <Dot
                          key={`dot-${index}`}
                          cx={0}
                          cy={0}
                          r={8}
                          fill="#00d4aa"
                          className="animate-pulse shadow-[0_0_15px_#00d4aa]"
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Diagnostic metrics */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Core metrics */}
              <div className="glass-card p-6 space-y-4">
                <h4 className="text-xs font-mono uppercase tracking-wider text-gray-400">Core Quantifiers</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-500 font-mono">XGBoost Risk Probability</span>
                    <div className="text-xl font-bold font-mono text-white">
                      {currentTxn.risk !== null ? `${(currentTxn.risk * 100).toFixed(2)}%` : '—'}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-500 font-mono">Ensemble Std Dev</span>
                    <div className="text-xl font-bold font-mono text-white">
                      {currentTxn.uncertainty !== null ? currentTxn.uncertainty.toFixed(4) : '—'}
                    </div>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <span className="text-[10px] text-gray-500 font-mono">Isolation Forest Novelty</span>
                    <div className="text-xl font-bold font-mono text-white">
                      {currentTxn.novelty !== null ? currentTxn.novelty.toFixed(4) : '—'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Resolution Layers diagnostic info */}
              <div className="glass-card p-6 space-y-4">
                <h4 className="text-xs font-mono uppercase tracking-wider text-gray-400">Additive Routing Audit</h4>
                
                <div className="space-y-3 text-xs">
                  {/* V2 SVM diagnostic */}
                  <div className="flex justify-between items-center py-1.5 border-b border-cyber-border/40">
                    <span className="text-gray-400 font-sans">V2 SVM Clear Check:</span>
                    <span className="font-mono text-white font-semibold">
                      {activeVersion !== 'V1' && currentTxn.diagnostic?.v2_svm_prob !== undefined
                        ? `P(fraud) = ${currentTxn.diagnostic.v2_svm_prob.toFixed(4)}`
                        : 'Bypassed / V1'}
                    </span>
                  </div>

                  {/* V3 DS diagnostic */}
                  <div className="flex justify-between items-center py-1.5 border-b border-cyber-border/40">
                    <span className="text-gray-400 font-sans">V3 D-S Belief:</span>
                    <span className="font-mono text-white font-semibold">
                      {['V3', 'V4'].includes(activeVersion) && currentTxn.diagnostic?.v3_belief !== undefined
                        ? `Belief = ${currentTxn.diagnostic.v3_belief.toFixed(2)}`
                        : 'Bypassed'}
                    </span>
                  </div>

                  {/* V4 SHAP diagnostic */}
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-gray-400 font-sans">V4 SHAP Reason:</span>
                    <span className="font-mono text-cyber-accent font-bold">
                      {activeVersion === 'V4' && currentTxn.diagnostic?.v4_reason_code
                        ? currentTxn.diagnostic.v4_reason_code
                        : 'Bypassed'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
