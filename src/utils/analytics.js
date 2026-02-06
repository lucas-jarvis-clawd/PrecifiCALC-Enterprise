/**
 * Analytics Engine - PrecifiCALC Enterprise
 * Sistema de rastreamento de eventos para conversão e funil de uso.
 * Pluggable: pode conectar a Google Analytics, Mixpanel, PostHog, etc.
 */

const STORAGE_KEY = 'precificalc_analytics';
const MAX_EVENTS = 500;

class AnalyticsEngine {
  constructor() {
    this.initialized = false;
    this.sessionId = this._generateSessionId();
    this.sessionStart = Date.now();
    this.providers = [];
  }

  /**
   * Inicializa o analytics com providers opcionais
   */
  init(options = {}) {
    if (this.initialized) return;
    this.initialized = true;

    // Track session start
    this.track('session_start', {
      referrer: document.referrer,
      url: window.location.href,
      screen: `${window.innerWidth}x${window.innerHeight}`,
      touch: 'ontouchstart' in window,
      theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
    });

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.track('session_background');
      } else {
        this.track('session_foreground');
      }
    });

    // Track unload
    window.addEventListener('beforeunload', () => {
      this.track('session_end', {
        duration: Math.round((Date.now() - this.sessionStart) / 1000),
      });
      this._flush();
    });
  }

  /**
   * Registra provider externo (GA, Mixpanel, etc.)
   */
  registerProvider(provider) {
    if (provider && typeof provider.track === 'function') {
      this.providers.push(provider);
    }
  }

  /**
   * Rastreia evento
   */
  track(event, properties = {}) {
    const eventData = {
      event,
      properties: {
        ...properties,
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
        url: window.location.pathname,
      },
    };

    // Salva localmente
    this._store(eventData);

    // Envia para providers
    this.providers.forEach(p => {
      try { p.track(event, eventData.properties); } catch {}
    });

    // Console em desenvolvimento
    if (import.meta.env.DEV) {
      console.debug(`[Analytics] ${event}`, properties);
    }
  }

  // ==========================================
  // EVENTOS DE CONVERSÃO
  // ==========================================

  /** Onboarding concluído */
  trackOnboardingComplete(data) {
    this.track('onboarding_complete', {
      regime: data.regime,
      atividade: data.atividade,
      temCnpj: !!data.cnpj,
      temReceita: !!data.receitaAnual,
    });
  }

  /** Módulo utilizado */
  trackModuleUse(moduleId, duration = 0) {
    this.track('module_use', { moduleId, duration });
  }

  /** Cálculo executado */
  trackCalculation(type, params = {}) {
    this.track('calculation', {
      type,
      regime: params.regime,
      receita: params.receita ? 'sim' : 'nao',
    });
  }

  /** Relatório/proposta exportado */
  trackExport(type, format) {
    this.track('export', { type, format });
  }

  /** Navegação entre páginas */
  trackPageView(page) {
    this.track('page_view', { page });
  }

  /** Wizard completado */
  trackWizardComplete(resultData) {
    this.track('wizard_complete', {
      precoCalculado: !!resultData.precoIdeal,
      margemDesejada: resultData.margemDesejada,
      regime: resultData.regime,
    });
  }

  /** Tema alterado */
  trackThemeChange(theme) {
    this.track('theme_change', { theme });
  }

  /** Erro ocorrido */
  trackError(error, context) {
    this.track('error', {
      message: error?.message?.slice(0, 200),
      context,
    });
  }

  // ==========================================
  // FUNIL DE USO
  // ==========================================

  /**
   * Retorna métricas do funil de conversão
   */
  getFunnelMetrics() {
    const events = this._getEvents();
    const unique = (type) => new Set(
      events.filter(e => e.event === type).map(e => e.properties.sessionId)
    ).size;

    return {
      sessions: unique('session_start'),
      onboardingComplete: unique('onboarding_complete'),
      firstCalculation: unique('calculation'),
      moduleExplored: unique('module_use'),
      exported: unique('export'),
      wizardComplete: unique('wizard_complete'),
    };
  }

  /**
   * Retorna eventos dos últimos N dias
   */
  getRecentEvents(days = 7) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return this._getEvents().filter(e => 
      new Date(e.properties.timestamp) > cutoff
    );
  }

  // ==========================================
  // INTERNAL
  // ==========================================

  _generateSessionId() {
    return `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  _store(eventData) {
    try {
      const events = this._getEvents();
      events.push(eventData);
      // Trim if too many
      if (events.length > MAX_EVENTS) {
        events.splice(0, events.length - MAX_EVENTS);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch { /* storage full or unavailable */ }
  }

  _getEvents() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  _flush() {
    // Future: send to remote server
  }
}

// Singleton
export const analytics = new AnalyticsEngine();

// React hook
export function useAnalytics() {
  return analytics;
}
