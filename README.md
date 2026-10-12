# v-scroll-indicator

A Vue component that wraps content in a scrollable area and shows an indicator at each edge where
more content is hidden. It works with **Vue 2.7 and Vue 3** from the same package, through
[vue-demi](https://github.com/vueuse/vue-demi).

- Indicators appear only when the content overflows, and fade in and out as you scroll.
- They follow the content as it changes size, including content added or removed after mounting.
- Click an indicator to scroll by a page.
- `reach-top` and `reach-bottom` events, for infinite loading.
- Vertical or horizontal scrolling.
- Custom indicator content through named slots.
- Theming through CSS custom properties.

Source and issues: [github.com/code-evolve/v-scroll-indicator](https://github.com/code-evolve/v-scroll-indicator)

# Install

```bash
npm install v-scroll-indicator
```

`vue` is a peer dependency: `^2.7.0 || ^3.0.0`. Vue 2.6 and earlier are not supported.

## Vue 3

```js
import { createApp } from 'vue'
import VScrollIndicatorPlugin from 'v-scroll-indicator'

createApp(App).use(VScrollIndicatorPlugin).mount('#app')
```

## Vue 2.7

```js
import Vue from 'vue'
import VScrollIndicatorPlugin from 'v-scroll-indicator'

Vue.use(VScrollIndicatorPlugin)
```

## Registering the component locally

```js
import { VScrollIndicator } from 'v-scroll-indicator'

export default {
  components: { VScrollIndicator },
}
```

## Browser, without a bundler

Load Vue, then vue-demi, then this package. The script exposes one global, `VScrollIndicator`, which
is the plugin.

```html
<script src="https://unpkg.com/vue@3"></script>
<script src="https://unpkg.com/vue-demi@0.14"></script>
<script src="https://unpkg.com/v-scroll-indicator"></script>
<script>
  Vue.createApp({}).use(VScrollIndicator).mount('#app')   // Vue 3
  // Vue.use(VScrollIndicator); new Vue({ el: '#app' })   // Vue 2.7
</script>
```

# Usage

The component needs a height. Set it with the `height` prop, or let a parent with a fixed height size it.

```html
<v-scroll-indicator height="2in" @reach-bottom="loadMore">
  <div v-for="item in items" :key="item.id">{{ item.name }}</div>
</v-scroll-indicator>
```

If the content does not overflow, no indicators are shown.

# Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `height` | String | none | CSS height of the whole component, including the indicators. Reactive. |
| `direction` | String | `'vertical'` | `'vertical'` or `'horizontal'`. |
| `up`, `down` | String | `↥`, `↧` | Text for the vertical indicators. Rendered as text, never as HTML. |
| `left`, `right` | String | `↤`, `↦` | Text for the horizontal indicators. Rendered as text, never as HTML. |
| `scrollOnClick` | Boolean | `true` | Clicking an indicator scrolls towards it. |
| `scrollStep` | Number | `0.9` | How far one click scrolls, as a fraction of the visible size (greater than 0, up to 1). |
| `smooth` | Boolean | `true` | Smooth scrolling on click. It is always off when the user prefers reduced motion. |

# Events

| Event | When |
|---|---|
| `reach-top` / `reach-bottom` | Vertical scrolling arrives at the start or the end. |
| `reach-left` / `reach-right` | Horizontal scrolling arrives at the start or the end. |

Each event fires once on arrival, not on every scroll event while the content stays at that edge.

# Slots

| Slot | Props | Replaces |
|---|---|---|
| default | none | the scrollable content |
| `up`, `down`, `left`, `right` | `{ active }` | the content of that indicator |

```html
<v-scroll-indicator height="10rem">
  <template #down="{ active }">{{ active ? 'More below' : '' }}</template>
  ...
</v-scroll-indicator>
```

# Styling

The indicators are clear glass. They float over the edges of the content, so the content scrolls
underneath and shows through them blurred, with almost no tint. While inactive they are invisible and let clicks
through to the content. Where `backdrop-filter` is unsupported, or the user prefers reduced
transparency, they fall back to a near-opaque background.

Set these custom properties on the component, or on any ancestor:

| Property | Default |
|---|---|
| `--v-scroll-indicator-background` | `rgba(255, 255, 255, 0.08)`, the glass tint |
| `--v-scroll-indicator-blur` | `5px`, how far out of focus the content behind is |
| `--v-scroll-indicator-border` | `rgba(255, 255, 255, 0.35)`, the inner edge line |
| `--v-scroll-indicator-shadow` | `none` |
| `--v-scroll-indicator-text-shadow` | `0 0 6px rgba(255, 255, 255, 0.9)`, keeps the arrow readable over the content |
| `--v-scroll-indicator-background-solid` | `rgba(255, 255, 255, 0.92)`, used when there is no blur |
| `--v-scroll-indicator-size` | `2em`, the indicator's thickness |
| `--v-scroll-indicator-color` | `#1f2937` |
| `--v-scroll-indicator-font-size` | `1.15em` |
| `--v-scroll-indicator-font-weight` | `700` |
| `--v-scroll-indicator-transition` | `opacity 0.3s` |
| `--v-scroll-indicator-cursor` | `pointer` |

Light arrows over dark content, for example:

```css
.my-list {
  --v-scroll-indicator-color: #fff;
  --v-scroll-indicator-background: rgba(15, 23, 42, 0.1);
  --v-scroll-indicator-text-shadow: 0 0 6px rgba(0, 0, 0, 0.8);
  --v-scroll-indicator-border: rgba(255, 255, 255, 0.25);
}
```

The class names are stable, so you can also style them directly: `.v-scroll-indicator`,
`.v-scroll-indicator__content`, `.v-scroll-indicator__indicator`, and
`.v-scroll-indicator__indicator--{up|down|left|right|active|hidden}`. The component injects its own
stylesheet once per page, so there is no CSS file to import.

# Accessibility

The scrollable area is focusable, so keyboard users can scroll it with the arrow keys. The indicators
are hidden from assistive technology, because they repeat what scrolling the area already provides.

# Demos

`demo/v-scroll-indicator-demo.html` (Vue 3) and `demo/v-scroll-indicator-demo-vue2.html` (Vue 2.7).
Run `npm run build` first, then open either file in a browser.

# Development

```bash
npm install
npm test        # runs the suite against Vue 3, then Vue 2.7
npm run build   # writes dist/: ES module, CommonJS, and the browser (UMD) build
```

The test scripts set `VUE_VERSION` themselves. To run `vitest` directly, set `VUE_VERSION=2` or
`VUE_VERSION=3`. It has no default.

# License

MIT. See [LICENSE](LICENSE).
