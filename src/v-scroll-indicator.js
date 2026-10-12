import { defineComponent, reactive, ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue-demi'
import { node } from './render'
import { injectStyles } from './styles'
import { axisOf, measure, stepFor } from './geometry'

const EDGES = {
  vertical: { start: 'up', end: 'down', reachStart: 'reach-top', reachEnd: 'reach-bottom' },
  horizontal: { start: 'left', end: 'right', reachStart: 'reach-left', reachEnd: 'reach-right' },
}

function prefersReducedMotion(win) {
  return Boolean(win && win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches)
}

export default defineComponent({
  name: 'VScrollIndicator',

  props: {
    height: { type: String, default: null },
    direction: {
      type: String,
      default: 'vertical',
      validator: (value) => value in EDGES,
    },
    up: { type: String, default: '↥' },
    down: { type: String, default: '↧' },
    left: { type: String, default: '↤' },
    right: { type: String, default: '↦' },
    scrollOnClick: { type: Boolean, default: true },
    scrollStep: {
      type: Number,
      default: 0.9,
      validator: (value) => value > 0 && value <= 1,
    },
    smooth: { type: Boolean, default: true },
  },

  emits: ['reach-top', 'reach-bottom', 'reach-left', 'reach-right'],

  setup(props, { slots, emit }) {
    const content = ref(null)
    const inner = ref(null)
    const state = reactive({ scrollable: false, atStart: true, atEnd: true })
    let observer = null
    let onWindowResize = null

    function update({ fromScroll = false } = {}) {
      const el = content.value
      if (!el) return
      const next = measure(el, props.direction)
      if (fromScroll && next.scrollable) {
        const edges = EDGES[props.direction]
        if (next.atStart && !state.atStart) emit(edges.reachStart)
        if (next.atEnd && !state.atEnd) emit(edges.reachEnd)
      }
      Object.assign(state, next)
    }

    function scrollTowards(sign) {
      const el = content.value
      if (!el || !props.scrollOnClick || !state.scrollable) return
      const delta = stepFor(el, props.direction, props.scrollStep, sign)
      const behavior = props.smooth && !prefersReducedMotion(el.ownerDocument.defaultView) ? 'smooth' : 'auto'
      if (typeof el.scrollBy === 'function') {
        el.scrollBy({ ...delta, behavior })
      } else {
        el.scrollTop += delta.top
        el.scrollLeft += delta.left
      }
    }

    onMounted(() => {
      const el = content.value
      injectStyles(el.ownerDocument)
      const win = el.ownerDocument.defaultView
      // The content box keeps its size while children grow, so the inner
      // wrapper is observed too: its size changes whenever the slot does.
      if (win && typeof win.ResizeObserver === 'function') {
        observer = new win.ResizeObserver(() => update())
        observer.observe(el)
        observer.observe(inner.value)
      } else if (win) {
        onWindowResize = () => update()
        win.addEventListener('resize', onWindowResize)
      }
      update()
    })

    onBeforeUnmount(() => {
      if (observer) observer.disconnect()
      if (onWindowResize) content.value.ownerDocument.defaultView.removeEventListener('resize', onWindowResize)
      observer = null
      onWindowResize = null
    })

    watch(() => [props.direction, props.height], () => nextTick(() => update()))

    function indicator(edge, sign, active) {
      const label = props[edge]
      const classes = {
        'v-scroll-indicator__indicator': true,
        [`v-scroll-indicator__indicator--${edge}`]: true,
        'v-scroll-indicator__indicator--hidden': !state.scrollable,
        'v-scroll-indicator__indicator--active': state.scrollable && active,
        'v-scroll-indicator__indicator--clickable': props.scrollOnClick,
      }
      return node('div', {
        class: classes,
        // A visual affordance only: keyboard and screen reader users scroll
        // the content region itself, which is focusable.
        attrs: { 'aria-hidden': 'true', 'data-edge': edge },
        on: { click: () => scrollTowards(sign) },
      }, slots[edge] ? slots[edge]({ active }) : label)
    }

    return () => {
      axisOf(props.direction)
      const edges = EDGES[props.direction]
      return node('div', {
        class: ['v-scroll-indicator', `v-scroll-indicator--${props.direction}`],
        style: props.height ? { height: props.height } : undefined,
      }, [
        indicator(edges.start, -1, !state.atStart),
        node('div', {
          class: 'v-scroll-indicator__content',
          attrs: { tabindex: '0' },
          on: { scroll: () => update({ fromScroll: true }) },
          ref: content,
        }, [
          node('div', { class: 'v-scroll-indicator__inner', ref: inner }, slots.default ? slots.default() : []),
        ]),
        indicator(edges.end, 1, !state.atEnd),
      ])
    }
  },
})
