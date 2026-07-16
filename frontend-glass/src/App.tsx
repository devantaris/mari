import React from 'react';
import { useStore, Page } from './store/useStore';
import { Showcase } from './pages/Showcase';
import { Workstation } from './pages/Workstation';
import { Progression } from './pages/Progression';
import { Methodology } from './pages/Methodology';
import { Profile } from './pages/Profile';
import { AnimatePresence, motion } from 'framer-motion';
import { Shield, Cpu, BookOpen, Clock, User } from 'lucide-react';

export const App: React.FC = () => {
  const { currentPage, setCurrentPage, apiStatus } = useStore();

  const renderPage = () => {
    switch (currentPage) {
      case 'showcase':
        return <Showcase key="showcase" />;
      case 'workstation':
        return <Workstation key="workstation" />;
      case 'progression':
        return <Progression key="progression" />;
      case 'methodology':
        return <Methodology key="methodology" />;
      case 'profile':
        return <Profile key="profile" />;
      default:
        return <Showcase key="showcase" />;
    }
  };

  const navItems = [
    { id: 'showcase', label: 'Showcase', icon: Shield },
    { id: 'workstation', label: 'Workstation', icon: Cpu },
    { id: 'progression', label: 'Progression', icon: Clock },
    { id: 'methodology', label: 'Methodology', icon: BookOpen },
    { id: 'profile', label: 'Author', icon: User }
  ];

  return (
    <div className="min-h-screen bg-cyber-bg text-gray-100 flex flex-col justify-between">
      {/* Background Cyber-glow aesthetics */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyber-accent/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-purple-900/5 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Floating Glass Pill Navigation Bar */}
      <header className="sticky top-0 z-50 py-4 px-6 max-w-6xl mx-auto w-full">
        <div className="glass-card px-6 py-3 flex flex-wrap justify-between items-center gap-4 bg-cyber-card/75 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          {/* Logo & Author */}
          <div className="flex items-center gap-2">
            <span className="font-mono font-black text-cyber-accent tracking-widest text-lg">MARI</span>
            <span className="text-gray-600 text-xs font-light">|</span>
            <span className="text-xs text-gray-400 font-medium capitalize">{currentPage}</span>
          </div>

          {/* Navigation Items */}
          <nav className="flex items-center gap-1.5 md:gap-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id as Page)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    isActive ? 'text-cyber-bg font-bold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {/* Glowing background for active tab */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-cyber-accent rounded-lg shadow-[0_0_12px_rgba(0,212,170,0.35)]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Icon size={14} />
                    <span className="hidden sm:inline">{item.label}</span>
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Health indicator */}
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase font-bold tracking-wider">
            <span className={`w-2 h-2 rounded-full ${
              apiStatus === 'connected' ? 'bg-decision-approve shadow-[0_0_8px_#00ffcc]' : 
              apiStatus === 'checking' ? 'bg-decision-stepup animate-pulse' : 
              'bg-decision-decline shadow-[0_0_8px_#ff0033]'
            }`}></span>
            <span className="text-gray-400 hidden xs:inline">
              {apiStatus === 'connected' ? 'API Active' : apiStatus === 'checking' ? 'Checking API' : 'Sandbox (Mock)'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Page Area with AnimatePresence */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-6 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="w-full"
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Simplified academic footer */}
      <footer className="py-6 border-t border-cyber-border/40 text-center text-[11px] font-mono text-gray-500">
        <div>
          MARI Framework · Developed by <a href="https://github.com/devantaris" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-cyber-accent">Devansh Kumar</a>
        </div>
        <div className="text-[10px] opacity-75 mt-1">
          Bennett University CSE · Under Review at IEEE Access (2026)
        </div>
      </footer>
    </div>
  );
};

export default App;
