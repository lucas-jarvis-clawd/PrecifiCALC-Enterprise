import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react({
      // Otimizações React específicas
      babel: {
        plugins: [
          // Remove PropTypes em produção
          'transform-react-remove-prop-types'
        ]
      }
    }),
    VitePWA({
      registerType: 'prompt', // We'll handle the update prompt ourselves
      includeAssets: [
        'favicon-32x32.png',
        'favicon-16x16.png',
        'apple-touch-icon.png',
        'icons/*.png',
        'icons/*.svg',
      ],
      manifest: {
        name: 'PrecifiCALC - Calculadora Empresarial',
        short_name: 'PrecifiCALC',
        description: 'Calculadora profissional de precificação, impostos e gestão financeira para empresários e contadores. Simule regimes tributários, precifique serviços e gere propostas comerciais.',
        theme_color: '#4f46e5',
        background_color: '#f8fafc',
        display: 'standalone',
        orientation: 'any',
        scope: '/',
        start_url: '/',
        id: '/precificalc',
        categories: ['business', 'finance', 'productivity'],
        lang: 'pt-BR',
        dir: 'ltr',
        prefer_related_applications: false,
        icons: [
          {
            src: 'icons/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png',
          },
          {
            src: 'icons/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png',
          },
          {
            src: 'icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png',
          },
          {
            src: 'icons/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png',
          },
          {
            src: 'icons/icon-152x152.png',
            sizes: '152x152',
            type: 'image/png',
          },
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/icon-maskable-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: 'icons/icon-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        screenshots: [
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            form_factor: 'wide',
            label: 'PrecifiCALC Dashboard',
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'PrecifiCALC Mobile',
          },
        ],
        shortcuts: [
          {
            name: 'Simulador Tributário',
            short_name: 'Simulador',
            url: '/simulador',
            icons: [{ src: 'icons/icon-96x96.png', sizes: '96x96' }],
          },
          {
            name: 'Precificação',
            short_name: 'Precificar',
            url: '/precificacao',
            icons: [{ src: 'icons/icon-96x96.png', sizes: '96x96' }],
          },
          {
            name: 'Calendário Fiscal',
            short_name: 'Fiscal',
            url: '/calendario',
            icons: [{ src: 'icons/icon-96x96.png', sizes: '96x96' }],
          },
          {
            name: 'Dashboard',
            short_name: 'Dashboard',
            url: '/',
            icons: [{ src: 'icons/icon-96x96.png', sizes: '96x96' }],
          },
        ],
      },
      workbox: {
        // Cache strategies
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        
        // Runtime caching for fonts and API calls
        runtimeCaching: [
          {
            // Google Fonts stylesheets
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Google Fonts webfont files
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Images
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
        
        // Ensure navigation requests are handled
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api/],
        
        // Clean old caches on activate
        cleanupOutdatedCaches: true,
        
        // Skip waiting for faster updates
        skipWaiting: false, // We handle this via prompt
        clientsClaim: true,
      },
      
      devOptions: {
        enabled: true, // Enable PWA in dev for testing
        type: 'module',
      },
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['all'],
  },
  
  // 🚀 OTIMIZAÇÕES DE PERFORMANCE AVANÇADAS
  build: {
    // Target para maximum browser compatibility
    target: ['es2015', 'edge88', 'firefox78', 'chrome87', 'safari13'],
    
    // Otimização do chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // React ecosystem
          'vendor-react': ['react', 'react-dom'],
          
          // Charts e visualizações
          'vendor-charts': ['recharts'],
          
          // Utils e icons
          'vendor-utils': ['lucide-react'],
          
          // Data e cálculos - nosso core business
          'core-calculations': [
            './src/data/taxData.js',
            './src/data/taxData_EXPANDIDO.js', 
            './src/data/sistemaAlertasTributarios.js'
          ],
          
          // PDF e export features
          'features-export': [
            'jspdf',
            'jspdf-autotable', 
            'html2canvas',
            'xlsx',
            'file-saver'
          ],
          
          // PWA e offline
          'features-pwa': [
            'workbox-window'
          ]
        },
        
        // Nomenclatura otimizada dos chunks
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `assets/js/[name]-[hash].js`;
        },
        
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          let extType = info[info.length - 1];
          
          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)) {
            extType = 'media';
          } else if (/\.(png|jpe?g|gif|svg|ico|webp)(\?.*)?$/i.test(assetInfo.name)) {
            extType = 'images';
          } else if (/\.(css)(\?.*)?$/i.test(assetInfo.name)) {
            extType = 'css';
          } else if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name)) {
            extType = 'fonts';
          }
          
          return `assets/${extType}/[name]-[hash][extname]`;
        },
        
        // Configuração experimental para melhor tree-shaking
        generatedCode: {
          preset: 'es2015',
          symbols: true
        }
      },
      
      // Configurações avançadas do Rollup
      external: [],
      
      // Otimizações de performance
      treeshake: {
        preset: 'recommended',
        moduleSideEffects: false,
        unknownGlobalSideEffects: false
      }
    },
    
    // Configurações de otimização
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove console.logs em produção
        drop_console: true,
        drop_debugger: true,
        
        // Otimizações agressivas
        dead_code: true,
        global_defs: {
          __DEV__: false
        },
        
        // Remove comentários
        comments: false,
        
        // Otimizações específicas
        pure_funcs: ['console.log', 'console.debug', 'console.info'],
        passes: 3
      },
      
      mangle: {
        // Preservar nomes de função importantes para debugging
        keep_fnames: /^use[A-Z]/, // Preserve React hooks
        safari10: true
      },
      
      format: {
        comments: false
      }
    },
    
    // Source maps otimizados
    sourcemap: process.env.NODE_ENV === 'development' ? true : 'hidden',
    
    // Configurações do CSS
    cssCodeSplit: true,
    cssMinify: true,
    
    // Otimização de assets
    assetsInlineLimit: 4096, // 4KB inline limit
    
    // Configuração de chunks
    chunkSizeWarningLimit: 1000,
    
    // Compressão
    reportCompressedSize: true,
    
    // Configurações experimentais
    emptyOutDir: true,
    
    // Otimização da build
    write: true,
    
    // Configuração para maximum performance
    modulePreload: {
      polyfill: true
    }
  },
  
  // ⚡ OTIMIZAÇÕES DE DESENVOLVIMENTO
  optimizeDeps: {
    // Pre-bundle dependencies for faster dev startup
    include: [
      'react',
      'react-dom',
      'recharts',
      'lucide-react'
    ],
    
    // Exclude problematic deps from optimization
    exclude: [
      'workbox-window'
    ],
    
    // Force optimization of specific files
    force: false,
    
    // ESBuild optimizations
    esbuildOptions: {
      // Target modern browsers in dev
      target: 'es2020',
      
      // Remove logs in dev if needed
      drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
      
      // JSX optimizations
      jsxDev: process.env.NODE_ENV === 'development'
    }
  },
  
  // 🎯 CONFIGURAÇÃO DE RESOLUÇÃO
  resolve: {
    // Alias para imports mais limpos
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@pages': '/src/pages', 
      '@data': '/src/data',
      '@utils': '/src/utils',
      '@hooks': '/src/hooks',
      '@services': '/src/services'
    },
    
    // Extensões que o Vite deve resolver
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    
    // Configuração para melhor resolução de modules
    dedupe: ['react', 'react-dom']
  },
  
  // 🔧 CONFIGURAÇÕES AVANÇADAS DO ESBuild
  esbuild: {
    // Remove console em produção via esbuild
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    
    // Configurações de JSX
    jsxInject: `import React from 'react'`,
    
    // Configuração de target
    target: 'es2020',
    
    // Configurações de legal comments
    legalComments: 'none'
  },
  
  // 📊 PREVIEW CONFIGURATION
  preview: {
    port: 4173,
    host: '0.0.0.0',
    strictPort: false
  },
  
  // 🎨 CSS CONFIGURATION  
  css: {
    postcss: {
      plugins: [
        // TailwindCSS já configurado
      ]
    },
    
    // Configurações do CSS modules se necessário
    modules: {
      // Configuração para CSS modules
      localsConvention: 'camelCaseOnly'
    },
    
    // Preprocessor options
    preprocessorOptions: {
      scss: {
        // Configurações SCSS se necessário
      }
    },
    
    devSourcemap: true
  },
  
  // 🚀 CONFIGURAÇÕES EXPERIMENTAIS
  experimental: {
    // Renderização otimizada
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === 'js') {
        return { runtime: `window.__toCdnUrl(${JSON.stringify(filename)})` }
      } else {
        return { relative: true }
      }
    }
  },
  
  // 🔍 DEFINE GLOBAL CONSTANTS
  define: {
    __VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development')
  }
})
