import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// Keep the browser's Host header so the API can validate same-origin submissions.
export default defineConfig({ plugins: [react()], server: { proxy: { '/api': { target: 'http://127.0.0.1:3001', changeOrigin: false }, '/uploads': { target: 'http://127.0.0.1:3001', changeOrigin: false } } } })
