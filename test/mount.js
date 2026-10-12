import * as Vue from 'vue'
import { isVue2, nextTick } from 'vue-demi'
import { VScrollIndicator } from '../src/index'

// Scroll geometry does not exist in jsdom, so each test states it. Values set
// here are what the component reads when it measures the content element.
export function setGeometry(el, { scrollTop = 0, scrollLeft = 0, scrollHeight = 0, clientHeight = 0, scrollWidth = 0, clientWidth = 0 }) {
  const define = (name, value) => Object.defineProperty(el, name, { configurable: true, writable: true, value })
  define('scrollTop', scrollTop)
  define('scrollLeft', scrollLeft)
  define('scrollHeight', scrollHeight)
  define('clientHeight', clientHeight)
  define('scrollWidth', scrollWidth)
  define('clientWidth', clientWidth)
}

// Mounts the component under the running Vue with a render function, so the
// same test works against Vue 2 and Vue 3 without either template compiler.
// Each slot is `(h, slotProps) => vnode`, given the running Vue's `h`.
export async function mount({ props = {}, listeners = {}, slots = {}, children = 'content' } = {}) {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const state = Vue.reactive ? Vue.reactive({ ...props }) : props

  let unmount
  if (isVue2) {
    const vm = new Vue.default({
      data: () => ({ state }),
      render(h) {
        const scopedSlots = {}
        for (const [name, slot] of Object.entries(slots)) scopedSlots[name] = (slotProps) => slot(h, slotProps)
        return h(VScrollIndicator, {
          props: this.state,
          on: listeners,
          scopedSlots,
        }, [children])
      },
    }).$mount(host)
    unmount = () => vm.$destroy()
  } else {
    const handlers = {}
    for (const [event, handler] of Object.entries(listeners)) {
      handlers['on' + event.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join('')] = handler
    }
    const slotFns = { default: () => children }
    for (const [name, slot] of Object.entries(slots)) slotFns[name] = (slotProps) => slot(Vue.h, slotProps)
    const app = Vue.createApp({
      render: () => Vue.h(VScrollIndicator, { ...state, ...handlers }, slotFns),
    })
    app.mount(host)
    unmount = () => app.unmount()
  }
  await nextTick()

  const root = document.body.querySelector('.v-scroll-indicator')
  const content = root.querySelector('.v-scroll-indicator__content')
  return {
    root,
    content,
    state,
    unmount,
    indicator: (edge) => root.querySelector(`[data-edge="${edge}"]`),
    async scroll(geometry) {
      setGeometry(content, geometry)
      content.dispatchEvent(new Event('scroll'))
      await nextTick()
    },
  }
}

export function classes(el) {
  return [...el.classList]
}
