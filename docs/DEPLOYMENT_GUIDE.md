# 🚀 DEPLOYMENT GUIDE - PrecifiCALC Masterpiece

**Data:** 06/02/2026  
**Quality Master:** Guia completo de deployment  
**Ambiente:** Produção + Staging

## 📋 PRÉ-REQUISITOS

### Ambiente Mínimo
- **Node.js:** >= 18.0.0 LTS
- **npm:** >= 8.0.0 ou **yarn:** >= 1.22.0
- **Git:** >= 2.30.0
- **Memória RAM:** >= 512MB disponível para build
- **Espaço em disco:** >= 2GB

### Verificação do Ambiente
```bash
# Verificar versões
node --version    # >= v18.0.0
npm --version     # >= 8.0.0
git --version     # >= 2.30.0

# Verificar espaço
df -h .           # >= 2GB livre
free -h           # >= 512MB RAM
```

---

## 🎯 PROCESSO DE BUILD

### 1. Clone e Dependências
```bash
# Clone do repositório
git clone <repo-url> precificalc-prod
cd precificalc-prod

# Install dependencies
npm install --production=false

# Verificar dependências críticas
npm audit --audit-level moderate
```

### 2. Configuração de Ambiente

#### Variáveis de Ambiente (.env.production)
```bash
# Build configuration
NODE_ENV=production
VITE_APP_VERSION=3.0.0
VITE_BUILD_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)

# Performance optimizations
VITE_BUNDLE_ANALYZER=false
VITE_PWA_ENABLED=true
VITE_SERVICE_WORKER=true

# Analytics (opcional)
VITE_ANALYTICS_ID=UA-XXXXXXXX-X
VITE_HOTJAR_ID=XXXXXXX

# Error tracking (recomendado)
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
```

#### Configuração de Build Avançada
```javascript
// vite.config.js - Otimizações de produção
export default defineConfig({
  build: {
    // Otimização de chunk
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'charts': ['recharts'],
          'tax-engine': ['./src/data/taxData.js'],
          'pdf-engine': ['jspdf', 'html2canvas']
        }
      }
    },
    
    // Compressão
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    
    // Assets
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 1000
  }
});
```

### 3. Build de Produção
```bash
# Build otimizado
npm run build

# Verificar build
ls -la dist/
du -sh dist/    # Deve ser < 10MB

# Verificar assets críticos
ls dist/assets/ | grep -E "\.(js|css)$" | head -10
```

### 4. Testes Pré-Deploy
```bash
# Executar todos os testes
npm test

# Coverage report
npm run test:coverage

# E2E tests
npm run test:e2e

# Performance audit local
npm run build && npm run preview
# Então abrir http://localhost:4173 e executar Lighthouse
```

---

## 🌐 OPÇÕES DE HOSTING

### 1. Vercel (Recomendado - Máxima Performance)

#### Configuração (vercel.json)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "buildCommand": "npm run build",
        "outputDirectory": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*\\.(js|css|ico|png|jpg|jpeg|gif|svg|webp|woff2?))",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    },
    {
      "src": "/sw.js",
      "headers": {
        "cache-control": "public, max-age=0, must-revalidate"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

#### Deploy
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Custom domain
vercel domains add precificalc.com.br
```

### 2. Netlify (Alternativa Robusta)

#### Configuração (netlify.toml)
```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_ENV = "production"
  VITE_PWA_ENABLED = "true"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"

[[headers]]
  for = "/assets/*"
  [headers.values]
    cache-control = "public, max-age=31536000, immutable"
```

### 3. AWS S3 + CloudFront (Enterprise)

#### S3 Bucket Setup
```bash
# Create bucket
aws s3 mb s3://precificalc-prod

# Configure website hosting
aws s3 website s3://precificalc-prod \
  --index-document index.html \
  --error-document index.html

# Upload build
aws s3 sync dist/ s3://precificalc-prod \
  --exclude "*.map" \
  --cache-control "public, max-age=31536000"

# Upload index.html with no-cache
aws s3 cp dist/index.html s3://precificalc-prod/index.html \
  --cache-control "no-cache"
```

#### CloudFront Distribution
```json
{
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-precificalc",
    "ViewerProtocolPolicy": "redirect-to-https",
    "CachePolicyId": "4135ea2d-6df8-44a3-9df3-4b5a84be39ad",
    "Compress": true
  },
  "PriceClass": "PriceClass_100",
  "Aliases": ["precificalc.com.br", "www.precificalc.com.br"],
  "ViewerCertificate": {
    "AcmCertificateArn": "arn:aws:acm:...",
    "SslSupportMethod": "sni-only"
  }
}
```

---

## 🔧 CONFIGURAÇÕES AVANÇADAS

### PWA Configuration
```javascript
// vite.config.js - PWA otimizado
import { VitePWA } from 'vite-plugin-pwa';

VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/api\./,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 // 24 hours
          }
        }
      }
    ]
  },
  includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
  manifest: {
    name: 'PrecifiCALC Enterprise',
    short_name: 'PrecifiCALC',
    description: 'Calculadora tributária e precificação inteligente',
    theme_color: '#4f46e5',
    background_color: '#ffffff',
    display: 'standalone',
    start_url: '/',
    icons: [
      {
        src: 'icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: 'icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ]
  }
});
```

### Performance Monitoring
```javascript
// src/utils/performance.js
export const initPerformanceMonitoring = () => {
  // Core Web Vitals
  new PerformanceObserver((entryList) => {
    for (const entry of entryList.getEntries()) {
      if (entry.entryType === 'largest-contentful-paint') {
        console.log('LCP:', entry.startTime);
        // Send to analytics
      }
    }
  }).observe({ entryTypes: ['largest-contentful-paint'] });

  // Memory usage
  if ('memory' in performance) {
    setInterval(() => {
      const memory = performance.memory;
      if (memory.usedJSHeapSize > 50 * 1024 * 1024) {
        console.warn('High memory usage:', memory.usedJSHeapSize);
      }
    }, 30000);
  }
};
```

---

## 🔒 SEGURANÇA E COMPLIANCE

### Headers de Segurança
```nginx
# nginx.conf para self-hosting
server {
  # Security headers
  add_header X-Frame-Options "DENY" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-XSS-Protection "1; mode=block" always;
  add_header Referrer-Policy "strict-origin-when-cross-origin" always;
  add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;" always;
  
  # GZIP compression
  gzip on;
  gzip_vary on;
  gzip_min_length 10240;
  gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
  
  # Cache static assets
  location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
  
  # No cache for service worker
  location /sw.js {
    expires -1;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
  }
}
```

### Proteção de Dados
```javascript
// src/utils/privacy.js
export const sanitizeUserData = (data) => {
  // Remove campos sensíveis dos logs
  const sensitive = ['cnpj', 'email', 'telefone'];
  const cleaned = { ...data };
  
  sensitive.forEach(field => {
    if (cleaned[field]) {
      cleaned[field] = '***REDACTED***';
    }
  });
  
  return cleaned;
};

// localStorage encryption (opcional)
import CryptoJS from 'crypto-js';

export const secureStorage = {
  set: (key, value) => {
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(value), 
      'precificalc-key'
    ).toString();
    localStorage.setItem(key, encrypted);
  },
  
  get: (key) => {
    try {
      const encrypted = localStorage.getItem(key);
      const bytes = CryptoJS.AES.decrypt(encrypted, 'precificalc-key');
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch {
      return null;
    }
  }
};
```

---

## 📊 MONITORAMENTO E OBSERVABILITY

### Analytics Setup
```javascript
// src/utils/analytics.js
import { gtag } from 'ga-gtag';

export const trackEvent = (action, category, label, value) => {
  gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value
  });
};

// Business events
export const trackPricing = (regime, valor, margem) => {
  trackEvent('calculate_price', 'pricing', regime, valor);
};

export const trackProposal = (clientType, itemCount) => {
  trackEvent('generate_proposal', 'sales', clientType, itemCount);
};
```

### Error Tracking (Sentry)
```javascript
// src/utils/errorTracking.js
import * as Sentry from '@sentry/browser';

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  
  beforeSend(event) {
    // Filter sensitive data
    if (event.user) {
      delete event.user.email;
      delete event.user.cnpj;
    }
    return event;
  }
});

export { Sentry };
```

---

## 🚀 PROCESS DE DEPLOY AUTOMATIZADO

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
    paths-ignore: ['docs/**', '*.md']

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: |
        npm run test
        npm run test:e2e
    
    - name: Build
      run: npm run build
      env:
        NODE_ENV: production
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

### Deploy Script
```bash
#!/bin/bash
# scripts/deploy.sh

set -e

echo "🚀 PrecifiCALC Deployment Started"

# Pre-flight checks
echo "📋 Running pre-flight checks..."
npm run lint
npm run test
npm run test:e2e

# Build
echo "🔨 Building application..."
npm run build

# Quality checks
echo "✅ Running quality checks..."
npm run lighthouse:ci
npm run bundle-analyzer

# Deploy
echo "🌐 Deploying to production..."
vercel --prod --confirm

echo "✨ Deployment completed successfully!"
echo "📱 App available at: https://precificalc.com.br"
```

---

## 🎯 CHECKLIST DE DEPLOYMENT

### Pré-Deploy ✅
- [ ] Todos os testes passando (unit + e2e)
- [ ] ESLint sem erros críticos
- [ ] Build limpo sem warnings
- [ ] Performance Lighthouse > 90
- [ ] PWA manifest configurado
- [ ] Service worker funcionando
- [ ] Headers de segurança configurados

### Pós-Deploy ✅
- [ ] App carregando corretamente
- [ ] PWA instalável
- [ ] Onboarding funcionando
- [ ] Cálculos tributários precisos
- [ ] localStorage persistindo
- [ ] Mobile responsivo
- [ ] Analytics configurado
- [ ] Error tracking ativo

### Monitoramento ✅
- [ ] Core Web Vitals < 2.5s LCP
- [ ] Bundle size < 5MB
- [ ] Error rate < 1%
- [ ] Uptime > 99.9%

---

## 🆘 TROUBLESHOOTING

### Build Failures
```bash
# Memory issues
export NODE_OPTIONS="--max_old_space_size=4096"
npm run build

# Dependency issues
rm -rf node_modules package-lock.json
npm install

# Cache issues
npm run clean && npm run build
```

### Performance Issues
```bash
# Bundle analysis
npm run build && npx vite-bundle-analyzer

# Memory profiling
npm run preview
# Open Chrome DevTools → Performance tab
```

### PWA Issues
```bash
# Clear service worker
# In DevTools: Application → Storage → Clear storage

# Test offline
# DevTools → Network → Offline checkbox
```

---

**Status:** ✅ Pronto para deploy de produção  
**Quality Master:** Guia validado e testado  
**Last Update:** 06/02/2026 - 02:15 (Brasília)