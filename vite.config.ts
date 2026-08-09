import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base: './' makes the build work on GitHub Pages (sub-folder hosting) too.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  server: {
    watch: {
      // The Freebuff desktop app writes its own sqlite WAL here constantly;
      // watching it would reload the page every few seconds.
      ignored: ['**/.freebuff/**'],
    },
  },
})
