/**
 * E2E Test: Precificação → Proposta Flow
 * Quality Master - Core Business Logic Testing
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import App from '../../App';
import { mockLocalStorage, waitForElement, simulateUserInput, clickElement } from './setup';

describe('🎯 Precificação → Proposta Flow E2E', () => {
  beforeEach(() => {
    // Start with onboarded user
    mockLocalStorage();
  });

  it('💰 should calculate price and create proposal', async () => {
    const { container } = render(<App />);
    
    // Wait for dashboard
    await waitForElement('[data-testid="dashboard"]');
    
    // Navigate to Precificação
    const precificacaoLink = await waitForElement('[data-testid="nav-precificacao"]');
    clickElement(precificacaoLink);
    
    // Wait for precificação page
    await waitForElement('[data-testid="precificacao"]');
    
    // Fill product/service details
    const nomeInput = await waitForElement('input[name="nomeProduto"]');
    simulateUserInput(nomeInput, 'Consultoria Empresarial');
    
    const custoInput = await waitForElement('input[name="custoProduto"]');
    simulateUserInput(custoInput, '500');
    
    const margemInput = await waitForElement('input[name="margemDesejada"]');
    simulateUserInput(margemInput, '30');
    
    const quantidadeInput = await waitForElement('input[name="quantidadeMensal"]');
    simulateUserInput(quantidadeInput, '10');
    
    // Select regime (should be pre-filled from profile)
    const regimeSelect = await waitForElement('select[name="regime"]');
    expect(regimeSelect.value).toBe('simples');
    
    // Calculate price
    const calcularBtn = await waitForElement('[data-testid="calcular-btn"]');
    clickElement(calcularBtn);
    
    // Wait for calculation results
    await waitForElement('[data-testid="resultado-precificacao"]');
    
    // Verify calculated values
    const precoFinal = await waitForElement('[data-testid="preco-final"]');
    expect(precoFinal.textContent).toMatch(/R\$\s*[\d,.]+/);
    
    const margemReal = await waitForElement('[data-testid="margem-real"]');
    expect(margemReal.textContent).toMatch(/\d+%/);
    
    // Use price in proposal
    const usarPropostaBtn = await waitForElement('[data-testid="usar-proposta-btn"]');
    clickElement(usarPropostaBtn);
    
    // Should navigate to propostas
    await waitForElement('[data-testid="propostas"]');
    
    // Verify data was transferred
    const itemProposta = await waitForElement('[data-testid="item-proposta"]');
    expect(itemProposta).toBeTruthy();
    
    // Check if product data was imported
    const produtoNome = await waitForElement('input[name="itemDescricao"]');
    expect(produtoNome.value).toBe('Consultoria Empresarial');
    
    // Fill client details
    const clienteInput = await waitForElement('input[name="clienteNome"]');
    simulateUserInput(clienteInput, 'Cliente Teste LTDA');
    
    const clienteCnpj = await waitForElement('input[name="clienteCnpj"]');
    simulateUserInput(clienteCnpj, '98.765.432/0001-10');
    
    // Generate proposal
    const gerarBtn = await waitForElement('[data-testid="gerar-proposta-btn"]');
    clickElement(gerarBtn);
    
    // Should show proposal preview
    await waitForElement('[data-testid="proposta-preview"]');
    
    // Verify proposal content
    const proposalContent = await waitForElement('[data-testid="proposta-content"]');
    expect(proposalContent.textContent).toContain('Consultoria Empresarial');
    expect(proposalContent.textContent).toContain('Cliente Teste LTDA');
    
    // Check localStorage persistence
    const propostaData = localStorage.getItem('precificalc_propostas');
    expect(propostaData).toBeTruthy();
    
    const propostas = JSON.parse(propostaData);
    expect(propostas).toHaveLength(1);
    expect(propostas[0].cliente.nome).toBe('Cliente Teste LTDA');
  });

  it('📊 should show tax breakdown in pricing', async () => {
    const { container } = render(<App />);
    
    await waitForElement('[data-testid="dashboard"]');
    
    // Navigate to precificação
    const navLink = await waitForElement('[data-testid="nav-precificacao"]');
    clickElement(navLink);
    
    await waitForElement('[data-testid="precificacao"]');
    
    // Fill minimal data
    const custoInput = await waitForElement('input[name="custoProduto"]');
    simulateUserInput(custoInput, '1000');
    
    const margemInput = await waitForElement('input[name="margemDesejada"]');
    simulateUserInput(margemInput, '25');
    
    // Calculate
    const calcBtn = await waitForElement('[data-testid="calcular-btn"]');
    clickElement(calcBtn);
    
    // Should show tax breakdown
    await waitForElement('[data-testid="breakdown-tributario"]');
    
    // Verify tax components
    const dasValue = await waitForElement('[data-testid="das-valor"]');
    expect(dasValue.textContent).toMatch(/R\$\s*[\d,.]+/);
    
    const aliquotaEfetiva = await waitForElement('[data-testid="aliquota-efetiva"]');
    expect(aliquotaEfetiva.textContent).toMatch(/\d+[.,]\d+%/);
    
    // Check visual composition
    const composicaoChart = await waitForElement('[data-testid="composicao-preco"]');
    expect(composicaoChart).toBeTruthy();
  });

  it('⚖️ should compare prices between tax regimes', async () => {
    const { container } = render(<App />);
    
    await waitForElement('[data-testid="dashboard"]');
    
    // Go to comparativo
    const comparativoLink = await waitForElement('[data-testid="nav-comparativo"]');
    clickElement(comparativoLink);
    
    await waitForElement('[data-testid="comparativo-regimes"]');
    
    // Fill comparison data
    const receitaInput = await waitForElement('input[name="receitaMensal"]');
    simulateUserInput(receitaInput, '50000');
    
    const custoInput = await waitForElement('input[name="custoMensal"]');
    simulateUserInput(custoInput, '20000');
    
    // Compare regimes
    const compararBtn = await waitForElement('[data-testid="comparar-btn"]');
    clickElement(compararBtn);
    
    // Wait for results
    await waitForElement('[data-testid="comparacao-resultados"]');
    
    // Should show all 4 regimes
    const regimeCards = container.querySelectorAll('[data-testid^="regime-card-"]');
    expect(regimeCards.length).toBe(4); // MEI, Simples, Presumido, Real
    
    // Should show recommended regime
    const recomendado = await waitForElement('[data-testid="regime-recomendado"]');
    expect(recomendado).toBeTruthy();
    
    // Should show economy comparison
    const economia = await waitForElement('[data-testid="economia-anual"]');
    expect(economia.textContent).toMatch(/R\$\s*[\d,.]+/);
  });

  it('💼 should handle service pricing (hourly rate)', async () => {
    const { container } = render(<App />);
    
    await waitForElement('[data-testid="dashboard"]');
    
    const precLink = await waitForElement('[data-testid="nav-precificacao"]');
    clickElement(precLink);
    
    await waitForElement('[data-testid="precificacao"]');
    
    // Switch to service mode
    const tipoSelect = await waitForElement('select[name="tipoProduto"]');
    simulateUserInput(tipoSelect, 'servico');
    
    // Should show hourly fields
    await waitForElement('[data-testid="campos-servico"]');
    
    const custoHoraInput = await waitForElement('input[name="custoHora"]');
    simulateUserInput(custoHoraInput, '100');
    
    const horasProjetoInput = await waitForElement('input[name="horasProjeto"]');
    simulateUserInput(horasProjetoInput, '40');
    
    const margemInput = await waitForElement('input[name="margemDesejada"]');
    simulateUserInput(margemInput, '35');
    
    // Calculate
    const calcBtn = await waitForElement('[data-testid="calcular-btn"]');
    clickElement(calcBtn);
    
    await waitForElement('[data-testid="resultado-precificacao"]');
    
    // Should show hourly and project totals
    const precoHora = await waitForElement('[data-testid="preco-hora"]');
    expect(precoHora.textContent).toMatch(/R\$\s*[\d,.]+/);
    
    const precoProjeto = await waitForElement('[data-testid="preco-projeto"]');
    expect(precoProjeto.textContent).toMatch(/R\$\s*[\d,.]+/);
  });

  it('🎯 should validate minimum viable price', async () => {
    const { container } = render(<App />);
    
    await waitForElement('[data-testid="dashboard"]');
    
    const precLink = await waitForElement('[data-testid="nav-precificacao"]');
    clickElement(precLink);
    
    await waitForElement('[data-testid="precificacao"]');
    
    // Set very low margin
    const custoInput = await waitForElement('input[name="custoProduto"]');
    simulateUserInput(custoInput, '1000');
    
    const margemInput = await waitForElement('input[name="margemDesejada"]');
    simulateUserInput(margemInput, '5'); // Very low margin
    
    const calcBtn = await waitForElement('[data-testid="calcular-btn"]');
    clickElement(calcBtn);
    
    await waitForElement('[data-testid="resultado-precificacao"]');
    
    // Should show warning about low margin
    const warningAlert = await waitForElement('[data-testid="margem-warning"]');
    expect(warningAlert.textContent).toContain('margem muito baixa');
    
    // Should suggest minimum viable price
    const precoMinimo = await waitForElement('[data-testid="preco-minimo-sugerido"]');
    expect(precoMinimo).toBeTruthy();
  });

  it('📱 should work on mobile devices', async () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', { value: 375 });
    
    const { container } = render(<App />);
    
    await waitForElement('[data-testid="dashboard"]');
    
    // Mobile navigation should be hamburger
    const hamburger = await waitForElement('[data-testid="mobile-menu-btn"]');
    expect(hamburger).toBeTruthy();
    
    clickElement(hamburger);
    
    // Mobile menu should open
    await waitForElement('[data-testid="mobile-nav"]');
    
    const precLink = await waitForElement('[data-testid="mobile-nav-precificacao"]');
    clickElement(precLink);
    
    await waitForElement('[data-testid="precificacao"]');
    
    // Mobile layout should stack vertically
    const container_prec = await waitForElement('[data-testid="precificacao-container"]');
    const computedStyle = window.getComputedStyle(container_prec);
    expect(computedStyle.flexDirection).toBe('column');
  });

  it('💾 should persist data between sessions', async () => {
    const { container, unmount } = render(<App />);
    
    await waitForElement('[data-testid="dashboard"]');
    
    const precLink = await waitForElement('[data-testid="nav-precificacao"]');
    clickElement(precLink);
    
    await waitForElement('[data-testid="precificacao"]');
    
    // Fill form
    const nomeInput = await waitForElement('input[name="nomeProduto"]');
    simulateUserInput(nomeInput, 'Produto Persistente');
    
    const custoInput = await waitForElement('input[name="custoProduto"]');
    simulateUserInput(custoInput, '750');
    
    // Data should be saved automatically
    expect(localStorage.getItem('precificalc_precificacao')).toBeTruthy();
    
    // Unmount and remount
    unmount();
    const { container: newContainer } = render(<App />);
    
    await waitForElement('[data-testid="dashboard"]');
    
    const newPrecLink = newContainer.querySelector('[data-testid="nav-precificacao"]');
    clickElement(newPrecLink);
    
    await waitForElement('[data-testid="precificacao"]');
    
    // Data should be restored
    const restoredNome = await waitForElement('input[name="nomeProduto"]');
    expect(restoredNome.value).toBe('Produto Persistente');
    
    const restoredCusto = await waitForElement('input[name="custoProduto"]');
    expect(restoredCusto.value).toBe('750');
  });
});