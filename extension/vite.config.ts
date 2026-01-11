import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, readdirSync, existsSync } from 'fs'

// Plugin to copy static files after build
function copyStaticFiles() {
  return {
    name: 'copy-static-files',
    closeBundle() {
      // Copy manifest.json
      copyFileSync(
        resolve(__dirname, 'public/manifest.json'),
        resolve(__dirname, 'dist/manifest.json')
      )

      // Copy icons
      const iconsDir = resolve(__dirname, 'public/icons')
      const distIconsDir = resolve(__dirname, 'dist/icons')

      if (existsSync(iconsDir)) {
        if (!existsSync(distIconsDir)) {
          mkdirSync(distIconsDir, { recursive: true })
        }
        readdirSync(iconsDir).forEach((file) => {
          copyFileSync(
            resolve(iconsDir, file),
            resolve(distIconsDir, file)
          )
        })
      }

      console.log('✓ Static files copied to dist/')
    },
  }
}

export default defineConfig(() => ({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
    copyStaticFiles(),
  ],
  mode: 'production',
  esbuild: {
    // Ensure production JSX transform
    jsx: 'automatic',
    jsxDev: false,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: 'terser',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'index.html'),
        background: resolve(__dirname, 'src/background/index.ts'),
        content: resolve(__dirname, 'src/content/recorder.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background') {
            return 'src/background/index.js'
          }
          if (chunkInfo.name === 'content') {
            return 'src/content/recorder.js'
          }
          return '[name].js'
        },
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
    terserOptions: {
      compress: {
        drop_console: false,
      },
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
}))
