// 🚀 Lazy Loader with Performance Tracking & Intelligent Preloading
import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Loader2, AlertTriangle, RotateCcw } from 'lucide-react';

// 📊 Performance tracker for lazy loading
class LazyLoadTracker {
  constructor() {
    this.loadTimes = new Map();
    this.failures = new Map();
    this.preloadQueue = new Set();
    this.loadedModules = new Set();
  }

  trackLoad(moduleName, startTime, endTime, success = true) {
    const duration = endTime - startTime;
    
    if (success) {
      this.loadTimes.set(moduleName, {
        duration,
        timestamp: endTime,
        loads: (this.loadTimes.get(moduleName)?.loads || 0) + 1
      });
      this.loadedModules.add(moduleName);
      
      // Alertar sobre carregamentos lentos
      if (duration > 1000) {
        console.warn(`🐌 Slow module load: ${moduleName} took ${duration.toFixed(0)}ms`);
      }
      
      // Performance monitoring integration
      if (window.performanceMonitor) {
        window.performanceMonitor.setMetric(`lazy_load_${moduleName}`, duration);
      }
    } else {
      const failures = this.failures.get(moduleName) || 0;
      this.failures.set(moduleName, failures + 1);
    }
  }

  getAverageLoadTime(moduleName) {
    const data = this.loadTimes.get(moduleName);
    return data ? data.duration : null;
  }

  getLoadStats() {
    const stats = {
      totalModules: this.loadTimes.size,
      averageLoadTime: 0,
      slowestModule: null,
      failures: this.failures.size,
      loadedModules: Array.from(this.loadedModules)
    };

    if (this.loadTimes.size > 0) {
      const totalTime = Array.from(this.loadTimes.values()).reduce(
        (sum, data) => sum + data.duration, 0
      );
      stats.averageLoadTime = totalTime / this.loadTimes.size;
      
      const slowest = Array.from(this.loadTimes.entries()).reduce(
        (slowest, [name, data]) => 
          data.duration > (slowest?.duration || 0) ? { name, duration: data.duration } : slowest,
        null
      );
      stats.slowestModule = slowest;
    }

    return stats;
  }

  // 🎯 Intelligent preloading based on usage patterns
  schedulePreload(moduleName, priority = 'low') {
    if (this.loadedModules.has(moduleName)) return;
    
    this.preloadQueue.add({ moduleName, priority, timestamp: Date.now() });
    
    // Execute preload based on priority
    if (priority === 'high') {
      setTimeout(() => this.executePreload(moduleName), 100);
    } else if (priority === 'medium') {
      setTimeout(() => this.executePreload(moduleName), 500);
    } else {
      setTimeout(() => this.executePreload(moduleName), 2000);
    }
  }

  executePreload(moduleName) {
    // This would trigger the lazy import to cache the module
    console.log(`📦 Preloading module: ${moduleName}`);
  }
}

// Global instance
const lazyTracker = window.lazyTracker || (window.lazyTracker = new LazyLoadTracker());

// 🎨 Loading Spinner Component
const LoadingSpinner = ({ 
  message = 'Carregando módulo...', 
  size = 'default',
  showProgress = false,
  progress = 0 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-8 h-8', 
    large: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[200px]">
      {/* Spinner */}
      <div className="relative">
        <Loader2 className={`${sizeClasses[size]} text-indigo-600 animate-spin`} />
        
        {showProgress && (
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
            <div className="text-xs text-slate-500 font-mono">
              {Math.round(progress)}%
            </div>
          </div>
        )}
      </div>
      
      {/* Message */}
      <p className="mt-4 text-sm text-slate-600 font-medium">
        {message}
      </p>
      
      {/* Progress bar */}
      {showProgress && (
        <div className="mt-3 w-32 h-1 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-600 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

// 🚨 Error Boundary para lazy loading
const LazyErrorBoundary = ({ 
  children, 
  fallback, 
  moduleName,
  onRetry 
}) => {
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    if (hasError) {
      lazyTracker.trackLoad(moduleName, Date.now(), Date.now(), false);
    }
  }, [hasError, moduleName]);

  const handleRetry = () => {
    if (retryCount < maxRetries) {
      setHasError(false);
      setRetryCount(prev => prev + 1);
      onRetry?.();
    }
  };

  if (hasError) {
    return fallback || (
      <div className="flex flex-col items-center justify-center p-8 min-h-[200px] bg-red-50 rounded-lg border border-red-200">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Erro ao carregar módulo
        </h3>
        
        <p className="text-sm text-red-600 mb-4 text-center max-w-md">
          Não foi possível carregar o módulo <code className="font-mono bg-red-100 px-1 rounded">
            {moduleName}
          </code>. Verifique sua conexão com a internet.
        </p>
        
        <div className="flex items-center gap-3">
          {retryCount < maxRetries && (
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Tentar novamente ({retryCount + 1}/{maxRetries})
            </button>
          )}
          
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors"
          >
            Recarregar página
          </button>
        </div>
      </div>
    );
  }

  try {
    return children;
  } catch (error) {
    setHasError(true);
    console.error('LazyErrorBoundary caught an error:', error);
    return null;
  }
};

// 🎯 Main LazyLoader Component
const LazyLoader = ({ 
  component: Component,
  moduleName,
  fallback,
  preloadTrigger = 'hover',
  preloadDelay = 100,
  loadingMessage,
  showProgress = false,
  onLoad,
  onError,
  ...props
}) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isPreloading, setIsPreloading] = useState(false);
  const startTimeRef = useRef(null);
  const preloadTimeoutRef = useRef(null);

  // 📊 Track loading performance
  useEffect(() => {
    startTimeRef.current = performance.now();
    
    return () => {
      if (startTimeRef.current) {
        const endTime = performance.now();
        lazyTracker.trackLoad(moduleName, startTimeRef.current, endTime, true);
        onLoad?.(endTime - startTimeRef.current);
      }
    };
  }, [moduleName, onLoad]);

  // 🎯 Preloading logic
  const handlePreloadTrigger = () => {
    if (isPreloading || lazyTracker.loadedModules.has(moduleName)) return;
    
    setIsPreloading(true);
    preloadTimeoutRef.current = setTimeout(() => {
      lazyTracker.schedulePreload(moduleName, 'high');
    }, preloadDelay);
  };

  const handlePreloadCancel = () => {
    if (preloadTimeoutRef.current) {
      clearTimeout(preloadTimeoutRef.current);
      preloadTimeoutRef.current = null;
    }
    setIsPreloading(false);
  };

  // 📈 Simular progresso de loading (para feedback visual)
  useEffect(() => {
    if (!showProgress) return;

    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        const increment = Math.random() * 20 + 5; // 5-25% increment
        const newProgress = Math.min(prev + increment, 95); // Never reach 100% automatically
        
        if (newProgress >= 95) {
          clearInterval(interval);
        }
        
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [showProgress]);

  // 🧹 Cleanup
  useEffect(() => {
    return () => {
      if (preloadTimeoutRef.current) {
        clearTimeout(preloadTimeoutRef.current);
      }
    };
  }, []);

  // 📱 Render preload trigger wrapper
  const PreloadTrigger = ({ children }) => {
    const triggerProps = {};
    
    if (preloadTrigger === 'hover') {
      triggerProps.onMouseEnter = handlePreloadTrigger;
      triggerProps.onMouseLeave = handlePreloadCancel;
    } else if (preloadTrigger === 'intersection') {
      // TODO: Implement Intersection Observer
    }
    
    return (
      <div {...triggerProps}>
        {children}
      </div>
    );
  };

  // 🎨 Custom fallback with performance info
  const defaultFallback = (
    <LoadingSpinner
      message={loadingMessage || `Carregando ${moduleName}...`}
      showProgress={showProgress}
      progress={loadingProgress}
    />
  );

  const handleError = (error) => {
    console.error(`Failed to load module ${moduleName}:`, error);
    lazyTracker.trackLoad(moduleName, startTimeRef.current || Date.now(), Date.now(), false);
    onError?.(error);
  };

  const handleRetry = () => {
    // Reset loading progress
    setLoadingProgress(0);
    startTimeRef.current = performance.now();
  };

  return (
    <PreloadTrigger>
      <LazyErrorBoundary 
        moduleName={moduleName}
        onRetry={handleRetry}
        fallback={fallback}
      >
        <Suspense fallback={fallback || defaultFallback}>
          <Component 
            {...props}
            onComponentLoad={() => {
              if (showProgress) {
                setLoadingProgress(100);
              }
            }}
          />
        </Suspense>
      </LazyErrorBoundary>
    </PreloadTrigger>
  );
};

// 🎯 High-Order Component for easier usage
export const withLazyLoader = (
  lazyComponent, 
  moduleName, 
  options = {}
) => {
  const LazyComponent = (props) => (
    <LazyLoader
      component={lazyComponent}
      moduleName={moduleName}
      {...options}
      {...props}
    />
  );
  
  LazyComponent.displayName = `LazyLoader(${moduleName})`;
  return LazyComponent;
};

// 📊 Performance utilities
export const getLazyLoadStats = () => lazyTracker.getLoadStats();

export const preloadModule = (moduleName, priority = 'medium') => {
  lazyTracker.schedulePreload(moduleName, priority);
};

// 🎯 React Hook for lazy loading control
export const useLazyLoading = (moduleName) => {
  const [isLoaded, setIsLoaded] = useState(
    lazyTracker.loadedModules.has(moduleName)
  );
  
  const [loadTime, setLoadTime] = useState(
    lazyTracker.getAverageLoadTime(moduleName)
  );

  useEffect(() => {
    const handleMetric = (event) => {
      if (event.detail.name === `lazy_load_${moduleName}`) {
        setLoadTime(event.detail.value);
        setIsLoaded(true);
      }
    };

    window.addEventListener('precificalc:metric', handleMetric);
    return () => window.removeEventListener('precificalc:metric', handleMetric);
  }, [moduleName]);

  return {
    isLoaded,
    loadTime,
    preload: (priority) => preloadModule(moduleName, priority),
    stats: lazyTracker.getLoadStats()
  };
};

export default LazyLoader;