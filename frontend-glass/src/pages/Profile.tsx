import React from 'react';
import { User, Award, Calendar, FileText, Code2, Link as LinkIcon, BookOpen } from 'lucide-react';

export const Profile: React.FC = () => {
  const bibtex = `@article{kumar2026knowing,
  title={Knowing When Not to Decide: A Two-Dimensional Uncertainty Framework for Credit Card Fraud Detection},
  author={Kumar, Devansh},
  journal={IEEE Access},
  year={2026},
  note={Under Review}
}`;

  return (
    <div className="space-y-12 pb-20 animate-fade-in">
      {/* Profile Overview */}
      <section className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
        <div className="glass-card p-6 flex flex-col items-center text-center space-y-4 md:col-span-1">
          <div className="w-24 h-24 rounded-full bg-cyber-border flex items-center justify-center text-cyber-accent border-2 border-cyber-accent/50 shadow-[0_0_15px_rgba(0,212,170,0.2)]">
            <User size={48} />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">Devansh Kumar</h3>
            <p className="text-xs text-cyber-accent font-mono">devantaris</p>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed font-sans">
            Independent Machine Learning Systems Researcher specializing in uncertainty quantification, decision theory, and cost-optimal classification frameworks.
          </p>
          <div className="pt-4 border-t border-cyber-border w-full space-y-2 text-xs text-left">
            <div className="flex items-center gap-2 text-gray-400">
              <Award size={14} className="text-cyber-accent" />
              <span>B.Tech CSE, Bennett University</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Award size={14} className="text-cyber-accent" />
              <span>IEEE Student Member</span>
            </div>
          </div>
        </div>

        {/* Paper details */}
        <div className="glass-card p-8 md:col-span-2 space-y-6">
          <div className="space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-cyber-accent">Target Publication Venue</div>
            <h3 className="text-2xl font-bold text-white leading-tight">IEEE Access</h3>
            <p className="text-xs text-gray-500 font-mono">Status: Under Review (2026)</p>
          </div>
          
          <div className="space-y-4 text-xs text-gray-300 leading-relaxed">
            <p>
              The research introduces a paradigm shift in financial transaction classification: shifting from a unidimensional risk-based binary output to an adaptive two-dimensional risk-uncertainty space. By introducing selective classification, the system can autonomously defer decisions on transactions it cannot confidently resolve.
            </p>
            <p>
              By wrapping these deferred transactions into cascading SVM, Dempster-Shafer, and SHAP explainability layers, the framework systematically eliminates manual queues without introducing false auto-blocks on legitimate users.
            </p>
          </div>

          <div className="pt-4 flex flex-wrap gap-4">
            <a
              href="https://github.com/devantaris/mari"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-cyber-border hover:bg-cyber-border/80 border border-cyber-border text-xs rounded font-mono text-white flex items-center gap-1.5 transition-colors"
            >
              <Code2 size={14} /> Repository Source
            </a>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="px-4 py-2 border border-cyber-border hover:border-gray-600 text-xs rounded font-mono text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <FileText size={14} /> Download PDF Draft
            </a>
          </div>
        </div>
      </section>

      {/* Research Chronology */}
      <section className="max-w-5xl mx-auto space-y-8">
        <h3 className="text-2xl font-bold text-white text-center">Research & Development Chronology</h3>
        
        <div className="relative pl-6 border-l border-cyber-border space-y-8">
          {[
            {
              phase: 'Phase 0 — Data Cleaning & Exploratory Analysis',
              date: 'Q3 2025',
              desc: 'Conducted log-transformations on transaction amount distributions. Addressed heavy class imbalance (0.17% fraud rate) and isolated PCA feature spaces.',
              icon: Calendar
            },
            {
              phase: 'Phase 1 — Calibrated Baseline Classification',
              date: 'Q4 2025',
              desc: 'Trained standard Logistic Regression and XGBoost classifiers. Implemented Isotonic Calibration to reduce Brier score mismatch by 74.4%.',
              icon: Award
            },
            {
              phase: 'Phase 2 — Uncertainty Estimation & Abstention Engine (V1)',
              date: 'Q1 2026',
              desc: 'Engineered a 5-member XGBoost Bootstrap Ensemble. Extracted standard deviation as a proxy for epistemic uncertainty. Established the 2D plane and isolated 6 operational zones.',
              icon: BookOpen
            },
            {
              phase: 'Phase 3 & 4 — Layered Resolution & Outlier Defense (V2 & V3)',
              date: 'Q2 2026',
              desc: 'Integrated a calibrated SVM neighborhood clearing layer (V2) to clear Abstentions. Fused ensemble, SVM, and Isolation Forest novelties using Dempster-Shafer rule (V3) to clear Escalations.',
              icon: Code2
            },
            {
              phase: 'Phase 5 — Full Autonomy & Local Explanations (V4)',
              date: 'Q3 2026',
              desc: 'Unified remaining unresolved states into a terminal PEND bucket. Integrated local SHAP value generation for autonomous explanation reason codes, achieving zero human overhead.',
              icon: LinkIcon
            }
          ].map((item, idx) => (
            <div key={idx} className="relative space-y-2">
              {/* Circle indicator */}
              <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-cyber-accent border border-cyber-bg shadow-[0_0_8px_#00d4aa]"></div>
              
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-xs font-mono font-bold text-cyber-accent">{item.date}</span>
                <h4 className="text-sm font-semibold text-white">{item.phase}</h4>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed font-sans max-w-3xl">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* BibTeX citation block */}
      <section className="max-w-5xl mx-auto glass-card p-6 space-y-4">
        <div className="flex items-center gap-2 text-white text-sm font-semibold">
          <BookOpen size={16} />
          <span>IEEE BibTeX Citation</span>
        </div>
        <pre className="p-4 bg-cyber-bg border border-cyber-border rounded font-mono text-[11px] text-gray-300 overflow-x-auto select-all whitespace-pre">
          {bibtex}
        </pre>
      </section>
    </div>
  );
};
