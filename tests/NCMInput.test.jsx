import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NCMInput from '../src/components/NCMInput';

describe('NCMInput', () => {
  test('should render NCM input field', () => {
    render(<NCMInput />);
    
    const input = screen.getByPlaceholderText('0000.00.00');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('font-mono');
  });

  test('should format NCM value correctly', async () => {
    const mockOnChange = vi.fn();
    render(<NCMInput value="12345678" onChange={mockOnChange} />);
    
    const input = screen.getByPlaceholderText('0000.00.00');
    
    expect(input.value).toBe('1234.56.78');
  });

  test('should validate NCM length', () => {
    render(<NCMInput value="123" />);
    
    expect(screen.getByText('NCM deve ter exatamente 8 dígitos')).toBeInTheDocument();
  });

  test('should validate NCM chapter range', () => {
    render(<NCMInput value="99123456" />);
    
    expect(screen.getByText('Capítulo NCM inválido (deve estar entre 01 e 97)')).toBeInTheDocument();
  });

  test('should show valid status for correct NCM', async () => {
    render(<NCMInput value="12345678" />);
    
    await waitFor(() => {
      const checkIcon = document.querySelector('.lucide-circle-check-big');
      expect(checkIcon).toBeInTheDocument();
    });
  });

  test('should limit input to 8 digits only', () => {
    const mockOnChange = vi.fn();
    render(<NCMInput onChange={mockOnChange} />);
    
    const input = screen.getByPlaceholderText('0000.00.00');
    
    // Primeiro, testar com 8 dígitos (deve funcionar)
    fireEvent.change(input, { target: { value: '12345678' } });
    expect(mockOnChange).toHaveBeenCalledWith('12345678');
    
    // Limpar o mock
    mockOnChange.mockClear();
    
    // Agora testar com 9 dígitos (não deve chamar onChange)
    fireEvent.change(input, { target: { value: '123456789' } });
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  test('should remove non-numeric characters', () => {
    const mockOnChange = vi.fn();
    render(<NCMInput onChange={mockOnChange} />);
    
    const input = screen.getByPlaceholderText('0000.00.00');
    
    fireEvent.change(input, { target: { value: 'abc1234def5678' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('12345678');
  });

  test('should show NCM information when valid', async () => {
    render(<NCMInput value="12345678" />);
    
    await waitFor(() => {
      // Usar getAllByText para lidar com múltiplas ocorrências
      const ncmTexts = screen.getAllByText(/NCM.*1234\.56\.78/);
      expect(ncmTexts.length).toBeGreaterThan(0);
      
      const produtoTexts = screen.getAllByText(/Produto classificado no NCM/);
      expect(produtoTexts.length).toBeGreaterThan(0);
    }, { timeout: 1000 });
  });

  test('should handle disabled state', () => {
    render(<NCMInput disabled />);
    
    const input = screen.getByPlaceholderText('0000.00.00');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('cursor-not-allowed');
  });

  test('should show required indicator when required', () => {
    render(<NCMInput required />);
    
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  test('should clear error when valid NCM is entered', async () => {
    const { rerender } = render(<NCMInput value="123" />);
    
    expect(screen.getByText('NCM deve ter exatamente 8 dígitos')).toBeInTheDocument();
    
    rerender(<NCMInput value="12345678" />);
    
    await waitFor(() => {
      expect(screen.queryByText('NCM deve ter exatamente 8 dígitos')).not.toBeInTheDocument();
    });
  });
});