import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue-demi'
import plugin, { VScrollIndicator } from '../src/index'
import { classes, mount, setGeometry } from './mount'

const TALL = { scrollHeight: 300, clientHeight: 100 }
const WIDE = { scrollWidth: 300, clientWidth: 100 }

let mounted
async function render(options) {
  mounted = await mount(options)
  return mounted
}

afterEach(() => {
  if (mounted) mounted.unmount()
  mounted = null
  document.body.innerHTML = ''
})

describe('indicator visibility', () => {
  it('hides both indicators when the content does not overflow', async () => {
    const view = await render({ props: { height: '100px' } })
    await view.scroll({ scrollHeight: 100, clientHeight: 100 })
    expect(classes(view.indicator('up')), 'up is hidden').toContain('v-scroll-indicator__indicator--hidden')
    expect(classes(view.indicator('down')), 'down is hidden').toContain('v-scroll-indicator__indicator--hidden')
  })

  it('shows only the bottom indicator at the start', async () => {
    const view = await render()
    await view.scroll({ ...TALL, scrollTop: 0 })
    expect(classes(view.indicator('up')), 'up is inactive').not.toContain('v-scroll-indicator__indicator--active')
    expect(classes(view.indicator('down')), 'down is active').toContain('v-scroll-indicator__indicator--active')
  })

  it('shows both indicators in the middle', async () => {
    const view = await render()
    await view.scroll({ ...TALL, scrollTop: 100 })
    expect(classes(view.indicator('up')), 'up is active').toContain('v-scroll-indicator__indicator--active')
    expect(classes(view.indicator('down')), 'down is active').toContain('v-scroll-indicator__indicator--active')
  })

  it('treats a fractional position short of the end as the end', async () => {
    const view = await render()
    await view.scroll({ ...TALL, scrollTop: 199.4 })
    expect(classes(view.indicator('down')), 'down is inactive at the end').not.toContain('v-scroll-indicator__indicator--active')
  })

  it('updates when the content changes size without scrolling', async () => {
    const view = await render()
    await view.scroll({ scrollHeight: 100, clientHeight: 100 })
    expect(classes(view.indicator('down')), 'hidden before growing').toContain('v-scroll-indicator__indicator--hidden')
    setGeometry(view.content, TALL)
    window.dispatchEvent(new Event('resize'))
    await nextTick()
    expect(classes(view.indicator('down')), 'active after growing').toContain('v-scroll-indicator__indicator--active')
  })
})

describe('reach events', () => {
  it('emits reach-bottom once on arriving at the end, and reach-top on returning', async () => {
    const onBottom = vi.fn()
    const onTop = vi.fn()
    const view = await render({ listeners: { 'reach-bottom': onBottom, 'reach-top': onTop } })
    await view.scroll({ ...TALL, scrollTop: 0 })
    await view.scroll({ ...TALL, scrollTop: 200 })
    await view.scroll({ ...TALL, scrollTop: 200 })
    expect(onBottom, 'reach-bottom fires once').toHaveBeenCalledTimes(1)
    await view.scroll({ ...TALL, scrollTop: 0 })
    expect(onTop, 'reach-top fires on return').toHaveBeenCalledTimes(1)
  })

  it('emits reach-right for horizontal scrolling', async () => {
    const onRight = vi.fn()
    const view = await render({ props: { direction: 'horizontal' }, listeners: { 'reach-right': onRight } })
    await view.scroll({ ...WIDE, scrollLeft: 0 })
    await view.scroll({ ...WIDE, scrollLeft: 200 })
    expect(onRight, 'reach-right fires').toHaveBeenCalledTimes(1)
  })
})

describe('click to scroll', () => {
  it('scrolls by the step fraction of the visible height', async () => {
    const view = await render({ props: { scrollStep: 0.5 } })
    await view.scroll({ ...TALL, scrollTop: 0 })
    const scrollBy = vi.fn()
    view.content.scrollBy = scrollBy
    view.indicator('down').click()
    expect(scrollBy, 'scrolls down half a page').toHaveBeenCalledWith({ top: 50, left: 0, behavior: 'smooth' })
  })

  it('scrolls without smoothing when smooth is off', async () => {
    const view = await render({ props: { smooth: false } })
    await view.scroll({ ...TALL, scrollTop: 100 })
    const scrollBy = vi.fn()
    view.content.scrollBy = scrollBy
    view.indicator('up').click()
    expect(scrollBy, 'scrolls up without smoothing').toHaveBeenCalledWith({ top: -90, left: 0, behavior: 'auto' })
  })

  it('does nothing when scrollOnClick is off', async () => {
    const view = await render({ props: { scrollOnClick: false } })
    await view.scroll({ ...TALL, scrollTop: 0 })
    const scrollBy = vi.fn()
    view.content.scrollBy = scrollBy
    view.indicator('down').click()
    expect(scrollBy, 'no scroll').not.toHaveBeenCalled()
  })

  it('scrolls horizontally', async () => {
    const view = await render({ props: { direction: 'horizontal' } })
    await view.scroll({ ...WIDE, scrollLeft: 0 })
    const scrollBy = vi.fn()
    view.content.scrollBy = scrollBy
    view.indicator('right').click()
    expect(scrollBy, 'scrolls right').toHaveBeenCalledWith({ top: 0, left: 90, behavior: 'smooth' })
  })
})

describe('indicator content', () => {
  it('renders label props as text, never as markup', async () => {
    const view = await render({ props: { down: '<img src=x onerror=alert(1)>' } })
    expect(view.indicator('down').textContent, 'label is literal text').toBe('<img src=x onerror=alert(1)>')
    expect(view.indicator('down').querySelector('img'), 'no element was created').toBeNull()
  })

  it('uses a named slot in place of the label, passing whether it is active', async () => {
    const view = await render({
      slots: { down: (h, { active }) => h('span', { class: 'custom' }, active ? 'more' : 'end') },
    })
    await view.scroll({ ...TALL, scrollTop: 0 })
    expect(view.indicator('down').querySelector('.custom').textContent, 'slot content while active').toBe('more')
    await view.scroll({ ...TALL, scrollTop: 200 })
    expect(view.indicator('down').querySelector('.custom').textContent, 'slot content at the end').toBe('end')
  })

  it('uses arrow defaults for each direction', async () => {
    const view = await render({ props: { direction: 'horizontal' } })
    expect(view.indicator('left').textContent, 'left arrow').toBe('↤')
    expect(view.indicator('right').textContent, 'right arrow').toBe('↦')
  })
})

describe('layout and accessibility', () => {
  it('applies height and follows changes to it', async () => {
    const view = await render({ props: { height: '2in' } })
    expect(view.root.style.height, 'initial height').toBe('2in')
    view.state.height = '3in'
    await nextTick()
    expect(view.root.style.height, 'updated height').toBe('3in')
  })

  it('makes the content focusable and hides the indicators from assistive technology', async () => {
    const view = await render()
    expect(view.content.getAttribute('tabindex'), 'content is focusable').toBe('0')
    expect(view.indicator('up').getAttribute('aria-hidden'), 'up is hidden from AT').toBe('true')
    expect(view.indicator('down').getAttribute('aria-hidden'), 'down is hidden from AT').toBe('true')
  })

  it('injects its stylesheet once per document', async () => {
    await render()
    mounted.unmount()
    mounted = await mount()
    expect(document.querySelectorAll('#v-scroll-indicator-styles').length, 'one style element').toBe(1)
  })
})

describe('plugin', () => {
  it('registers the component on install', () => {
    const app = { component: vi.fn() }
    plugin.install(app)
    expect(app.component, 'registered by name').toHaveBeenCalledWith('VScrollIndicator', VScrollIndicator)
  })
})
