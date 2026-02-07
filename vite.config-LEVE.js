import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// CONFIGURAÇÃO LEVE - Carregamento Rápido
export default defineConfig({
  plugins: [
    react()
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  
  build: {
    // Configuração simples e rápida
    target: 'es2015',
    minify: 'terser',
    
    rollupOptions: {
      output: {
        // Chunks simples
        manualChunks: {
          vendor: ['react', 'react-dom']
        }
      }
    },
    
    // Sem source maps para produção (mais rápido)
    sourcemap: false,
    
    // Chunks menores
    chunkSizeWarningLimit: 500
  },
  
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
})