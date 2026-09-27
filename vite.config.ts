import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Served by GitHub Pages at ritikadas.in/architect/
export default defineConfig({
  base: '/architect/',
  plugins: [react()],
})
