import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Windows-local app prototype: built for static/local hosting (no network assets).
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})