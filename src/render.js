import { h, isVue2 } from 'vue-demi'

// Vue 2 takes attributes, listeners and refs inside nested `attrs` and `on`
// objects, while Vue 3 takes them flat with `on*` listener names. Callers
// describe a node once and this builds the shape the running Vue expects.
export function node(tag, { class: cls, style, attrs = {}, on = {}, ref } = {}, children) {
  if (isVue2) {
    return h(tag, { class: cls, style, attrs, on, ref }, children)
  }
  const listeners = {}
  for (const [event, handler] of Object.entries(on)) {
    listeners['on' + event[0].toUpperCase() + event.slice(1)] = handler
  }
  return h(tag, { class: cls, style, ref, ...attrs, ...listeners }, children)
}
