import { defineConfig } from 'vite'

export default defineConfig({
  base: '/ctrl-dict/',
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        admin: 'admin.html',
      }
    }
  }
})