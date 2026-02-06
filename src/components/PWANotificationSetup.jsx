import { useState, useEffect } from 'react';
import { Bell, BellOff, BellRing, X, Calendar, AlertTriangle, Check } from 'lucide-react';
import { 
  requestNotificationPermission, 
  getNotificationPermission, 
  isNotificationSupported,
  checkTaxDeadlines,
  getUpcomingDeadlines,
  sendNotification
} from '../pwa/notifications';

/**
 * Notification setup prompt - appears after user interacts with the app
 */
export function NotificationSetupBanner() {
  const [show, setShow] = useState(false);
  const [permission, setPermission] = useState(getNotificationPermission());

  useEffect(() => {
    if (!isNotificationSupported()) return;
    if (permission !== 'default') return;

    // Don't show if dismissed recently
    const dismissedAt = localStorage.getItem('precificalc_notif_dismissed');
    if (dismissedAt && Date.now() - Number(dismissedAt) < 7 * 24 * 60 * 60 * 1000) {
      return;
    }

    // Show after 60 seconds of usage
    const timer = setTimeout(() => setShow(true), 60000);
    return () => clearTimeout(timer);
  }, [permission]);

  const handleEnable = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);

    if (result === 'granted') {
      // Send welcome notification
      sendNotification('🎉 Notificações ativadas!', {
        body: 'Você receberá lembretes de prazos tributários.',
        tag: 'welcome',
      });
      // Check deadlines immediately
      checkTaxDeadlines(5);
    }

    setShow(false);
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('precificalc_notif_dismissed', String(Date.now()));
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-slideUp md:left-auto md:right-6 md:max-w-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <BellRing size={20} className="text-amber-600 dark:text-amber-400" />
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Ativar lembretes fiscais?
              </h3>
              <button
                onClick={handleDismiss}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Receba alertas de prazos tributários: DAS, FGTS, ISS, PIS/COFINS e mais.
              Nunca perca um vencimento!
            </p>

            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handleEnable}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-amber-500/25 active:scale-95"
              >
                <Bell size={14} />
                Ativar lembretes
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-700 rounded-xl transition-colors"
              >
                Agora não
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Notification toggle for settings page
 */
export function NotificationToggle() {
  const [permission, setPermission] = useState(getNotificationPermission());
  const [deadlines, setDeadlines] = useState([]);
  const supported = isNotificationSupported();

  useEffect(() => {
    if (permission === 'granted') {
      setDeadlines(getUpcomingDeadlines(14));
    }
  }, [permission]);

  const handleToggle = async () => {
    if (permission === 'granted') {
      // Can't revoke — tell user to use browser settings
      return;
    }
    
    const result = await requestNotificationPermission();
    setPermission(result);
    
    if (result === 'granted') {
      checkTaxDeadlines(5);
      setDeadlines(getUpcomingDeadlines(14));
    }
  };

  if (!supported) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm text-slate-500">
        <BellOff size={18} />
        <span>Notificações não suportadas neste navegador</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          {permission === 'granted' ? (
            <Bell size={18} className="text-emerald-500" />
          ) : permission === 'denied' ? (
            <BellOff size={18} className="text-red-500" />
          ) : (
            <Bell size={18} className="text-slate-400" />
          )}
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Lembretes tributários
            </p>
            <p className="text-xs text-slate-500">
              {permission === 'granted' 
                ? 'Ativado — você receberá alertas de prazos'
                : permission === 'denied'
                ? 'Bloqueado — ative nas configurações do navegador'
                : 'Receba alertas antes dos vencimentos'}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggle}
          disabled={permission === 'denied'}
          className={`relative w-11 h-6 rounded-full transition-all ${
            permission === 'granted' 
              ? 'bg-emerald-500' 
              : permission === 'denied'
              ? 'bg-red-200 dark:bg-red-900/30 cursor-not-allowed'
              : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400'
          }`}
        >
          <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
            permission === 'granted' ? 'translate-x-[22px]' : 'translate-x-0.5'
          }`} />
        </button>
      </div>

      {/* Upcoming deadlines preview */}
      {permission === 'granted' && deadlines.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
            Próximos vencimentos
          </p>
          {deadlines.slice(0, 5).map((d, i) => (
            <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg text-xs ${
              d.urgency === 'critical' ? 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30' :
              d.urgency === 'warning' ? 'bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30' :
              'bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                d.urgency === 'critical' ? 'bg-red-500' :
                d.urgency === 'warning' ? 'bg-amber-500' : 'bg-slate-400'
              }`} />
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-slate-700 dark:text-slate-200">{d.name}</span>
                <span className="text-slate-400 mx-1">·</span>
                <span className="text-slate-500 dark:text-slate-400">
                  {d.daysUntil === 0 ? 'Hoje' : d.daysUntil === 1 ? 'Amanhã' : `${d.daysUntil} dias`}
                </span>
              </div>
              {d.urgency === 'critical' && (
                <AlertTriangle size={13} className="text-red-500 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
