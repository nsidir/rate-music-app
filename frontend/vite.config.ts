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
      proxy: {
        '/api': {
          target: `http://localhost:${process.env.VITE_PORT}`,
          changeOrigin: true,
        },
      },
    },
  })
}