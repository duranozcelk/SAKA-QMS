import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    // Environment variables'ı yükle
    const env = loadEnv(mode, process.cwd(), '')

    return {
        plugins: [react()],

        server: {
            port: 5173,
            // Proxy sadece development modunda çalışır
            proxy: mode === 'development' ? {
                '/api': {
                    target: env.VITE_API_URL || 'http://localhost:8000',
                    changeOrigin: true,
                }
            } : undefined
        },

        // Environment variables'ı client'a expose et
        define: {
            'import.meta.env.VITE_API_URL': JSON.stringify(
                env.VITE_API_URL || 'http://localhost:8000'
            ),
        },

        // Build options
        build: {
            outDir: 'dist',
            sourcemap: mode === 'development',
            minify: mode === 'production' ? 'esbuild' : false,
        }
    }
})
