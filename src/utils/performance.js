// 🚀 PrecifiCALC Performance Monitor & Profiler
// Monitoramento de performance em tempo real com métricas detalhadas

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = [];
    this.isEnabled = process.env.NODE_ENV !== 'production' || 
                     localStorage.getItem('precificalc_debug_mode') === 'true';
    
    if (this.isEnabled) {
      this.trackCoreWebVitals();
    }
  }

  // 📊 Core Web Vitals Tracking
  trackCoreWebVitals() {
    if (typeof window === 'undefined') return;

    // FCP - First Contentful Paint
    this.observePerformanceEntry('paint', (entries) => {
      entries.forEach(entry => {
        if (entry.name === 'first-contentful-paint') {
          this.setMetric('FCP', entry.startTime);
        }
      });
    });

    // LCP - Largest Contentful Paint
    this.observePerformanceEntry('largest-contentful-paint', (entries) => {
      entries.forEach(entry => {
        this.setMetric('LCP', entry.startTime);
      });
    });

    // FID - First Input Delay (via event listener)
    let firstInputDelay = null;
    const trackFirstInput = (event) => {
      if (firstInputDelay === null) {
        firstInputDelay = performance.now() - event.timeStamp;
        this.setMetric('FID', firstInputDelay);
        window.removeEventListener('click', trackFirstInput, true);
        window.removeEventListener('keydown', trackFirstInput, true);
        window.removeEventListener('touchstart', trackFirstInput, true);
      }
    };
    
    window.addEventListener('click', trackFirstInput, true);
    window.addEventListener('keydown', trackFirstInput, true);
    window.addEventListener('touchstart', trackFirstInput, true);

    // CLS - Cumulative Layout Shift
    this.observePerformanceEntry('layout-shift', (entries) => {
      let clsScore = 0;
      entries.forEach(entry => {
        if (!entry.hadRecentInput) {
          clsScore += entry.value;
        }
      });
      this.setMetric('CLS', clsScore);
    });
  }

  // 🔍 Observer Helper
  observePerformanceEntry(type, callback) {
    if (!window.PerformanceObserver) return;
    
    try {
      const observer = new PerformanceObserver(list => {
        callback(list.getEntries());
      });
      
      observer.observe({ type, buffered: true });
      this.observers.push(observer);
    } catch (e) {
      console.warn(`Performance observer for ${type} not supported`, e);
    }
  }

  // ⏱️ Custom Performance Measurement
  startMeasure(name) {
    if (!this.isEnabled) return;
    
    const startTime = performance.now();
    this.metrics.set(`${name}_start`, startTime);
    
    // Mark for PerformanceAPI
    if (window.performance?.mark) {
      performance.mark(`${name}_start`);
    }
    
    return {
      end: () => this.endMeasure(name),
      startTime
    };
  }

  endMeasure(name) {
    if (!this.isEnabled) return;
    
    const endTime = performance.now();
    const startTime = this.metrics.get(`${name}_start`);
    
    if (startTime) {
      const duration = endTime - startTime;
      this.setMetric(name, duration);
      
      // Performance API mark
      if (window.performance?.mark && window.performance?.measure) {
        performance.mark(`${name}_end`);
        performance.measure(name, `${name}_start`, `${name}_end`);
      }
      
      // Log slow operations
      if (duration > 100) { // 100ms threshold
        console.warn(`🐌 Slow operation: ${name} took ${duration.toFixed(2)}ms`);
      }
      
      return duration;
    }
  }

  // 📈 Memory Usage Tracking
  trackMemoryUsage() {
    if (!window.performance?.memory) return null;
    
    const memory = window.performance.memory;
    const memoryMetrics = {
      used: (memory.usedJSHeapSize / 1024 / 1024).toFixed(2), // MB
      total: (memory.totalJSHeapSize / 1024 / 1024).toFixed(2), // MB
      limit: (memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2), // MB
      usage: ((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(2) // %
    };
    
    this.setMetric('memory', memoryMetrics);
    return memoryMetrics;
  }

  // 📊 React Component Performance
  trackComponentRender(componentName, renderTime) {
    if (!this.isEnabled) return;
    
    const existing = this.metrics.get(`component_${componentName}`) || [];
    existing.push(renderTime);
    
    // Keep last 100 renders
    if (existing.length > 100) {
      existing.shift();
    }
    
    this.setMetric(`component_${componentName}`, existing);
    
    // Calculate average
    const avg = existing.reduce((a, b) => a + b, 0) / existing.length;
    this.setMetric(`component_${componentName}_avg`, avg);
    
    if (avg > 16.67) { // 60fps threshold
      console.warn(`🎭 Slow component: ${componentName} avg render: ${avg.toFixed(2)}ms`);
    }
  }

  // 💾 localStorage Performance Monitoring
  trackStorageOperation(operation, key, size = 0) {
    const measure = this.startMeasure(`storage_${operation}_${key}`);
    
    return {
      end: () => {
        const duration = measure.end();
        this.setMetric(`storage_${operation}`, {
          key,
          size,
          duration,
          timestamp: Date.now()
        });
        
        if (duration > 50) { // 50ms threshold for storage
          console.warn(`💾 Slow storage ${operation}: ${key} took ${duration.toFixed(2)}ms`);
        }
        
        return duration;
      }
    };
  }

  // 🌐 Network Performance Tracking
  trackNetworkRequest(url, method = 'GET') {
    const startTime = performance.now();
    
    return {
      success: (responseSize = 0) => {
        const duration = performance.now() - startTime;
        this.setMetric('network_request', {
          url,
          method,
          duration,
          responseSize,
          success: true,
          timestamp: Date.now()
        });
      },
      
      error: (error) => {
        const duration = performance.now() - startTime;
        this.setMetric('network_error', {
          url,
          method,
          duration,
          error: error.message,
          timestamp: Date.now()
        });
      }
    };
  }

  // 📱 Bundle Size Analysis
  analyzeBundleSize() {
    if (!window.performance?.getEntriesByType) return null;
    
    const resources = performance.getEntriesByType('resource');
    const jsFiles = resources.filter(r => r.name.includes('.js'));
    const cssFiles = resources.filter(r => r.name.includes('.css'));
    
    const analysis = {
      totalJS: jsFiles.reduce((sum, file) => sum + (file.transferSize || 0), 0),
      totalCSS: cssFiles.reduce((sum, file) => sum + (file.transferSize || 0), 0),
      jsCount: jsFiles.length,
      cssCount: cssFiles.length,
      largestJS: jsFiles.reduce((largest, file) => 
        (file.transferSize || 0) > (largest?.transferSize || 0) ? file : largest, null
      ),
      files: [...jsFiles, ...cssFiles].map(file => ({
        name: file.name.split('/').pop(),
        size: (file.transferSize || 0) / 1024, // KB
        duration: file.duration
      }))
    };
    
    this.setMetric('bundle_analysis', analysis);
    return analysis;
  }

  // 🎯 Performance Score Calculator
  calculatePerformanceScore() {
    const fcp = this.getMetric('FCP');
    const lcp = this.getMetric('LCP');
    const fid = this.getMetric('FID');
    const cls = this.getMetric('CLS');
    
    let score = 100;
    
    // FCP scoring (0-2.5s = 100, 2.5-4s = 50-100, >4s = 0-50)
    if (fcp) {
      if (fcp > 4000) score -= 25;
      else if (fcp > 2500) score -= (fcp - 2500) / 1500 * 25;
    }
    
    // LCP scoring (0-2.5s = 100, 2.5-4s = 50-100, >4s = 0-50)
    if (lcp) {
      if (lcp > 4000) score -= 25;
      else if (lcp > 2500) score -= (lcp - 2500) / 1500 * 25;
    }
    
    // FID scoring (0-100ms = 100, 100-300ms = 50-100, >300ms = 0-50)
    if (fid) {
      if (fid > 300) score -= 25;
      else if (fid > 100) score -= (fid - 100) / 200 * 25;
    }
    
    // CLS scoring (0-0.1 = 100, 0.1-0.25 = 50-100, >0.25 = 0-50)
    if (cls) {
      if (cls > 0.25) score -= 25;
      else if (cls > 0.1) score -= (cls - 0.1) / 0.15 * 25;
    }
    
    const finalScore = Math.max(0, Math.round(score));
    this.setMetric('performance_score', finalScore);
    
    return finalScore;
  }

  // 🔧 Generic metric setter/getter
  setMetric(name, value) {
    this.metrics.set(name, value);
    
    // Trigger custom events for real-time monitoring
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('precificalc:metric', {
        detail: { name, value }
      }));
    }
  }

  getMetric(name) {
    return this.metrics.get(name);
  }

  getAllMetrics() {
    const metricsObj = {};
    this.metrics.forEach((value, key) => {
      metricsObj[key] = value;
    });
    return metricsObj;
  }

  // 📊 Performance Report Generator
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      coreWebVitals: {
        FCP: this.getMetric('FCP'),
        LCP: this.getMetric('LCP'),
        FID: this.getMetric('FID'),
        CLS: this.getMetric('CLS'),
        score: this.calculatePerformanceScore()
      },
      memory: this.trackMemoryUsage(),
      bundleSize: this.getMetric('bundle_analysis'),
      slowComponents: this.getSlowComponents(),
      recommendations: this.generateRecommendations()
    };
    
    return report;
  }

  getSlowComponents() {
    const slowComponents = [];
    this.metrics.forEach((value, key) => {
      if (key.includes('component_') && key.includes('_avg')) {
        const componentName = key.replace('component_', '').replace('_avg', '');
        if (value > 16.67) { // Slower than 60fps
          slowComponents.push({
            name: componentName,
            avgRenderTime: value,
            impact: value > 33.33 ? 'high' : 'medium'
          });
        }
      }
    });
    
    return slowComponents.sort((a, b) => b.avgRenderTime - a.avgRenderTime);
  }

  generateRecommendations() {
    const recommendations = [];
    const score = this.getMetric('performance_score') || 100;
    const memory = this.getMetric('memory');
    const bundleAnalysis = this.getMetric('bundle_analysis');
    
    if (score < 90) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        message: 'Overall performance score below 90. Check Core Web Vitals.',
        action: 'Optimize critical path and reduce blocking resources'
      });
    }
    
    if (memory && parseFloat(memory.usage) > 80) {
      recommendations.push({
        type: 'memory',
        priority: 'high', 
        message: `High memory usage: ${memory.usage}%`,
        action: 'Check for memory leaks and optimize data structures'
      });
    }
    
    if (bundleAnalysis && bundleAnalysis.totalJS > 500 * 1024) { // 500KB
      recommendations.push({
        type: 'bundle',
        priority: 'medium',
        message: `Large JS bundle: ${(bundleAnalysis.totalJS / 1024).toFixed(1)}KB`,
        action: 'Implement code splitting and lazy loading'
      });
    }
    
    return recommendations;
  }

  // 🧹 Cleanup
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics.clear();
  }
}

// 📊 React Performance Hook
export const usePerformanceTracking = (componentName) => {
  const monitor = window.performanceMonitor || (window.performanceMonitor = new PerformanceMonitor());
  
  return {
    trackRender: (renderTime) => monitor.trackComponentRender(componentName, renderTime),
    measure: (operationName) => monitor.startMeasure(`${componentName}_${operationName}`),
    trackStorage: (operation, key, size) => monitor.trackStorageOperation(operation, key, size)
  };
};

// 🚀 Auto-initialization
if (typeof window !== 'undefined') {
  window.performanceMonitor = window.performanceMonitor || new PerformanceMonitor();
}

// 📈 Utility functions
export const measureAsync = async (name, asyncFn) => {
  const monitor = window.performanceMonitor;
  const measure = monitor?.startMeasure(name);
  
  try {
    const result = await asyncFn();
    measure?.end();
    return result;
  } catch (error) {
    measure?.end();
    throw error;
  }
};

export const measureSync = (name, syncFn) => {
  const monitor = window.performanceMonitor;
  const measure = monitor?.startMeasure(name);
  
  try {
    const result = syncFn();
    measure?.end();
    return result;
  } catch (error) {
    measure?.end();
    throw error;
  }
};

// 💾 Enhanced localStorage with performance tracking
export const performantStorage = {
  getItem: (key) => {
    const monitor = window.performanceMonitor;
    const tracker = monitor?.trackStorageOperation('get', key);
    
    try {
      const value = localStorage.getItem(key);
      tracker?.end();
      return value;
    } catch (error) {
      tracker?.end();
      throw error;
    }
  },
  
  setItem: (key, value) => {
    const monitor = window.performanceMonitor;
    const size = new Blob([value]).size;
    const tracker = monitor?.trackStorageOperation('set', key, size);
    
    try {
      localStorage.setItem(key, value);
      tracker?.end();
    } catch (error) {
      tracker?.end();
      throw error;
    }
  },
  
  removeItem: (key) => {
    const monitor = window.performanceMonitor;
    const tracker = monitor?.trackStorageOperation('remove', key);
    
    try {
      localStorage.removeItem(key);
      tracker?.end();
    } catch (error) {
      tracker?.end();
      throw error;
    }
  }
};

export default PerformanceMonitor;