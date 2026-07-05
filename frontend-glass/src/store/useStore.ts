import { create } from 'zustand';

export type Page = 'showcase' | 'workstation' | 'progression' | 'methodology' | 'profile';
export type Version = 'V1' | 'V2' | 'V3' | 'V4';

export interface HistoryItem {
  id: string;
  timestamp: string;
  amount: number;
  risk: number;
  uncertainty: number;
  version: Version;
  finalBucket: string;
  features: number[];
  novelty: number;
  diagnostic: Record<string, any>;
}

interface State {
  currentPage: Page;
  activeVersion: Version;
  currentTxn: {
    features: number[] | null;
    amount: number | null;
    time: number | null;
    decision: string | null;
    risk: number | null;
    uncertainty: number | null;
    novelty: number | null;
    diagnostic: Record<string, any> | null;
  };
  history: HistoryItem[];
  apiStatus: 'disconnected' | 'connected' | 'checking';
  
  setCurrentPage: (page: Page) => void;
  setActiveVersion: (version: Version) => void;
  setApiStatus: (status: 'disconnected' | 'connected' | 'checking') => void;
  setCurrentTxn: (txn: any) => void;
  addHistoryItem: (item: HistoryItem) => void;
  clearHistory: () => void;
}

export const useStore = create<State>((set) => ({
  currentPage: 'showcase',
  activeVersion: 'V4',
  currentTxn: {
    features: null,
    amount: null,
    time: null,
    decision: null,
    risk: null,
    uncertainty: null,
    novelty: null,
    diagnostic: null,
  },
  history: [],
  apiStatus: 'checking',

  setCurrentPage: (page) => set({ currentPage: page }),
  setActiveVersion: (version) => set({ activeVersion: version }),
  setApiStatus: (status) => set({ apiStatus: status }),
  setCurrentTxn: (txn) => set({ currentTxn: txn }),
  addHistoryItem: (item) => set((state) => ({ history: [item, ...state.history] })),
  clearHistory: () => set({ history: [] }),
}));
