import { useState, useEffect, useRef } from 'react';

const CURRENT_VERSION = 1;

export function useLocalStorage(key, defaultValue) {
  const savedRef = useRef(false);

  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof defaultValue === 'object' && defaultValue !== null && !Array.isArray(defaultValue)) {
          // Migrate: if no _v field, add it silently
          const merged = { ...defaultValue, ...parsed };
          if (merged._v === undefined) {
            merged._v = CURRENT_VERSION;
          }
          return merged;
        }
        return parsed;
      }
    } catch (e) {
      console.warn(`[useLocalStorage] Dados corrompidos na chave "${key}", usando valor padrão.`, e);
      localStorage.removeItem(key);
    }
    const initial = typeof defaultValue === 'function' ? defaultValue() : defaultValue;
    // Stamp version on new object values
    if (typeof initial === 'object' && initial !== null && !Array.isArray(initial)) {
      return { ...initial, _v: CURRENT_VERSION };
    }
    return initial;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
      savedRef.current = true;
    } catch (e) {
      savedRef.current = false;
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        console.warn(`[useLocalStorage] Cota de armazenamento excedida ao salvar "${key}".`);
      } else {
        console.warn(`[useLocalStorage] Erro ao salvar "${key}".`, e);
      }
    }
  }, [key, state]);

  return [state, setState, { saved: savedRef.current }];
}
