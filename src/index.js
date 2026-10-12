import VScrollIndicator from './v-scroll-indicator'

export { VScrollIndicator }

// `Vue.use(plugin)` on Vue 2 and `app.use(plugin)` on Vue 3 both call
// `install` with an object that has `component`.
export default {
  install(app) {
    app.component('VScrollIndicator', VScrollIndicator)
  },
}
