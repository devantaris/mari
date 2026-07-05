import React from 'react';
import { ArrowRight, Layers, ShieldCheck, UserCheck, BarChart3, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';

export const Showcase: React.FC = () => {
  const { setCurrentPage } = useStore();

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
              contrib: 'Clears 47% of Abstentions',
              metric: '26 transactions cleared'
            },
            {
              v: 'V3',
              title: 'Dempster-Shafer Fusion',
              desc: 'Intercepts ESCALATE cases. Combines ensemble probabilities, SVM decisions, and Isolation Forest scores to resolve conflicts mathematically.',
              contrib: '74% of Escalations automated',
              metric: 'K < 0.25 → Human'
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
    </div>
  );
};
