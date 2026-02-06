import { useState, useEffect } from 'react';
import { Search, AlertTriangle, CheckCircle, Hash } from 'lucide-react';
import { LabelComTermoTecnico } from './TermoTecnico';
import InputField from './InputField';

/**
 * Componente especializado para entrada de NCM (8 dígitos)
 * Inclui validação em tempo real e busca de informações
 */
export function NCMInput({ value, onChange, className = '', disabled = false, required = false }) {
  const [isValid, setIsValid] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const [ncmInfo, setNcmInfo] = useState(null);

  // Validação do formato NCM (8 dígitos)
  const validateNCM = (ncm) => {
    const cleaned = ncm.replace(/\D/g, '');
    
    if (cleaned.length === 0) {
      setError('');
      setIsValid(false);
      return false;
    }
    
    if (cleaned.length !== 8) {
      setError('NCM deve ter exatamente 8 dígitos');
      setIsValid(false);
      return false;
    }

    // Validação básica de estrutura NCM
    const capitulo = cleaned.substring(0, 2);
    const posicao = cleaned.substring(2, 4);
    const subposicao = cleaned.substring(4, 6);
    const item = cleaned.substring(6, 8);

    if (parseInt(capitulo) < 1 || parseInt(capitulo) > 97) {
      setError('Capítulo NCM inválido (deve estar entre 01 e 97)');
      setIsValid(false);
      return false;
    }

    setError('');
    setIsValid(true);
    return true;
  };

  // Formatação do NCM (visual)
  const formatNCM = (ncm) => {
    const cleaned = ncm.replace(/\D/g, '');
    if (cleaned.length <= 8) {
      return cleaned.replace(/(\d{4})(\d{2})(\d{2})/, '$1.$2.$3');
    }
    return cleaned.substring(0, 8).replace(/(\d{4})(\d{2})(\d{2})/, '$1.$2.$3');
  };

  // Busca informações do NCM (placeholder para integração futura)
  const searchNCMInfo = async (ncm) => {
    setIsValidating(true);
    try {
      // TODO: Integrar com API de NCM quando disponível
      // Por enquanto, simula busca
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setNcmInfo({
        codigo: ncm,
        descricao: `Produto classificado no NCM ${formatNCM(ncm)}`,
        aliquotaIPI: 0,
        isMonofasico: false,
        observacoes: 'Aguardando integração com base de dados NCM'
      });
    } catch (err) {
      console.error('Erro ao buscar NCM:', err);
      setNcmInfo(null);
    } finally {
      setIsValidating(false);
    }
  };

  // Effect para validação e busca
  useEffect(() => {
    const cleaned = value?.replace(/\D/g, '') || '';
    
    if (validateNCM(cleaned) && cleaned.length === 8) {
      searchNCMInfo(cleaned);
    } else {
      setNcmInfo(null);
    }
  }, [value]);

  const handleChange = (e) => {
    const input = e.target.value;
    const cleaned = input.replace(/\D/g, '');
    
    if (cleaned.length <= 8) {
      onChange?.(cleaned);
    }
  };

  const displayValue = value ? formatNCM(value) : '';

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Input Field */}
      <div className="relative">
        <LabelComTermoTecnico 
          termo="ncm"
          textoExplicativo="Nomenclatura Comum do Mercosul - 8 dígitos"
          required={required}
        />
        
        <div className="relative">
          <input
            type="text"
            value={displayValue}
            onChange={handleChange}
            disabled={disabled}
            placeholder="0000.00.00"
            maxLength={10} // Inclui pontos da formatação
            className={`
              w-full px-4 py-2.5 pl-10 pr-12 rounded-lg border text-sm
              transition-all duration-200 font-mono
              ${disabled 
                ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:border-slate-700' 
                : error
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10 dark:border-red-600'
                  : isValid
                    ? 'border-green-300 focus:border-green-500 focus:ring-green-500/10 dark:border-green-600'
                    : 'border-slate-300 focus:border-brand-500 focus:ring-brand-500/10 dark:border-slate-600'
              }
              bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100
              focus:ring-4 outline-none
            `}
          />
          
          {/* Hash Icon */}
          <Hash 
            size={18} 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" 
          />
          
          {/* Status Icon */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isValidating ? (
              <div className="animate-spin w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full" />
            ) : isValid ? (
              <CheckCircle size={18} className="text-green-500" />
            ) : error ? (
              <AlertTriangle size={18} className="text-red-500" />
            ) : null}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-red-600 dark:text-red-400 text-xs mt-1 flex items-center gap-1">
            <AlertTriangle size={12} />
            {error}
          </p>
        )}
      </div>

      {/* NCM Information Card */}
      {ncmInfo && isValid && (
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
              NCM {formatNCM(ncmInfo.codigo)}
            </h4>
            {ncmInfo.isMonofasico && (
              <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 rounded-full">
                Monofásico
              </span>
            )}
          </div>
          
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
            {ncmInfo.descricao}
          </p>
          
          {ncmInfo.aliquotaIPI > 0 && (
            <p className="text-xs text-slate-700 dark:text-slate-300">
              <span className="font-medium">IPI:</span> {ncmInfo.aliquotaIPI}%
            </p>
          )}
          
          {ncmInfo.observacoes && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 italic">
              {ncmInfo.observacoes}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default NCMInput;