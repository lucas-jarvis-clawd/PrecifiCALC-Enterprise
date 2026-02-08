import { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

export default function SaveIndicator({ visible }) {
  const [show, setShow] = useState(false);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    if (!visible) return;

    setShow(true);
    setFade(true);

    const fadeTimer = setTimeout(() => setFade(false), 2000);
    const hideTimer = setTimeout(() => setShow(false), 2300);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [visible]);

  if (!show) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-1.5 px-3 py-1.5
        bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400
        border border-emerald-200 dark:border-emerald-800 rounded-full text-xs font-medium
        transition-opacity duration-300 ${fade ? 'opacity-100' : 'opacity-0'}`}
    >
      <CheckCircle size={14} />
      Salvo
    </div>
  );
}
