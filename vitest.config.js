import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

// VUE_VERSION picks the Vue the suite runs against. It is required, with no
// default, so a run can never silently test one version while claiming the other.
const version = process.env.VUE_VERSION
if (version !== '2' && version !== '3') {
  throw new Error(`VUE_VERSION must be "2" or "3", got ${JSON.stringify(version)}`)
}

const modules = resolve(__dirname, 'node_modules')
const alias = version === '2'
  ? {
      vue: resolve(modules, 'vue2/dist/vue.runtime.esm.js'),
      'vue-demi': resolve(modules, 'vue-demi/lib/v2.7/index.mjs'),
    }
  : {
      vue: resolve(modules, 'vue/dist/vue.runtime.esm-bundler.js'),
      'vue-demi': resolve(modules, 'vue-demi/lib/v3/index.mjs'),
    }

export default defineConfig({
  resolve: { alias },
  define: {
    __VUE_OPTIONS_API__: 'true',
    __VUE_PROD_DEVTOOLS__: 'false',
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
  },
  test: {
    environment: 'jsdom',
    include: ['test/**/*.test.js'],
    server: { deps: { inline: ['vue-demi'] } },
  },
})
