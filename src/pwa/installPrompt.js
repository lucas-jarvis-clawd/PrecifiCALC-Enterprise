/**
 * PWA Install Prompt Manager
 * Captures the beforeinstallprompt event and provides install functionality
 */

let deferredPrompt = null;
let installCallbacks = [];

// Capture the install prompt event early
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log('[PWA] Install prompt captured');
  
  // Notify all listeners
  installCallbacks.forEach(cb => cb(true));
});

// Track when app is installed
window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
  console.log('[PWA] App installed! 🎉');
  
  // Clear listeners
  installCallbacks.forEach(cb => cb(false));
  
  // Track installation
  try {
    localStorage.setItem('precificalc_installed', 'true');
    localStorage.setItem('precificalc_installed_at', new Date().toISOString());
  } catch {}
});

/**
 * Subscribe to install prompt availability changes
 */
export function onInstallAvailable(callback) {
  installCallbacks.push(callback);
  // Immediately notify if prompt already captured
  if (deferredPrompt) {
    callback(true);
  }
  return () => {
    installCallbacks = installCallbacks.filter(cb => cb !== callback);
  };
}

/**
 * Check if install is available
 */
export function canInstall() {
  return deferredPrompt !== null;
}

/**
 * Trigger the install prompt
 */
export async function promptInstall() {
  if (!deferredPrompt) {
    console.log('[PWA] No install prompt available');
    return { outcome: 'unavailable' };
  }

  try {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA] Install prompt result: ${outcome}`);
    
    if (outcome === 'accepted') {
      deferredPrompt = null;
    }
    
    return { outcome };
  } catch (error) {
    console.error('[PWA] Install prompt error:', error);
    return { outcome: 'error', error };
  }
}

/**
 * Check if already installed
 */
export function isInstalled() {
  return (
    localStorage.getItem('precificalc_installed') === 'true' ||
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

/**
 * Get install info for iOS (doesn't support beforeinstallprompt)
 */
export function getIOSInstallInfo() {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isInStandaloneMode = window.navigator.standalone === true;
  
  return {
    isIOS,
    isInStandaloneMode,
    canShowPrompt: isIOS && !isInStandaloneMode,
  };
}
