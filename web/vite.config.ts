import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Dev only: `VITE_API_PROXY` is the deployed API. The API only accepts the production origin, so the proxy
  // forwards `/ask` without the browser's Origin header. Set `VITE_API_URL` to this dev server's address.
  const target = loadEnv(mode, process.cwd(), 'VITE_').VITE_API_PROXY
  return {
    plugins: [react()],
    server: {
      proxy: target
        ? {
            '/ask': {
              target,
              changeOrigin: true,
              configure: (proxy) => proxy.on('proxyReq', (request) => request.removeHeader('origin')),
            },
          }
        : undefined,
    },
  }
})
