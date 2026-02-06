// 📊 Performance Widget - Real-time monitoring para desenvolvimento
import React, { useState, useEffect, useRef } from 'react';
import { Activity, Zap, Database, Gauge, ChevronDown, ChevronUp } from 'lucide-react';

const PerformanceWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [metrics, setMetrics] = useState({});
  const intervalRef = useRef();
  
  // 🔍 Detectar modo debug
  const isDebugMode = import.meta.env?.DEV || 
                     localStorage.getItem('precificalc_debug_mode') === 'true';
  
  if (!isDebugMode) return null;

  useEffect(() => {
    const monitor = window.performanceMonitor;
    if (!monitor) return;

    // 📊 Atualizar métricas a cada segundo
    const updateMetrics = () => {
      const currentMetrics = monitor.getAllMetrics();
      const memory = monitor.trackMemoryUsage();
      const score = monitor.calculatePerformanceScore();
      
      const newMetrics = {
        ...currentMetrics,
        memory,
        score,
        timestamp: Date.now()
      };
      
      setMetrics(newMetrics);
    };

    // Atualizar imediatamente
    updateMetrics();
    
    // Agendar atualizações regulares
    intervalRef.current = setInterval(updateMetrics, 1000);
    
    // Escutar eventos de métricas customizadas
    const handleMetricUpdate = (event) => {
      setMetrics(prev => ({
        ...prev,
        [event.detail.name]: event.detail.value,
        lastUpdate: Date.now()
      }));
    };
    
    window.addEventListener('precificalc:metric', handleMetricUpdate);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener('precificalc:metric', handleMetricUpdate);
    };
  }, []);

  // 📈 Calcular estatísticas
  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getMemoryColor = (usage) => {
    if (usage < 50) return 'text-green-500';
    if (usage < 80) return 'text-yellow-500';
    return 'text-red-500';
  };

  const formatMs = (ms) => {
    if (!ms) return '0ms';
    if (ms < 1000) return `${ms.toFixed(1)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  // 📊 Métricas principais para exibir
  const coreVitals = {
    FCP: metrics.FCP,
    LCP: metrics.LCP,
    FID: metrics.FID,
    CLS: metrics.CLS
  };

  const hasSlowComponents = Object.keys(metrics)
    .filter(key => key.includes('component_') && key.includes('_avg'))
    .some(key => metrics[key] > 16.67);

  if (!isOpen) {
    // 📱 Widget compacto
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm
            border border-white/10 transition-all duration-200 hover:scale-105
            ${metrics.score >= 90 ? 'bg-green-500/20 text-green-400' :
              metrics.score >= 70 ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'}
          `}
        >
          <Activity className="w-4 h-4" />
          <span className="text-sm font-mono">
            {metrics.score ? `${Math.round(metrics.score)}` : '...'}
          </span>
          <ChevronUp className="w-3 h-3" />
        </button>
      </div>
    );
  }

  // 📊 Widget expandido
  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-slate-900/95 backdrop-blur-md rounded-lg border border-slate-700 shadow-2xl">
      {/* 🎮 Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Gauge className="w-5 h-5 text-blue-400" />
          <h3 className="text-white font-semibold">Performance Monitor</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-slate-700 rounded"
        >
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* 📊 Performance Score */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-300 text-sm">Performance Score</span>
          <span className={`text-2xl font-bold font-mono ${getScoreColor(metrics.score)}`}>
            {metrics.score ? Math.round(metrics.score) : '--'}
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              metrics.score >= 90 ? 'bg-green-500' :
              metrics.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${metrics.score || 0}%` }}
          />
        </div>
      </div>

      {/* 🧠 Memory Usage */}
      {metrics.memory && (
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-400" />
              <span className="text-slate-300 text-sm">Memory</span>
            </div>
            <span className={`text-sm font-mono ${getMemoryColor(parseFloat(metrics.memory.usage))}`}>
              {metrics.memory.usage}%
            </span>
          </div>
          
          <div className="text-xs text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Used:</span>
              <span>{metrics.memory.used} MB</span>
            </div>
            <div className="flex justify-between">
              <span>Total:</span>
              <span>{metrics.memory.total} MB</span>
            </div>
          </div>
        </div>
      )}

      {/* ⚡ Core Web Vitals */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="text-slate-300 text-sm font-medium">Core Web Vitals</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-800/50 p-2 rounded">
            <div className="text-slate-400">FCP</div>
            <div className="font-mono text-white">
              {coreVitals.FCP ? formatMs(coreVitals.FCP) : '--'}
            </div>
          </div>
          <div className="bg-slate-800/50 p-2 rounded">
            <div className="text-slate-400">LCP</div>
            <div className="font-mono text-white">
              {coreVitals.LCP ? formatMs(coreVitals.LCP) : '--'}
            </div>
          </div>
          <div className="bg-slate-800/50 p-2 rounded">
            <div className="text-slate-400">FID</div>
            <div className="font-mono text-white">
              {coreVitals.FID ? formatMs(coreVitals.FID) : '--'}
            </div>
          </div>
          <div className="bg-slate-800/50 p-2 rounded">
            <div className="text-slate-400">CLS</div>
            <div className="font-mono text-white">
              {coreVitals.CLS ? coreVitals.CLS.toFixed(3) : '--'}
            </div>
          </div>
        </div>
      </div>

      {/* 🚨 Alerts */}
      <div className="p-4 border-b border-slate-700">
        <div className="text-slate-300 text-sm mb-2">Status</div>
        <div className="space-y-1 text-xs">
          {metrics.score >= 90 ? (
            <div className="text-green-400 flex items-center gap-1">
              ✓ Excellent performance
            </div>
          ) : metrics.score >= 70 ? (
            <div className="text-yellow-400 flex items-center gap-1">
              ⚠ Good performance, room for improvement
            </div>
          ) : (
            <div className="text-red-400 flex items-center gap-1">
              🚨 Poor performance, needs optimization
            </div>
          )}
          
          {hasSlowComponents && (
            <div className="text-orange-400 flex items-center gap-1">
              🐌 Slow components detected
            </div>
          )}
          
          {metrics.memory && parseFloat(metrics.memory.usage) > 80 && (
            <div className="text-red-400 flex items-center gap-1">
              💾 High memory usage
            </div>
          )}
        </div>
      </div>

      {/* 🎯 Actions */}
      <div className="p-4">
        <div className="flex gap-2">
          <button
            onClick={() => {
              const monitor = window.performanceMonitor;
              const report = monitor?.generateReport();
              console.log('📊 Performance Report:', report);
              
              // Copiar report para clipboard se possível
              if (navigator.clipboard) {
                navigator.clipboard.writeText(JSON.stringify(report, null, 2));
                alert('Report copied to clipboard!');
              }
            }}
            className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
          >
            Export Report
          </button>
          
          <button
            onClick={() => {
              // Resetar métricas
              if (window.performanceMonitor) {
                window.performanceMonitor.metrics.clear();
                setMetrics({});
                setHistory([]);
              }
            }}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

// 🎯 Hook para usar o performance tracking em componentes
export const usePerformanceWidget = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  
  useEffect(() => {
    const checkDebugMode = () => {
      const debugMode = import.meta.env?.DEV || 
                       localStorage.getItem('precificalc_debug_mode') === 'true';
      setIsEnabled(debugMode);
    };
    
    checkDebugMode();
    
    // Escutar mudanças no localStorage
    const handleStorageChange = (e) => {
      if (e.key === 'precificalc_debug_mode') {
        checkDebugMode();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  const enableDebugMode = () => {
    localStorage.setItem('precificalc_debug_mode', 'true');
    setIsEnabled(true);
  };
  
  const disableDebugMode = () => {
    localStorage.removeItem('precificalc_debug_mode');
    setIsEnabled(false);
  };
  
  return {
    isEnabled,
    enableDebugMode,
    disableDebugMode
  };
};

export default PerformanceWidget;