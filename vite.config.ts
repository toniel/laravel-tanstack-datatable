import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
      outDir: 'dist',
      include: ['src/**/*.ts', 'src/**/*.vue'],
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'LaravelTanstackDatatable',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`
    },
    rollupOptions: {
      external: [
        'vue',
        '@tanstack/vue-query',
        '@tanstack/vue-table',
        '@toniel/laravel-tanstack-pagination',
        'radix-vue',
        'class-variance-authority',
        'clsx',
        'tailwind-merge',
        'lucide-vue-next'
      ],
      output: {
        globals: {
          vue: 'Vue',
          '@tanstack/vue-query': 'VueQuery',
          '@tanstack/vue-table': 'VueTable',
          '@toniel/laravel-tanstack-pagination': 'LaravelTanstackPagination'
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'style.css'
          return assetInfo.name || ''
        }
      }
    },
    cssCodeSplit: false
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
})
