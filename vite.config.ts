import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [dts()],

  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'ImportExportPlugin',
      formats: ['es'],
      fileName: 'index.js'
    },
    rollupOptions: {
      external: ['@tweakpane/core'],
      output: {
        globals: {
          '@tweakpane/core': 'Tweakpane'
        }
      }
    }
  }
})
