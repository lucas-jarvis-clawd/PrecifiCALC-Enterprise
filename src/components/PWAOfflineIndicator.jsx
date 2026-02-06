import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Cloud, CloudOff } from 'lucide-react';

/**
 * Offline/Online status indicator
 * Shows a subtle banner when offline, and a brief flash when coming back online
 */
export function PWAOfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOnlineFlash, setShowOnlineFlash] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        setShowOnlineFlash(true);
        setTimeout(() => setShowOnlineFlash(false), 3000);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  // Show "back online" flash
  if (showOnlineFlash) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[70] animate-slideDown">
        <div className="bg-emerald-500 text-white py-2 px-4 flex items-center justify-center gap-2 text-sm font-medium shadow-lg">
          <Cloud size={16} />
          <span>Conexão restaurada!</span>
        </div>
      </div>
    );
  }

  // Show offline indicator
  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[70]">
        <div className="bg-amber-500 text-white py-2 px-4 flex items-center justify-center gap-2 text-sm font-medium shadow-lg">
          <WifiOff size={16} />
          <span>Você está offline — os dados salvos continuam acessíveis</span>
        </div>
      </div>
    );
  }

  return null;
}

/**
 * Small dot indicator for sidebar/header
 */
export function OnlineStatusDot({ className = '' }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className={`flex items-center gap-1.5 ${className}`} title={isOnline ? 'Online' : 'Offline'}>
      <div className={`w-2 h-2 rounded-full ${
        isOnline 
          ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' 
          : 'bg-amber-400 shadow-sm shadow-amber-400/50 animate-pulse-soft'
      }`} />
      <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
        {isOnline ? 'Online' : 'Offline'}
      </span>
    </div>
  );
}
