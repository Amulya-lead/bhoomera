import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

function servePublicHtml(): Plugin {
  return {
    name: 'serve-public-html',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url || (req.method !== 'GET' && req.method !== 'HEAD')) return next()
        const urlPath = req.url.split('?')[0].split('#')[0]
        if (urlPath === '/' || urlPath.startsWith('/api') || urlPath.startsWith('/uploads') || urlPath.startsWith('/@') || urlPath.startsWith('/src')) {
          return next()
        }
        const clean = decodeURIComponent(urlPath.replace(/^\//, '').replace(/\/$/, ''))
        const publicDir = path.resolve(process.cwd(), 'public')
        
        // 1. Check directory index: public/${clean}/index.html
        const dirHtml = path.join(publicDir, clean, 'index.html')
        if (fs.existsSync(dirHtml) && fs.statSync(dirHtml).isFile()) {
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          return res.end(fs.readFileSync(dirHtml, 'utf8'))
        }

        // 2. Check flat file: public/${clean}.html
        const directHtml = path.join(publicDir, `${clean}.html`)
        if (fs.existsSync(directHtml) && fs.statSync(directHtml).isFile()) {
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          return res.end(fs.readFileSync(directHtml, 'utf8'))
        }

        next()
      })
    }
  }
}

// Keep the browser's Host header so the API can validate same-origin submissions.
export default defineConfig({
  plugins: [react(), servePublicHtml()],
  server: {
    proxy: {
      '/api': { target: 'http://127.0.0.1:3001', changeOrigin: false },
      '/uploads': { target: 'http://127.0.0.1:3001', changeOrigin: false }
    }
  }
})
