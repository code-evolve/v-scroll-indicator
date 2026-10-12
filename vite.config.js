import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

const header = readFileSync(resolve(__dirname, 'LICENSE_HEADER.txt'), 'utf8').trimEnd()
const banner = '/*!\n' + header.split('\n').map((line) => (' * ' + line).trimEnd()).join('\n') + '\n */'

// Prepended after minification, which would otherwise strip it, so every
// published bundle carries the licence header.
const licenseBanner = {
  name: 'license-banner',
  enforce: 'post',
  generateBundle(_options, bundle) {
    for (const chunk of Object.values(bundle)) {
      if (chunk.type === 'chunk') chunk.code = banner + '\n' + chunk.code
    }
  },
}

// Two builds from one config: `vite build` writes the ES module for bundlers,
// and `vite build --mode umd` writes the script-tag build, whose entry exposes
// the plugin as a single global.
export default defineConfig(({ mode }) => {
  const umd = mode === 'umd'
  return {
    plugins: [licenseBanner],
    build: {
      emptyOutDir: !umd,
      minify: umd,
      lib: umd
        ? { entry: resolve(__dirname, 'src/browser.js'), name: 'VScrollIndicator', formats: ['umd'], fileName: () => 'v-scroll-indicator.umd.js' }
        : { entry: resolve(__dirname, 'src/index.js'), formats: ['es', 'cjs'], fileName: (format) => (format === 'es' ? 'v-scroll-indicator.mjs' : 'v-scroll-indicator.cjs') },
      rollupOptions: {
        external: ['vue', 'vue-demi'],
        output: {
          exports: umd ? 'default' : 'named',
          globals: { vue: 'Vue', 'vue-demi': 'VueDemi' },
        },
      },
    },
  }
})
