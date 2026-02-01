import { useState } from 'react';

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
}) {
  const isCurrency = prefix === 'R$';
  const isNumber = !type || type === 'number';
  const [focused, setFocused] = useState(false);

  let displayValue = value;
  if (isCurrency && !focused && value !== '' && value !== undefined) {
    displayValue = formatThousands(value);
  }

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

  return (
    <div className={className}>
      {label && <label className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>}
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          type={isCurrency ? 'text' : (type || 'number')}
          value={displayValue}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          min={!isCurrency ? min : undefined}
          max={!isCurrency ? max : undefined}
          step={!isCurrency ? step : undefined}
          placeholder={placeholder}
          className={`w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800
            placeholder:text-slate-400
            focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500
            ${prefix ? 'pl-9' : ''} ${suffix ? 'pr-9' : ''}`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      {help && <p className="text-xs text-slate-400 mt-1">{help}</p>}
    </div>
  );
}

export function SelectField({ label, value, onChange, options, help, className = '' }) {
  return (
    <div className={className}>
      {label && <label className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800
          focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {help && <p className="text-xs text-slate-400 mt-1">{help}</p>}
    </div>
  );
}
