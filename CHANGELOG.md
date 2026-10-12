# 1.0.0
Several of these changes break 0.1.x usage.
## Breaking
- Requires Vue 2.7 or Vue 3. `vue` is now a peer dependency, and `vue-demi` a dependency.
- The `up` and `down` props are rendered as text, not HTML. Pass markup through the `up` and `down` slots instead.
- The browser build is `dist/v-scroll-indicator.umd.js`. It needs the vue-demi script loaded before it.
- The indicators overlay the content instead of taking space beside it.
- The CSS class names follow BEM: `.v-scroll-indicator__content` and `.v-scroll-indicator__indicator--up`, replacing `.v-scroll-indicator--content` and `.v-scroll-indicator--top`.
## Added
- Horizontal scrolling through `direction="horizontal"`, with `left` and `right` indicators.
- Clicking an indicator scrolls by a page (`scrollOnClick`, `scrollStep`, `smooth`).
- `reach-top`, `reach-bottom`, `reach-left` and `reach-right` events.
- Named slots for each indicator, given `{ active }`.
- Theming through CSS custom properties.
- Indicators are clear glass overlaid on the content edges, blurring the content behind them, with a solid fallback where `backdrop-filter` is unsupported or reduced transparency is preferred.
- A test suite that runs against Vue 2.7 and Vue 3.
## Fixed
- Indicators now update when the content changes size. They used to update only on scroll.
- The bottom indicator now hides at the end on zoomed and high-density displays.
- The `height` prop now follows changes made after mounting.
- The scrollable area is focusable, and the indicators are hidden from screen readers.
- The demo works again. It had been loading `vue@latest`, which became Vue 3.
## Changed
- Relicensed from CC-BY-ND-4.0 to MIT.
- The build uses Vite instead of webpack 4 and Gradle.
# 0.1.2
## Update documentation
# 0.1.1
## Add demo to documentation
# 0.1.0
## Initial Commit