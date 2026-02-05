import { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

export default function Tooltip({ content, children, icon = true, className = '' }) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState('top');
  const tipRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (visible && tipRef.current && triggerRef.current) {
      const rect = tipRef.current.getBoundingClientRect();
      if (rect.top < 10) setPosition('bottom');
      else if (rect.bottom > window.innerHeight - 10) setPosition('top');
    }
  }, [visible]);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  };

  return (
    <span
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onTouchStart={() => setVisible(!visible)}
      ref={triggerRef}
    >
      {children || (icon && <HelpCircle size={14} className="text-slate-400 dark:text-slate-500 cursor-help hover:text-brand-500 transition-colors" />)}
      {visible && (
        <span
          ref={tipRef}
          className={`absolute z-50 ${positionClasses[position]} px-3 py-2 text-xs text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-w-[250px] w-max animate-fadeIn pointer-events-none`}
          role="tooltip"
        >
          {content}
        </span>
      )}
    </span>
  );
}

export function InfoTip({ text, className = '' }) {
  return (
    <Tooltip content={text} className={className}>
      <HelpCircle size={13} className="text-slate-400 dark:text-slate-500 cursor-help hover:text-brand-500 transition-colors ml-1" />
    </Tooltip>
  );
}
