// frontend/vite.config.ts
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default ({ mode }: { mode: string }) => {

  const env = loadEnv(mode, '..', '');
  
  process.env = {...process.env, ...env};

  return defineConfig({
    base: '/',
    envDir: '..',
    plugins: [vue()],
  server: {
    host: true,
    port: 4960,
    allowedHosts: ['rate-music-app.onrender.com'],
    proxy: {
      '/api': {
        target: `http://${process.env.VITE_API_IP}:${process.env.VITE_PORT}`,
        changeOrigin: true,
      },
    },
  },
  })
}