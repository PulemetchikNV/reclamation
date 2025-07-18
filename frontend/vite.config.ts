import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const FRONTEND_PORT = parseInt(env.FRONTEND_PORT || '8080')

  return {
    plugins: [vue()],
    server: {
      host: '0.0.0.0',
      port: FRONTEND_PORT,
    },
    preview: {
      host: '0.0.0.0',
      port: FRONTEND_PORT,
    },
  }
})
