import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ProgressContext = createContext();

const MODULE_WEIGHTS = {
  onboarding: { weight: 10, label: 'Cadastro da empresa' },
  simulador: { weight: 15, label: 'Simulador Tributário' },
  custos: { weight: 20, label: 'Custos Operacionais' },
  precificacao: { weight: 20, label: 'Precificação' },
  comparativo: { weight: 10, label: 'Comparativo de Regimes' },
  dre: { weight: 10, label: 'DRE' },
  equilibrio: { weight: 10, label: 'Ponto de Equilíbrio' },
  enquadramento: { weight: 5, label: 'Enquadramento' },
};

const LS_KEY = 'precificalc_progress';

export function ProgressProvider({ children }) {
  const [completedModules, setCompletedModules] = useState(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    // Auto-detect completed modules from localStorage data
    const detected = [];
    if (localStorage.getItem('precificalc_onboarded') === 'true') detected.push('onboarding');
    if (localStorage.getItem('precificalc_simulador')) detected.push('simulador');
    if (localStorage.getItem('precificalc_custos')) detected.push('custos');
    if (localStorage.getItem('precificalc_precificacao')) detected.push('precificacao');
    if (localStorage.getItem('precificalc_comparativo')) detected.push('comparativo');
    if (localStorage.getItem('precificalc_dre')) detected.push('dre');
    if (localStorage.getItem('precificalc_equilibrio')) detected.push('equilibrio');
    if (localStorage.getItem('precificalc_enquadramento')) detected.push('enquadramento');
    
    setCompletedModules(prev => {
      const merged = [...new Set([...prev, ...detected])];
      return merged;
    });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(completedModules));
    } catch { /* ignore */ }
  }, [completedModules]);

  const markComplete = useCallback((moduleId) => {
    setCompletedModules(prev => {
      if (prev.includes(moduleId)) return prev;
      return [...prev, moduleId];
    });
  }, []);

  const totalWeight = Object.values(MODULE_WEIGHTS).reduce((acc, m) => acc + m.weight, 0);
  const completedWeight = completedModules.reduce((acc, id) => {
    return acc + (MODULE_WEIGHTS[id]?.weight || 0);
  }, 0);
  const progressPercent = Math.round((completedWeight / totalWeight) * 100);

  const nextStep = Object.entries(MODULE_WEIGHTS).find(([id]) => !completedModules.includes(id));

  return (
    <ProgressContext.Provider value={{
      completedModules,
      markComplete,
      progressPercent,
      moduleWeights: MODULE_WEIGHTS,
      nextStep: nextStep ? { id: nextStep[0], ...nextStep[1] } : null,
    }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}
