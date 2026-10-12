import plugin, { VScrollIndicator } from './index'

// The script-tag build exposes one global, `VScrollIndicator`, that is the
// plugin itself, so `Vue.use(VScrollIndicator)` and `app.use(VScrollIndicator)`
// work as they did in 0.1.x. The component rides along on the same object.
export default Object.assign({}, plugin, { VScrollIndicator })
