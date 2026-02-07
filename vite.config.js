import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

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
        
        // Remove comentários via drop_console instead of comments option
        
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
        // Remove comments in format options
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
    
    exclude: [],
    
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
