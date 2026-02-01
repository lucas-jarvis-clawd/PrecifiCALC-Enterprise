export default function InputField({
  label,
  value,
  onChange,
  type = 'number',
  prefix,
  suffix,
  help,
  min,
  max,
  step,
  placeholder,
  className = '',
  disabled = false,
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-surface-300">{label}</label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-surface-500 text-sm pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => {
            const val = type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
            onChange(val);
          }}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full bg-surface-900 border border-surface-600 rounded-md px-3 py-2 text-sm text-surface-100
            placeholder-surface-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30
            transition-colors disabled:opacity-50 disabled:cursor-not-allowed
            ${prefix ? 'pl-10' : ''} ${suffix ? 'pr-12' : ''}`}
        />
        {suffix && (
          <span className="absolute right-3 text-surface-500 text-sm pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      {help && <p className="text-xs text-surface-500">{help}</p>}
    </div>
  );
}

export function SelectField({ label, value, onChange, options, help, className = '' }) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-surface-300">{label}</label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-surface-900 border border-surface-600 rounded-md px-3 py-2 text-sm text-surface-100
          focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30
          transition-colors cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {help && <p className="text-xs text-surface-500">{help}</p>}
    </div>
  );
}
