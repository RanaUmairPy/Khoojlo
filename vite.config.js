import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: ['aefbb21f348f.ngrok-free.app'] // Replace with your actual Ngrok subdomain
  }
})
