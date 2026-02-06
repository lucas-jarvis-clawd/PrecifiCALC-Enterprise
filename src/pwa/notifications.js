/**
 * Push Notifications Manager
 * Handles notification permissions, scheduling, and tax deadline reminders
 */

const NOTIFICATION_STORAGE_KEY = 'precificalc_notifications';
const REMINDER_STORAGE_KEY = 'precificalc_tax_reminders';

/**
 * Check if notifications are supported
 */
export function isNotificationSupported() {
  return 'Notification' in window;
}

/**
 * Get current notification permission
 */
export function getNotificationPermission() {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission; // 'default', 'granted', 'denied'
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission() {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('[Notifications] Permission request failed:', error);
    return 'error';
  }
}

/**
 * Send a local notification
 */
export function sendNotification(title, options = {}) {
  if (getNotificationPermission() !== 'granted') {
    console.log('[Notifications] Permission not granted');
    return null;
  }

  const defaultOptions = {
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [200, 100, 200],
    lang: 'pt-BR',
    dir: 'ltr',
    tag: 'precificalc',
    renotify: false,
    ...options,
  };

  try {
    const notification = new Notification(title, defaultOptions);
    
    notification.onclick = () => {
      window.focus();
      notification.close();
      if (options.onClick) options.onClick();
    };

    // Log notification
    logNotification(title, options);
    
    return notification;
  } catch (error) {
    console.error('[Notifications] Failed to send:', error);
    return null;
  }
}

/**
 * Brazilian tax deadlines - recurring monthly
 * Day of month → deadline info
 */
const TAX_DEADLINES = [
  { day: 7, name: 'FGTS', description: 'Recolhimento do FGTS referente ao mês anterior' },
  { day: 15, name: 'ISS', description: 'Pagamento do ISS (varia por município)' },
  { day: 20, name: 'INSS/GPS', description: 'Guia da Previdência Social' },
  { day: 20, name: 'DAS (Simples)', description: 'Documento de Arrecadação do Simples Nacional' },
  { day: 20, name: 'DCTF', description: 'Declaração de Débitos e Créditos Tributários Federais' },
  { day: 25, name: 'PIS/COFINS', description: 'Pagamento PIS/COFINS (Lucro Presumido/Real)' },
  { day: 25, name: 'ICMS', description: 'Pagamento do ICMS (varia por estado)' },
  { day: 28, name: 'IRPJ/CSLL', description: 'Imposto de Renda PJ e Contribuição Social (trimestral)' },
  { day: 31, name: 'IRRF', description: 'Imposto de Renda Retido na Fonte' },
];

/**
 * Check and send tax deadline reminders
 * Called periodically or on app open
 */
export function checkTaxDeadlines(daysAhead = 3) {
  if (getNotificationPermission() !== 'granted') return [];

  const today = new Date();
  const reminders = getStoredReminders();
  const notifications = [];

  TAX_DEADLINES.forEach(deadline => {
    const deadlineDate = new Date(today.getFullYear(), today.getMonth(), deadline.day);
    
    // If deadline already passed this month, check next month
    if (deadlineDate < today) {
      deadlineDate.setMonth(deadlineDate.getMonth() + 1);
    }

    const daysUntil = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    const reminderKey = `${deadline.name}-${deadlineDate.getMonth()}-${deadlineDate.getFullYear()}`;

    if (daysUntil <= daysAhead && daysUntil >= 0 && !reminders[reminderKey]) {
      const daysText = daysUntil === 0 ? 'HOJE' : 
                       daysUntil === 1 ? 'AMANHÃ' : 
                       `em ${daysUntil} dias`;

      notifications.push({
        key: reminderKey,
        deadline: deadline.name,
        description: deadline.description,
        daysUntil,
        daysText,
        date: deadlineDate,
      });

      // Send notification
      sendNotification(`⚠️ ${deadline.name} vence ${daysText}!`, {
        body: deadline.description,
        tag: `tax-${deadline.name}`,
        renotify: true,
        data: { type: 'tax-deadline', deadline: deadline.name },
      });

      // Mark as reminded
      reminders[reminderKey] = Date.now();
    }
  });

  if (notifications.length > 0) {
    saveReminders(reminders);
  }

  return notifications;
}

/**
 * Get upcoming deadlines (for UI display, no notifications)
 */
export function getUpcomingDeadlines(daysAhead = 30) {
  const today = new Date();
  const upcoming = [];

  TAX_DEADLINES.forEach(deadline => {
    const deadlineDate = new Date(today.getFullYear(), today.getMonth(), deadline.day);
    
    if (deadlineDate < today) {
      deadlineDate.setMonth(deadlineDate.getMonth() + 1);
    }

    const daysUntil = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));

    if (daysUntil <= daysAhead) {
      upcoming.push({
        ...deadline,
        date: deadlineDate,
        daysUntil,
        urgency: daysUntil <= 1 ? 'critical' : daysUntil <= 3 ? 'warning' : 'info',
      });
    }
  });

  return upcoming.sort((a, b) => a.daysUntil - b.daysUntil);
}

/**
 * Schedule a custom reminder
 */
export function scheduleReminder(title, body, delayMs) {
  if (getNotificationPermission() !== 'granted') return null;

  const timeoutId = setTimeout(() => {
    sendNotification(title, { body, tag: 'custom-reminder' });
  }, delayMs);

  return timeoutId;
}

// --- Storage helpers ---

function getStoredReminders() {
  try {
    return JSON.parse(localStorage.getItem(REMINDER_STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveReminders(reminders) {
  try {
    // Clean old entries (older than 60 days)
    const cutoff = Date.now() - (60 * 24 * 60 * 60 * 1000);
    const cleaned = {};
    for (const [key, timestamp] of Object.entries(reminders)) {
      if (timestamp > cutoff) {
        cleaned[key] = timestamp;
      }
    }
    localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(cleaned));
  } catch {}
}

function logNotification(title, options) {
  try {
    const log = JSON.parse(localStorage.getItem(NOTIFICATION_STORAGE_KEY) || '[]');
    log.push({
      title,
      body: options.body,
      timestamp: Date.now(),
      tag: options.tag,
    });
    // Keep last 50 notifications
    const trimmed = log.slice(-50);
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(trimmed));
  } catch {}
}

/**
 * Get notification history
 */
export function getNotificationHistory() {
  try {
    return JSON.parse(localStorage.getItem(NOTIFICATION_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

/**
 * Clear notification history
 */
export function clearNotificationHistory() {
  localStorage.removeItem(NOTIFICATION_STORAGE_KEY);
  localStorage.removeItem(REMINDER_STORAGE_KEY);
}
