import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/dados': 'http://localhost:8080',
      '/mapa': 'http://localhost:8080',
      '/regioes': 'http://localhost:8080',
      '/indicadores': 'http://localhost:8080',
    },
  },
});
