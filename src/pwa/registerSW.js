/**
 * PWA Service Worker Registration & Update Management
 * PrecifiCALC Enterprise
 */

let swRegistration = null;
let updateCallback = null;
let offlineCallback = null;

/**
 * Register the service worker and handle updates
 */
export async function registerServiceWorker({ onUpdate, onOffline, onOnline } = {}) {
  if (!('serviceWorker' in navigator)) {
    console.log('[PWA] Service Workers not supported');
    return null;
  }

  updateCallback = onUpdate;
  offlineCallback = onOffline;

  // Listen for online/offline events
  window.addEventListener('online', () => {
    console.log('[PWA] Back online');
    onOnline?.();
  });

  window.addEventListener('offline', () => {
    console.log('[PWA] Gone offline');
    onOffline?.();
  });

  try {
    // The actual registration is handled by vite-plugin-pwa
    // We just set up the update detection
    const { registerSW } = await import('virtual:pwa-register');

    const updateSW = registerSW({
      immediate: false,
      onRegisteredSW(swUrl, registration) {
        swRegistration = registration;
        console.log('[PWA] Service Worker registered:', swUrl);
        
        // Check for updates periodically (every 60 minutes)
        if (registration) {
          setInterval(() => {
            registration.update();
            console.log('[PWA] Checking for updates...');
          }, 60 * 60 * 1000);
        }
      },
      onRegisterError(error) {
        console.error('[PWA] SW registration error:', error);
      },
      onNeedRefresh() {
        console.log('[PWA] New content available, refresh needed');
        updateCallback?.();
      },
      onOfflineReady() {
        console.log('[PWA] App ready to work offline! 🎉');
      },
    });

    return updateSW;
  } catch (error) {
    console.error('[PWA] Failed to register:', error);
    return null;
  }
}

/**
 * Check if the app is running in standalone mode (installed)
 */
export function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://')
  );
}

/**
 * Check if the app is online
 */
export function isOnline() {
  return navigator.onLine;
}

/**
 * Get the SW registration
 */
export function getRegistration() {
  return swRegistration;
}
