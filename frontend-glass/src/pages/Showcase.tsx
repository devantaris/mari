import React, { useState } from 'react';
import { ArrowRight, Layers, ShieldCheck, UserCheck, BarChart3, AlertCircle, GitBranch, Cpu, Database, Zap, Shield, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { useStore } from '../store/useStore';

export const Showcase: React.FC = () => {
  const { setCurrentPage } = useStore();
  const [archVersion, setArchVersion] = useState<'V1' | 'V2' | 'V3' | 'V4'>('V1');

  return (
    <div className="space-y-20 pb-20 animate-fade-in">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto pt-10 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyber-border bg-cyber-card/40 text-cyber-accent text-xs font-mono tracking-widest uppercase">
          <Layers size={14} /> SELECTIVE CLASSIFICATION · DECISION THEORY
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-none text-white">
          Knowing When <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-accent to-purple-500">
            Not to Decide.
          </span>
        </h1>
        <p className="text-lg md:text-xl text-gray-400 font-sans max-w-2xl mx-auto leading-relaxed">
          A multi-stage decision framework by <span className="text-white font-medium">Devansh Kumar</span> that extends fraud detection into a two-dimensional Risk × Uncertainty space — achieving <span className="text-cyber-accent font-semibold">100% automation</span> with <span className="text-white font-semibold">zero false blocks</span>.
        </p>
        <div className="pt-4 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => setCurrentPage('workstation')}
            className="px-6 py-3 btn-gradient flex items-center gap-2 text-sm"
          >
            Enter Workstation <ArrowRight size={16} />
          </button>
          <a
            href="https://github.com/devantaris/mari"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 border border-cyber-border rounded-lg text-gray-400 hover:text-white hover:border-gray-600 transition-colors text-sm font-medium"
          >
            View on GitHub
          </a>
        </div>
      </section>

      {/* Headline Impact Metrics */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
        {[
          { label: 'Ensemble ROC-AUC', value: '0.9851', icon: ShieldCheck, color: 'text-decision-approve' },
          { label: 'Abstain Zone Enrichment', value: '290x', icon: BarChart3, color: 'text-cyber-accent' },
          { label: 'Human Intervention', value: '0%', icon: UserCheck, color: 'text-decision-pend' },
          { label: 'Terminal State Buckets', value: '4 States', icon: AlertCircle, color: 'text-decision-stepup' }
        ].map((m, idx) => (
          <div key={idx} className="glass-card p-6 flex flex-col items-center text-center space-y-2">
            <m.icon className={`${m.color}`} size={24} />
            <span className="text-2xl md:text-3xl font-bold font-mono text-white">{m.value}</span>
            <span className="text-xs text-gray-400 font-sans">{m.label}</span>
          </div>
        ))}
      </section>

      {/* The Problem vs Systems Solution */}
      <section className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <div className="glass-card p-8 border-red-500/20 bg-gradient-to-b from-red-950/10 to-cyber-card/40 space-y-4">
          <div className="text-red-400 font-mono text-xs uppercase tracking-wider">Traditional Machine Learning</div>
          <h3 className="text-xl font-bold text-white">Forced Binary Decisions</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Standard classifiers force a binary decision (fraud or safe) on every transaction, even when predictions are highly uncertain. This results in catastrophic customer friction (false declines) or missed fraud due to model overconfidence.
          </p>
        </div>
        <div className="glass-card p-8 border-cyber-accent/20 bg-gradient-to-b from-cyber-accent/5 to-cyber-card/40 space-y-4">
          <div className="text-cyber-accent font-mono text-xs uppercase tracking-wider">MARI Decision Framework</div>
          <h3 className="text-xl font-bold text-white">Epistemic Uncertainty Routing</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            By mapping transactions to a 2D Risk × Uncertainty coordinate plane, MARI isolates high-uncertainty and outlier cases. They are routed to specialized resolution layers (SVM Non-linear Clearing, Dempster-Shafer Evidence Fusion) rather than making blind guesses.
          </p>
        </div>
      </section>

      {/* Systems Architecture Journey */}
      <section className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-white">The Evolutionary Progression</h2>
          <p className="text-sm text-gray-400 max-w-xl mx-auto">
            How MARI systematically eliminates human manual review queues from V1 through V4.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {[
            {
              v: 'V1',
              title: 'Abstention Engine',
              desc: 'Establishes 2D risk-uncertainty space & Isolation Forest anomaly check. Maps into 5 buckets, routing uncertain cases to manual review.',
              contrib: 'Quantifies Uncertainty & Novelty',
              metric: '5 routing buckets'
            },
            {
              v: 'V2',
              title: 'SVM Second Opinion',
              desc: 'Intercepts ABSTAIN cases. Employs non-linear Support Vector Machine neighborhood density in PCA space to safely clear customer transactions.',
              contrib: 'Clears 16.07% of Abstentions',
              metric: '9 transactions cleared'
            },
            {
              v: 'V3',
              title: 'Dempster-Shafer Fusion',
              desc: 'Intercepts ESCALATE cases. Combines ensemble probabilities, SVM decisions, and Isolation Forest scores to resolve conflicts mathematically.',
              contrib: '44.44% of Escalations automated',
              metric: 'K ≥ 0.30 → Human'
            },
            {
              v: 'V4',
              title: 'Autonomous Explainability',
              desc: 'Collapses remaining unresolved cases into PEND. Attaches SHAP feature reason codes to bypass human manual queues completely.',
              contrib: '0% Human Review Required',
              metric: '100% automated lifecycle'
            }
          ].map((card, idx) => (
            <div key={idx} className="glass-card p-6 flex flex-col justify-between border-t-2 border-t-cyber-accent/40 glass-card-hover min-h-[300px]">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyber-border text-cyber-accent font-bold">{card.v}</span>
                  <span className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">{card.metric}</span>
                </div>
                <h4 className="text-lg font-semibold text-white">{card.title}</h4>
                <p className="text-xs text-gray-400 leading-relaxed">{card.desc}</p>
              </div>
              <div className="pt-4 border-t border-cyber-border text-[11px] text-gray-400 font-mono text-center font-medium">
                💡 {card.contrib}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2D Decision Space — Visual */}
      <section className="max-w-5xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-white">The 2D Decision Space</h2>
          <p className="text-sm text-gray-400 max-w-xl mx-auto">
            Every transaction is plotted as a coordinate in Risk × Uncertainty space. Where it lands determines its routing state.
          </p>
        </div>

        <div className="glass-card p-8">
          {/* Grid layout mimicking the 2D plane */}
          <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto">
            {/* High Uncertainty Row */}
            <div className="glass-card p-5 border-decision-abstain/30 bg-gradient-to-br from-decision-abstain/10 to-cyber-card/40 space-y-2">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-decision-abstain" />
                <span className="text-xs font-mono font-bold text-decision-abstain uppercase tracking-wider">ABSTAIN</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">Low risk probability but high model disagreement. Defer to rule engine — don't guess.</p>
              <div className="text-[10px] font-mono text-gray-500">Risk &lt; 0.30 · Uncertainty ≥ 0.02</div>
            </div>
            <div className="glass-card p-5 border-decision-escalate/30 bg-gradient-to-br from-decision-escalate/10 to-cyber-card/40 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-decision-escalate" />
                <span className="text-xs font-mono font-bold text-decision-escalate uppercase tracking-wider">ESCALATE</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">High risk AND high model disagreement, or a completely novel behavioral pattern detected.</p>
              <div className="text-[10px] font-mono text-gray-500">Risk ≥ 0.60 · Uncertainty ≥ 0.02</div>
            </div>

            {/* Low Uncertainty Row */}
            <div className="glass-card p-5 border-decision-approve/30 bg-gradient-to-br from-decision-approve/10 to-cyber-card/40 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-decision-approve" />
                <span className="text-xs font-mono font-bold text-decision-approve uppercase tracking-wider">APPROVE</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">Low fraud probability AND models agree. Safe to auto-approve. Zero friction for the customer.</p>
              <div className="text-[10px] font-mono text-gray-500">Risk &lt; 0.30 · Uncertainty &lt; 0.02</div>
            </div>
            <div className="glass-card p-5 border-decision-stepup/30 bg-gradient-to-br from-decision-stepup/10 to-cyber-card/40 space-y-2">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-decision-stepup" />
                <span className="text-xs font-mono font-bold text-decision-stepup uppercase tracking-wider">STEP_UP_AUTH</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">Medium risk zone. Trigger additional authentication — OTP, biometric, security question.</p>
              <div className="text-[10px] font-mono text-gray-500">0.30 ≤ Risk &lt; 0.80</div>
            </div>
          </div>

          {/* DECLINE sits at the far right */}
          <div className="mt-3 max-w-2xl mx-auto">
            <div className="glass-card p-5 border-decision-decline/30 bg-gradient-to-br from-decision-decline/10 to-cyber-card/40 space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-decision-decline" />
                <span className="text-xs font-mono font-bold text-decision-decline uppercase tracking-wider">DECLINE</span>
                <span className="ml-auto text-[10px] font-mono text-gray-500">Risk ≥ 0.80 · Uncertainty &lt; 0.02</span>
              </div>
              <p className="text-[11px] text-gray-400">Maximum risk, maximum model consensus. Auto-block. No ambiguity — the ensemble agrees this is fraud.</p>
            </div>
          </div>

          {/* Axis labels */}
          <div className="mt-4 flex justify-between items-center max-w-2xl mx-auto text-[10px] font-mono text-gray-500 uppercase tracking-widest">
            <span>← Low Uncertainty</span>
            <span className="text-cyber-accent">Risk × Uncertainty Plane</span>
            <span>High Uncertainty →</span>
          </div>
        </div>
      </section>

      {/* System Architecture Flow — Interactive */}
      <section className="max-w-5xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-white">System Architecture</h2>
          <p className="text-sm text-gray-400 max-w-xl mx-auto">
            Each version adds a new resolution layer that absorbs a routing bucket — eliminating human review progressively.
          </p>
        </div>

        {/* Version selector */}
        <div className="flex justify-center">
          <div className="inline-flex gap-1 p-1 bg-cyber-bg border border-cyber-border rounded-lg">
            {(['V1', 'V2', 'V3', 'V4'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setArchVersion(v)}
                className={`px-5 py-1.5 rounded text-xs font-mono font-bold transition-all ${
                  archVersion === v
                    ? 'bg-cyber-accent text-cyber-bg shadow-[0_0_12px_rgba(0,212,170,0.3)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card p-8 space-y-8">

          {/* ── Pipeline Flow Row ── */}
          <div className="flex flex-wrap justify-center items-start gap-3">

            {/* INPUT */}
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-lg bg-cyber-border border border-cyber-border/60">
                <Database size={20} className="text-gray-400" />
              </div>
              <span className="text-[10px] font-mono text-gray-500 text-center">Transaction<br/>31 Features</span>
            </div>
            <div className="flex items-center pt-3"><ArrowRight size={14} className="text-gray-600" /></div>

            {/* ENSEMBLE */}
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-lg bg-cyber-accent/10 border border-cyber-accent/30">
                <Cpu size={20} className="text-cyber-accent" />
              </div>
              <span className="text-[10px] font-mono text-cyber-accent text-center">XGBoost<br/>Ensemble ×5</span>
            </div>
            <div className="flex items-center pt-3"><ArrowRight size={14} className="text-gray-600" /></div>

            {/* ISOLATION FOREST */}
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <Zap size={20} className="text-purple-400" />
              </div>
              <span className="text-[10px] font-mono text-purple-400 text-center">Isolation<br/>Forest</span>
            </div>
            <div className="flex items-center pt-3"><ArrowRight size={14} className="text-gray-600" /></div>

            {/* ROUTER */}
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <GitBranch size={20} className="text-blue-400" />
              </div>
              <span className="text-[10px] font-mono text-blue-400 text-center">2D Router<br/>V1 Core</span>
            </div>
            <div className="flex items-center pt-3"><ArrowRight size={14} className="text-gray-600" /></div>

            {/* V1 BUCKETS — always shown, some get absorbed in later versions */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">V1 Buckets</span>
              {[
                { key: 'APPROVE', color: 'border-decision-approve/40 text-decision-approve bg-decision-approve/5', absorbedAt: null },
                { key: 'STEP_UP', color: 'border-decision-stepup/40 text-decision-stepup bg-decision-stepup/5', absorbedAt: null },
                { key: 'ABSTAIN', color: 'border-decision-abstain/40 text-decision-abstain bg-decision-abstain/5', absorbedAt: 'V2' },
                { key: 'ESCALATE', color: 'border-decision-escalate/40 text-decision-escalate bg-decision-escalate/5', absorbedAt: 'V3' },
                { key: 'DECLINE', color: 'border-decision-decline/40 text-decision-decline bg-decision-decline/5', absorbedAt: null },
              ].map(({ key, color, absorbedAt }) => {
                const isAbsorbed =
                  (absorbedAt === 'V2' && ['V2','V3','V4'].includes(archVersion)) ||
                  (absorbedAt === 'V3' && ['V3','V4'].includes(archVersion));
                return (
                  <div key={key} className="relative">
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded border block transition-all ${
                      isAbsorbed ? 'opacity-30 line-through' : color
                    }`}>{key}</span>
                    {isAbsorbed && (
                      <span className={`absolute -right-14 top-0 text-[8px] font-mono whitespace-nowrap ${
                        absorbedAt === 'V2' ? 'text-cyber-accent' : 'text-purple-400'
                      }`}>→ {absorbedAt}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* V2 SVM LAYER — appears from V2 onwards */}
            {['V2','V3','V4'].includes(archVersion) && (
              <>
                <div className="flex items-center pt-3"><ArrowRight size={14} className="text-cyber-accent" /></div>
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 rounded-lg bg-cyber-accent/15 border border-cyber-accent/50 shadow-[0_0_10px_rgba(0,212,170,0.15)]">
                    <Shield size={20} className="text-cyber-accent" />
                  </div>
                  <span className="text-[10px] font-mono text-cyber-accent text-center">SVM<br/>2nd Opinion</span>
                  <span className="text-[8px] font-mono text-cyber-accent/60 text-center">clears 16%<br/>of ABSTAINs</span>
                </div>
              </>
            )}

            {/* V3 D-S FUSION LAYER — appears from V3 onwards */}
            {['V3','V4'].includes(archVersion) && (
              <>
                <div className="flex items-center pt-3"><ArrowRight size={14} className="text-purple-400" /></div>
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 rounded-lg bg-purple-500/15 border border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.15)]">
                    <GitBranch size={20} className="text-purple-400" />
                  </div>
                  <span className="text-[10px] font-mono text-purple-400 text-center">D-S<br/>Evidence Fusion</span>
                  <span className="text-[8px] font-mono text-purple-400/60 text-center">automates 44%<br/>of ESCALATEs</span>
                </div>
              </>
            )}

            {/* V4 SHAP LAYER — appears in V4 */}
            {archVersion === 'V4' && (
              <>
                <div className="flex items-center pt-3"><ArrowRight size={14} className="text-blue-400" /></div>
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 rounded-lg bg-blue-500/15 border border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.15)]">
                    <Layers size={20} className="text-blue-400" />
                  </div>
                  <span className="text-[10px] font-mono text-blue-400 text-center">SHAP<br/>Reason Codes</span>
                  <span className="text-[8px] font-mono text-blue-400/60 text-center">→ PEND<br/>0% human review</span>
                </div>
              </>
            )}

            <div className="flex items-center pt-3"><ArrowRight size={14} className="text-gray-600" /></div>

            {/* TERMINAL OUTPUTS — changes per version */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">Terminal Output</span>
              {archVersion === 'V1' && (
                <>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded border border-decision-approve/40 text-decision-approve bg-decision-approve/5">APPROVE</span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded border border-decision-stepup/40 text-decision-stepup bg-decision-stepup/5">STEP_UP</span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded border border-decision-abstain/40 text-decision-abstain bg-decision-abstain/5">ABSTAIN</span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded border border-decision-escalate/40 text-decision-escalate bg-decision-escalate/5">ESCALATE</span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded border border-decision-decline/40 text-decision-decline bg-decision-decline/5">DECLINE</span>
                  <span className="text-[8px] text-gray-500 font-mono mt-1">5 buckets · human review required</span>
                </>
              )}
              {archVersion === 'V2' && (
                <>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded border border-decision-approve/40 text-decision-approve bg-decision-approve/5">APPROVE</span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded border border-decision-stepup/40 text-decision-stepup bg-decision-stepup/5">STEP_UP</span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded border border-decision-abstain/30 text-decision-abstain/50 bg-decision-abstain/3 opacity-40">ABSTAIN ↓</span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded border border-decision-escalate/40 text-decision-escalate bg-decision-escalate/5">ESCALATE</span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded border border-decision-decline/40 text-decision-decline bg-decision-decline/5">DECLINE</span>
                  <span className="text-[8px] text-cyber-accent font-mono mt-1">ABSTAIN partially cleared ✓</span>
                </>
              )}
              {archVersion === 'V3' && (
                <>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded border border-decision-approve/40 text-decision-approve bg-decision-approve/5">APPROVE</span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded border border-decision-stepup/40 text-decision-stepup bg-decision-stepup/5">STEP_UP</span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded border border-decision-escalate/30 text-decision-escalate/40 opacity-30">ESCALATE ↓</span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded border border-decision-decline/40 text-decision-decline bg-decision-decline/5">DECLINE</span>
                  <span className="text-[8px] text-purple-400 font-mono mt-1">ABSTAIN + ESCALATE resolved ✓</span>
                </>
              )}
              {archVersion === 'V4' && (
                <>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded border border-decision-approve/40 text-decision-approve bg-decision-approve/5">APPROVE</span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded border border-decision-stepup/40 text-decision-stepup bg-decision-stepup/5">STEP_UP</span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded border border-decision-pend/40 text-decision-pend bg-decision-pend/5">PEND + SHAP</span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded border border-decision-decline/40 text-decision-decline bg-decision-decline/5">DECLINE</span>
                  <span className="text-[8px] text-blue-400 font-mono mt-1">0% human review · fully automated ✓</span>
                </>
              )}
            </div>

            <div className="flex items-center pt-3"><ArrowRight size={14} className="text-gray-600" /></div>

            {/* COST ENGINE */}
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <TrendingUp size={20} className="text-yellow-400" />
              </div>
              <span className="text-[10px] font-mono text-yellow-400 text-center">Cost<br/>Engine</span>
            </div>
          </div>

          {/* ── Version context callout ── */}
          <div className={`rounded-lg border p-4 transition-all ${
            archVersion === 'V1' ? 'border-blue-500/20 bg-blue-950/20' :
            archVersion === 'V2' ? 'border-cyber-accent/20 bg-cyber-accent/5' :
            archVersion === 'V3' ? 'border-purple-500/20 bg-purple-950/20' :
            'border-blue-400/20 bg-blue-950/20'
          }`}>
            {archVersion === 'V1' && (
              <div className="space-y-1">
                <div className="text-xs font-bold text-white">V1 — Abstention Engine</div>
                <p className="text-[11px] text-gray-400">Establishes the 2D Risk × Uncertainty coordinate space. Outputs 5 raw buckets. ABSTAIN and ESCALATE still require human review queues. This is the baseline — powerful, but not fully autonomous.</p>
              </div>
            )}
            {archVersion === 'V2' && (
              <div className="space-y-1">
                <div className="text-xs font-bold text-cyber-accent">V2 — SVM Second Opinion Layer</div>
                <p className="text-[11px] text-gray-400">A calibrated SVM examines the PCA neighborhood density of ABSTAIN transactions. If the local neighborhood is overwhelmingly legitimate (P(fraud) &lt; 0.01), the case is safely cleared — no human needed. <span className="text-cyber-accent">Eliminates 16.07% of all abstentions.</span></p>
              </div>
            )}
            {archVersion === 'V3' && (
              <div className="space-y-1">
                <div className="text-xs font-bold text-purple-400">V3 — Dempster-Shafer Evidence Fusion</div>
                <p className="text-[11px] text-gray-400">Intercepts ESCALATE_INVEST cases. Mathematically fuses three independent evidence sources (XGBoost ensemble probability, SVM decision, Isolation Forest score) using Dempster's combination rule. If conflict factor K &lt; 0.30, the case is auto-resolved. If K ≥ 0.30, it routes to human. <span className="text-purple-400">Automates 44.44% of escalations.</span></p>
              </div>
            )}
            {archVersion === 'V4' && (
              <div className="space-y-1">
                <div className="text-xs font-bold text-blue-400">V4 — SHAP Explainability + Full Autonomy</div>
                <p className="text-[11px] text-gray-400">All remaining unresolved cases collapse into a single PEND state. Local SHAP values are computed and attached as feature reason codes (e.g. "V14 +0.88, V17 −1.42"). This structured output bypasses human queues entirely — the explanation IS the decision audit trail. <span className="text-blue-400">Zero human review overhead.</span></p>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* Built for Payment Infrastructure */}
      <section className="max-w-5xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Built for Payment Infrastructure</h2>
          <p className="text-sm text-gray-400 max-w-xl mx-auto">
            MARI's decisions map directly to real payment operations layers — not just research outputs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              state: 'STEP_UP_AUTH',
              stateColor: 'text-decision-stepup border-decision-stepup/30 bg-decision-stepup/5',
              label: 'Triggers OTP / Biometric Challenge',
              desc: 'Medium-risk transactions get challenged with a second factor before proceeding. Customer friction is proportional to actual risk.',
              icon: Shield,
              iconColor: 'text-decision-stepup'
            },
            {
              state: 'ESCALATE_INVEST',
              stateColor: 'text-decision-escalate border-decision-escalate/30 bg-decision-escalate/5',
              label: 'Routes to Fraud Analyst Queue',
              desc: 'Every escalated transaction arrives pre-annotated with SHAP reason codes — analysts know exactly which features triggered the flag.',
              icon: AlertTriangle,
              iconColor: 'text-decision-escalate'
            },
            {
              state: 'ABSTAIN',
              stateColor: 'text-decision-abstain border-decision-abstain/30 bg-decision-abstain/5',
              label: 'Defers to Rule Engine',
              desc: 'The uncertainty score and novelty flag are passed in the API response payload, letting downstream rule engines make the final call.',
              icon: Clock,
              iconColor: 'text-decision-abstain'
            },
            {
              state: 'DECLINE',
              stateColor: 'text-decision-decline border-decision-decline/30 bg-decision-decline/5',
              label: 'Hard Block — Zero False Positives',
              desc: 'Auto-blocks only fire when both risk is high AND model uncertainty is low. This guarantees the ensemble is in consensus before blocking a legitimate user.',
              icon: AlertCircle,
              iconColor: 'text-decision-decline'
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="glass-card p-6 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border inline-block ${item.stateColor}`}>{item.state}</span>
                    <h4 className="text-sm font-bold text-white">{item.label}</h4>
                  </div>
                  <Icon size={20} className={`flex-shrink-0 ${item.iconColor}`} />
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Cost simulation callout */}
        <div className="glass-card p-6 border-yellow-500/20 bg-gradient-to-r from-yellow-950/20 to-cyber-card/40 flex items-start gap-4">
          <TrendingUp size={20} className="text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-white">Cost-Aware Routing</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Every API response includes <span className="font-mono text-yellow-400">expected_loss</span>, <span className="font-mono text-yellow-400">manual_review_cost</span>, and <span className="font-mono text-yellow-400">net_utility</span> — allowing the payment gateway to make financially-optimal decisions, not just probabilistic ones. A missed fraud event costs ~$1,000. A false block costs ~$50 in lost revenue and chargeback overhead.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
