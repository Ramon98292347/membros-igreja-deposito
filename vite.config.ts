import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "127.0.0.1",
    port: 3000,
    strictPort: false,
    // Desabilitar HMR completamente para evitar problemas de timeout
    hmr: false,
    // CORS básico
    cors: true,
    // Sistema de arquivos permissivo
    fs: {
      strict: false,
    },
    // Headers básicos
    headers: {
      "Cache-Control": "no-cache",
    },
    // Sem configurações complexas
    open: true,
    // Timeout longo
    timeout: 300000, // 5 minutos
    // Watch básico
    watch: {
      usePolling: false,
    },
  },
  plugins: [
    react({
      // Configurações corretas do React SWC
      jsxRuntime: "automatic",
    }),
    // Desabilitar componentTagger em desenvolvimento para evitar problemas
    mode !== 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    global: 'globalThis',
  },
  build: {
    target: 'es2015',
    minify: 'esbuild',
    sourcemap: false,
    // Build simples
    rollupOptions: {
      output: {
        manualChunks: undefined,
      }
    }
  },
  // Otimizações mínimas
  optimizeDeps: {
    include: [
      'react',
      'react-dom'
    ],
    force: false,
  },
  preview: {
    port: 3000,
    host: "127.0.0.1",
    cors: true
  },
  // Log básico
  logLevel: 'error',
  clearScreen: true,
  // Configurações básicas
  base: "/",
  publicDir: "public",
}));