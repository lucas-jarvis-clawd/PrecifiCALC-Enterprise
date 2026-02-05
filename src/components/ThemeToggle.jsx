import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle({ compact = false, className = '' }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  if (compact) {
    return (
      <button
        onClick={toggleTheme}
        className={`p-2 rounded-lg transition-colors ${
          isDark
            ? 'bg-slate-700 text-amber-400 hover:bg-slate-600'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        } ${className}`}
        aria-label={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
        title={isDark ? 'Modo claro' : 'Modo escuro'}
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${
        isDark
          ? 'bg-slate-700/50 text-amber-400 hover:bg-slate-600/50'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      } ${className}`}
      aria-label={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
    >
      <div className="relative w-10 h-5 bg-slate-300 dark:bg-slate-600 rounded-full transition-colors">
        <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-300 flex items-center justify-center ${
          isDark ? 'translate-x-5 bg-amber-400' : 'translate-x-0.5 bg-white'
        }`}>
          {isDark ? <Moon size={10} className="text-slate-900" /> : <Sun size={10} className="text-amber-500" />}
        </div>
      </div>
      <span className="text-xs font-medium hidden sm:inline">
        {isDark ? 'Escuro' : 'Claro'}
      </span>
    </button>
  );
}
