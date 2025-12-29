import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: 'src/main/index.ts',
        onstart(options) {
          options.startup();
        },
        vite: {
          build: {
            outDir: 'dist-electron/main',
            rollupOptions: {
              external: ['electron', 'fluent-ffmpeg', 'ffmpeg-static', 'electron-squirrel-startup'],
              output: {
                format: 'es',
                entryFileNames: '[name].js'
              }
            }
          }
        }
      },
      {
        entry: 'src/preload/index.js',
        onstart(options) {
          options.reload();
        },
        vite: {
          build: {
            outDir: 'dist-electron/preload',
            minify: false,
            emptyOutDir: false,
            rollupOptions: {
              output: {
                format: 'cjs',
                entryFileNames: '[name].js'
              }
            }
          }
        }
      }
    ])
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        control: resolve(__dirname, 'src/renderer/control/index.html'),
        overlay: resolve(__dirname, 'src/renderer/overlay/index.html'),
        webcam: resolve(__dirname, 'src/renderer/webcam/index.html'),
        editor: resolve(__dirname, 'src/renderer/editor/index.html')
      }
    }
  },
  resolve: {
    alias: {
      '@shared': resolve(__dirname, 'src/shared'),
      '@main': resolve(__dirname, 'src/main'),
      '@renderer': resolve(__dirname, 'src/renderer'),
      '@preload': resolve(__dirname, 'src/preload')
    }
  },
  server: {
    port: 5173,
    strictPort: true
  }
});
