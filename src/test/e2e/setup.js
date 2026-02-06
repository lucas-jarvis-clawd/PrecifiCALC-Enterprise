/**
 * End-to-End Test Setup - PrecifiCALC Masterpiece
 * Quality Master - Testing Infrastructure
 */

import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';

// Test environment setup
beforeAll(async () => {
  console.log('🧪 E2E Test Suite Starting - Quality Master');
  
  // Clear localStorage before all tests
  localStorage.clear();
  
  // Set up test environment
  global.testStartTime = Date.now();
  
  // Mock browser APIs if needed
  global.navigator = {
    ...global.navigator,
    userAgent: 'Test Environment',
    share: vi.fn().mockResolvedValue(true)
  };
  
  // Mock PWA APIs
  global.BeforeInstallPromptEvent = class {
    constructor() {
      this.prompt = vi.fn();
      this.userChoice = Promise.resolve({ outcome: 'accepted' });
    }
  };
});

afterAll(() => {
  const duration = Date.now() - global.testStartTime;
  console.log(`✅ E2E Test Suite Completed in ${duration}ms`);
  
  // Clean up
  localStorage.clear();
});

beforeEach(() => {
  // Reset localStorage before each test
  localStorage.clear();
  
  // Reset DOM
  document.body.innerHTML = '<div id="root"></div>';
  
  // Reset any global state
  window.history.replaceState({}, '', '/');
});

afterEach(() => {
  // Clean up after each test
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = '';
  }
  
  // Clear any timers
  vi.clearAllTimers();
});

// Test utilities
export const createMockEmpresa = () => ({
  nomeEmpresa: 'Test Empresa LTDA',
  cnpj: '12.345.678/0001-90',
  regime: 'simples',
  atividade: 'Prestação de Serviços',
  cidade: 'São Paulo',
  uf: 'SP',
  receitaAnual: 600000,
  funcionarios: 5,
  onboardingCompleted: true
});

export const mockLocalStorage = (data = {}) => {
  const defaults = {
    'precificalc_onboarded': 'true',
    'precificalc_perfil': JSON.stringify(createMockEmpresa())
  };
  
  Object.entries({ ...defaults, ...data }).forEach(([key, value]) => {
    localStorage.setItem(key, value);
  });
};

export const waitForElement = (selector, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkElement = () => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
      } else if (Date.now() - startTime > timeout) {
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
      } else {
        setTimeout(checkElement, 100);
      }
    };
    
    checkElement();
  });
};

export const simulateUserInput = (element, value) => {
  const event = new Event('input', { bubbles: true });
  element.value = value;
  element.dispatchEvent(event);
};

export const clickElement = (element) => {
  const event = new MouseEvent('click', { bubbles: true });
  element.dispatchEvent(event);
};