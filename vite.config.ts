import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves the site from /<repository>/, so every built path must start there.
  base: '/kyma-portfolio/',
  plugins: [react(), tailwindcss()],
})
