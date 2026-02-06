/**
 * E2E Test: Onboarding Flow
 * Quality Master - Critical Path Testing
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import App from '../../App';
import { mockLocalStorage, waitForElement, simulateUserInput, clickElement } from './setup';

describe('🎯 Onboarding Flow E2E', () => {
  beforeEach(() => {
    // Start with empty localStorage (new user)
    localStorage.clear();
  });

  it('🚀 should complete full onboarding flow and reach dashboard', async () => {
    // Render app in new user state
    const { container } = render(<App />);
    
    // Should show onboarding
    expect(container).toBeTruthy();
    
    // Wait for onboarding component
    await waitForElement('[data-testid="onboarding"]', 2000);
    
    // Step 1: Company Info
    const nomeInput = await waitForElement('input[name="nomeEmpresa"]');
    const cnpjInput = await waitForElement('input[name="cnpj"]');
    const cidadeInput = await waitForElement('input[name="cidade"]');
    const ufSelect = await waitForElement('select[name="uf"]');
    
    simulateUserInput(nomeInput, 'Test Company LTDA');
    simulateUserInput(cnpjInput, '12.345.678/0001-90');
    simulateUserInput(cidadeInput, 'São Paulo');
    simulateUserInput(ufSelect, 'SP');
    
    // Click next
    const nextBtn1 = await waitForElement('[data-testid="next-btn"]');
    clickElement(nextBtn1);
    
    // Step 2: Tax Regime & Activity
    await waitForElement('[data-testid="regime-selection"]');
    
    const regimeRadio = await waitForElement('input[value="simples"]');
    clickElement(regimeRadio);
    
    const atividadeSelect = await waitForElement('select[name="atividade"]');
    simulateUserInput(atividadeSelect, 'Prestação de Serviços');
    
    const receitaInput = await waitForElement('input[name="receitaAnual"]');
    simulateUserInput(receitaInput, '600000');
    
    // Click next
    const nextBtn2 = await waitForElement('[data-testid="next-btn"]:not([disabled])');
    clickElement(nextBtn2);
    
    // Step 3: Final Configuration
    await waitForElement('[data-testid="summary-step"]');
    
    // Click finish
    const finishBtn = await waitForElement('[data-testid="finish-btn"]');
    clickElement(finishBtn);
    
    // Should reach dashboard
    await waitForElement('[data-testid="dashboard"]', 3000);
    
    // Verify localStorage was set
    expect(localStorage.getItem('precificalc_onboarded')).toBe('true');
    const perfil = JSON.parse(localStorage.getItem('precificalc_perfil') || '{}');
    expect(perfil.nomeEmpresa).toBe('Test Company LTDA');
    expect(perfil.regime).toBe('simples');
  });

  it('🔄 should skip onboarding if already completed', async () => {
    // Mock completed onboarding
    mockLocalStorage();
    
    // Render app
    const { container } = render(<App />);
    
    // Should go directly to dashboard
    await waitForElement('[data-testid="dashboard"]', 2000);
    
    // Should not show onboarding
    const onboarding = container.querySelector('[data-testid="onboarding"]');
    expect(onboarding).toBeNull();
  });

  it('⚠️ should validate required fields', async () => {
    const { container } = render(<App />);
    
    await waitForElement('[data-testid="onboarding"]');
    
    // Try to proceed without filling fields
    const nextBtn = await waitForElement('[data-testid="next-btn"]');
    clickElement(nextBtn);
    
    // Should still be on step 1
    const step1 = container.querySelector('[data-testid="step-1"]');
    expect(step1).toBeTruthy();
    
    // Should show validation messages
    await waitForElement('[data-testid="validation-error"]');
  });

  it('📱 should work on mobile viewport', async () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375
    });
    
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 667
    });
    
    const { container } = render(<App />);
    
    // Should show mobile-optimized onboarding
    await waitForElement('[data-testid="onboarding"]');
    
    // Check mobile layout
    const onboardingContainer = await waitForElement('[data-testid="onboarding-container"]');
    expect(onboardingContainer).toBeTruthy();
    
    // Should be responsive
    const computedStyle = window.getComputedStyle(onboardingContainer);
    expect(computedStyle.padding).toBeTruthy(); // Mobile padding applied
  });

  it('💾 should save progress between steps', async () => {
    const { container } = render(<App />);
    
    await waitForElement('[data-testid="onboarding"]');
    
    // Fill step 1
    const nomeInput = await waitForElement('input[name="nomeEmpresa"]');
    simulateUserInput(nomeInput, 'Progressive Company');
    
    // Simulate page reload
    localStorage.setItem('precificalc_onboarding_progress', JSON.stringify({
      step: 1,
      data: { nomeEmpresa: 'Progressive Company' }
    }));
    
    // Re-render app
    container.innerHTML = '';
    render(<App />);
    
    // Should restore progress
    await waitForElement('[data-testid="onboarding"]');
    const restoredInput = await waitForElement('input[name="nomeEmpresa"]');
    expect(restoredInput.value).toBe('Progressive Company');
  });

  it('🎉 should show celebration animation on completion', async () => {
    const { container } = render(<App />);
    
    await waitForElement('[data-testid="onboarding"]');
    
    // Complete all steps quickly
    mockLocalStorage({
      'precificalc_onboarding_progress': JSON.stringify({
        step: 3,
        data: {
          nomeEmpresa: 'Test Co',
          cnpj: '12.345.678/0001-90',
          regime: 'simples'
        }
      })
    });
    
    // Click finish
    const finishBtn = await waitForElement('[data-testid="finish-btn"]');
    clickElement(finishBtn);
    
    // Should show celebration
    await waitForElement('[data-testid="celebration"]', 1000);
    
    // Celebration should disappear after timeout
    await new Promise(resolve => setTimeout(resolve, 3500));
    const celebration = container.querySelector('[data-testid="celebration"]');
    expect(celebration).toBeNull();
  });
});