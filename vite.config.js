import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: ['aefbb21f348f.ngrok-free.app','web-8rnicojgsprk.up-de-fra1-k8s-1.apps.run-on-seenode.com'] // Replace with your actual Ngrok subdomain
  }
})
