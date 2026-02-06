import { useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

function formatThousands(num) {
  if (num === '' || num === undefined || num === null) return '';
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return '';
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function parseFormatted(str) {
  if (!str && str !== 0) return 0;
  const cleaned = String(str).replace(/\./g, '').replace(',', '.');
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

export default function InputField({
  label, value, onChange, type, prefix, suffix, help,
  min, max, step, placeholder, className = '',
  validate, errorMsg, successMsg, required,
}) {
  const isCurrency = prefix === 'R$';
  const [focused, setFocused] = useState(false);
  const [touched, setTouched] = useState(false);
  const inputRef = useRef(null);

  let displayValue = value;
  if (isCurrency && !focused && value !== '' && value !== undefined) {
    displayValue = formatThousands(value);
  }

  // Real-time validation
  const validationState = (() => {
    if (!touched) return null;
    if (required && (value === '' || value === undefined || value === null)) return 'error';
    if (validate && typeof validate === 'function') {
      const result = validate(value);
      if (result === true) return 'success';
      if (typeof result === 'string') return 'error';
    }
    if (min !== undefined && Number(value) < min) return 'error';
    if (max !== undefined && Number(value) > max) return 'error';
    if (touched && value !== '' && value !== undefined) return 'success';
    return null;
  })();

  const validationMessage = (() => {
    if (validationState === 'error') {
      if (errorMsg) return errorMsg;
      if (required && (value === '' || value === undefined)) return 'Campo obrigatório';
      if (validate && typeof validate === 'function') {
        const result = validate(value);
        if (typeof result === 'string') return result;
      }
      if (min !== undefined && Number(value) < min) return `Mínimo: ${prefix || ''}${min}`;
      if (max !== undefined && Number(value) > max) return `Máximo: ${prefix || ''}${max}`;
    }
    if (validationState === 'success' && successMsg) return successMsg;
    return null;
  })();

  const handleChange = (e) => {
    const raw = e.target.value;
    if (type === 'text') {
      onChange(raw);
    } else if (isCurrency) {
      const parsed = parseFormatted(raw);
      onChange(parsed);
    } else {
      onChange(parseFloat(raw) || 0);
    }
  };

  const borderColor = validationState === 'error'
    ? 'border-red-400 dark:border-red-600 focus:ring-red-500/20 focus:border-red-500'
    : validationState === 'success'
    ? 'border-emerald-400 dark:border-emerald-600 focus:ring-emerald-500/20 focus:border-emerald-500'
    : 'border-slate-300 dark:border-slate-600 focus:ring-brand-500/20 focus:border-brand-500';

  return (
    <div className={className}>
      {label && (
        <label className="flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
          {label}
          {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          ref={inputRef}
          type={isCurrency ? 'text' : (type || 'number')}
          inputMode={isCurrency ? 'decimal' : (type === 'text' ? 'text' : 'numeric')}
          value={displayValue}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); setTouched(true); }}
          min={!isCurrency ? min : undefined}
          max={!isCurrency ? max : undefined}
          step={!isCurrency ? step : undefined}
          placeholder={placeholder}
          className={`w-full rounded-lg border bg-white dark:bg-slate-800/50 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200
            placeholder:text-slate-400 dark:placeholder:text-slate-500
            focus:outline-none focus:ring-2 transition-colors
            ${borderColor}
            ${prefix ? 'pl-9' : ''} ${suffix ? 'pr-9' : ''}
            ${validationState === 'error' || validationState === 'success' ? 'pr-9' : ''}`}
        />
        {suffix && !validationState && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm pointer-events-none">
            {suffix}
          </span>
        )}
        {validationState === 'error' && (
          <AlertCircle size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400" />
        )}
        {validationState === 'success' && !suffix && (
          <CheckCircle size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400" />
        )}
      </div>
      {(help || validationMessage) && (
        <p className={`text-xs mt-1 transition-colors ${
          validationState === 'error' ? 'text-red-500' :
          validationState === 'success' && validationMessage ? 'text-emerald-500' :
          'text-slate-400 dark:text-slate-500'
        }`}>
          {validationMessage || help}
        </p>
      )}
    </div>
  );
}

export function SelectField({ label, value, onChange, options, help, className = '', required }) {
  return (
    <div className={className}>
      {label && (
        <label className="flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
          {label}
          {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800/50 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200
          focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors
          appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_8px_center] bg-no-repeat pr-8"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {help && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{help}</p>}
    </div>
  );
}
