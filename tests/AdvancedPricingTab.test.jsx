import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdvancedPricingTab from '../src/components/AdvancedPricingTab';

// Mock dos módulos externos
vi.mock('../src/data/taxData', () => ({
  formatCurrency: (value) => `R$ ${value?.toFixed(2) || '0.00'}`,
  formatPercent: (value) => `${value?.toFixed(1) || '0.0'}%`
}));

describe('AdvancedPricingTab', () => {
  test('should render the advanced pricing tab', () => {
    render(<AdvancedPricingTab />);
    
    expect(screen.getByText('Precificação Avançada com NCM')).toBeInTheDocument();
    expect(screen.getByText('Cálculo tributário específico por classificação fiscal dos produtos')).toBeInTheDocument();
  });

  test('should have NCM input field', () => {
    render(<AdvancedPricingTab />);
    
    const ncmInput = screen.getByPlaceholderText('0000.00.00');
    expect(ncmInput).toBeInTheDocument();
    expect(ncmInput).toHaveAttribute('maxLength', '10');
  });

  test('should update NCM value when typing', async () => {
    render(<AdvancedPricingTab />);
    
    const ncmInput = screen.getByPlaceholderText('0000.00.00');
    
    fireEvent.change(ncmInput, { target: { value: '12345678' } });
    
    // Verificar se o valor foi formatado corretamente
    await waitFor(() => {
      expect(ncmInput.value).toBe('1234.56.78');
    });
  });

  test('should show different regime options', () => {
    render(<AdvancedPricingTab />);
    
    const regimeSelect = screen.getByDisplayValue('Simples Nacional');
    expect(regimeSelect).toBeInTheDocument();
    
    // Verificar se existem as opções de regime
    fireEvent.click(regimeSelect);
    
    expect(screen.getByText('MEI (até R$ 81 mil/ano)')).toBeInTheDocument();
    expect(screen.getByText('Lucro Presumido')).toBeInTheDocument();
    expect(screen.getByText('Lucro Real')).toBeInTheDocument();
  });

  test('should show calculation results when all fields are filled', async () => {
    render(<AdvancedPricingTab />);
    
    // Preencher campos obrigatórios
    fireEvent.change(screen.getByDisplayValue('100'), { target: { value: '50' } }); // custo
    fireEvent.change(screen.getByDisplayValue('5000'), { target: { value: '3000' } }); // despesas fixas
    fireEvent.change(screen.getByDisplayValue('100'), { target: { value: '200' } }); // quantidade
    fireEvent.change(screen.getByDisplayValue('30'), { target: { value: '25' } }); // margem
    
    await waitFor(() => {
      expect(screen.getByText('Preço de Venda')).toBeInTheDocument();
      expect(screen.getByText('Margem Real')).toBeInTheDocument();
      expect(screen.getByText('Lucro Líquido')).toBeInTheDocument();
    });
  });

  test('should persist data in localStorage', () => {
    const mockSetItem = vi.spyOn(Storage.prototype, 'setItem');
    
    render(<AdvancedPricingTab />);
    
    const ncmInput = screen.getByPlaceholderText('0000.00.00');
    fireEvent.change(ncmInput, { target: { value: '12345678' } });
    
    expect(mockSetItem).toHaveBeenCalledWith(
      'precificalc_precificacao_avancada',
      expect.stringContaining('"ncm":"12345678"')
    );
    
    mockSetItem.mockRestore();
  });
});