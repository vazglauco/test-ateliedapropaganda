/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    css: false,
    testTimeout: 20_000,
    env: {
      VITE_CANDIDATO_CODE: 'codigo-de-teste',
      VITE_API_URL: 'https://api.teste.local/',
    },
  },
})
