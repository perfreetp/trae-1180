import { create } from 'zustand';
import type { Stall, Merchant, Contract, FeeBill, Purchase, Complaint, Inspection } from '@/types';
import { initialData } from '@/data/mockData';

interface MarketState {
  stalls: Stall[];
  merchants: Merchant[];
  contracts: Contract[];
  feeBills: FeeBill[];
  purchases: Purchase[];
  complaints: Complaint[];
  inspections: Inspection[];

  addStall: (stall: Stall) => void;
  updateStall: (id: string, data: Partial<Stall>) => void;
  deleteStall: (id: string) => void;

  addMerchant: (merchant: Merchant) => void;
  updateMerchant: (id: string, data: Partial<Merchant>) => void;
  deleteMerchant: (id: string) => void;

  addContract: (contract: Contract) => void;
  updateContract: (id: string, data: Partial<Contract>) => void;
  deleteContract: (id: string) => void;

  addFeeBill: (bill: FeeBill) => void;
  updateFeeBill: (id: string, data: Partial<FeeBill>) => void;
  deleteFeeBill: (id: string) => void;

  addPurchase: (purchase: Purchase) => void;
  updatePurchase: (id: string, data: Partial<Purchase>) => void;
  deletePurchase: (id: string) => void;

  addComplaint: (complaint: Complaint) => void;
  updateComplaint: (id: string, data: Partial<Complaint>) => void;
  deleteComplaint: (id: string) => void;

  addInspection: (inspection: Inspection) => void;
  updateInspection: (id: string, data: Partial<Inspection>) => void;
  deleteInspection: (id: string) => void;
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

export const useMarketStore = create<MarketState>((set, get) => ({
  stalls: loadFromStorage('market_stalls', initialData.stalls),
  merchants: loadFromStorage('market_merchants', initialData.merchants),
  contracts: loadFromStorage('market_contracts', initialData.contracts),
  feeBills: loadFromStorage('market_feeBills', initialData.feeBills),
  purchases: loadFromStorage('market_purchases', initialData.purchases),
  complaints: loadFromStorage('market_complaints', initialData.complaints),
  inspections: loadFromStorage('market_inspections', initialData.inspections),

  addStall: (stall) => {
    const stalls = [...get().stalls, stall];
    saveToStorage('market_stalls', stalls);
    set({ stalls });
  },
  updateStall: (id, data) => {
    const stalls = get().stalls.map((s) => (s.id === id ? { ...s, ...data } : s));
    saveToStorage('market_stalls', stalls);
    set({ stalls });
  },
  deleteStall: (id) => {
    const stalls = get().stalls.filter((s) => s.id !== id);
    saveToStorage('market_stalls', stalls);
    set({ stalls });
  },

  addMerchant: (merchant) => {
    const merchants = [...get().merchants, merchant];
    saveToStorage('market_merchants', merchants);
    set({ merchants });
  },
  updateMerchant: (id, data) => {
    const merchants = get().merchants.map((m) => (m.id === id ? { ...m, ...data } : m));
    saveToStorage('market_merchants', merchants);
    set({ merchants });
  },
  deleteMerchant: (id) => {
    const merchants = get().merchants.filter((m) => m.id !== id);
    saveToStorage('market_merchants', merchants);
    set({ merchants });
  },

  addContract: (contract) => {
    const contracts = [...get().contracts, contract];
    saveToStorage('market_contracts', contracts);
    set({ contracts });
  },
  updateContract: (id, data) => {
    const contracts = get().contracts.map((c) => (c.id === id ? { ...c, ...data } : c));
    saveToStorage('market_contracts', contracts);
    set({ contracts });
  },
  deleteContract: (id) => {
    const contracts = get().contracts.filter((c) => c.id !== id);
    saveToStorage('market_contracts', contracts);
    set({ contracts });
  },

  addFeeBill: (bill) => {
    const feeBills = [...get().feeBills, bill];
    saveToStorage('market_feeBills', feeBills);
    set({ feeBills });
  },
  updateFeeBill: (id, data) => {
    const feeBills = get().feeBills.map((f) => (f.id === id ? { ...f, ...data } : f));
    saveToStorage('market_feeBills', feeBills);
    set({ feeBills });
  },
  deleteFeeBill: (id) => {
    const feeBills = get().feeBills.filter((f) => f.id !== id);
    saveToStorage('market_feeBills', feeBills);
    set({ feeBills });
  },

  addPurchase: (purchase) => {
    const purchases = [...get().purchases, purchase];
    saveToStorage('market_purchases', purchases);
    set({ purchases });
  },
  updatePurchase: (id, data) => {
    const purchases = get().purchases.map((p) => (p.id === id ? { ...p, ...data } : p));
    saveToStorage('market_purchases', purchases);
    set({ purchases });
  },
  deletePurchase: (id) => {
    const purchases = get().purchases.filter((p) => p.id !== id);
    saveToStorage('market_purchases', purchases);
    set({ purchases });
  },

  addComplaint: (complaint) => {
    const complaints = [...get().complaints, complaint];
    saveToStorage('market_complaints', complaints);
    set({ complaints });
  },
  updateComplaint: (id, data) => {
    const complaints = get().complaints.map((c) => (c.id === id ? { ...c, ...data } : c));
    saveToStorage('market_complaints', complaints);
    set({ complaints });
  },
  deleteComplaint: (id) => {
    const complaints = get().complaints.filter((c) => c.id !== id);
    saveToStorage('market_complaints', complaints);
    set({ complaints });
  },

  addInspection: (inspection) => {
    const inspections = [...get().inspections, inspection];
    saveToStorage('market_inspections', inspections);
    set({ inspections });
  },
  updateInspection: (id, data) => {
    const inspections = get().inspections.map((i) => (i.id === id ? { ...i, ...data } : i));
    saveToStorage('market_inspections', inspections);
    set({ inspections });
  },
  deleteInspection: (id) => {
    const inspections = get().inspections.filter((i) => i.id !== id);
    saveToStorage('market_inspections', inspections);
    set({ inspections });
  },
}));
