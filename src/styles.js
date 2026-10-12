const STYLE_ID = 'v-scroll-indicator-styles'

// Every colour, size and timing reads a custom property with its default as
// the var() fallback. The defaults are never DECLARED here: this sheet is
// appended after the app's own, so a declaration would win on source order
// and silently override every theme an app sets.
const color = 'var(--v-scroll-indicator-color, #1f2937)'
const glass = 'var(--v-scroll-indicator-background, rgba(255, 255, 255, 0.08))'
const blur = 'var(--v-scroll-indicator-blur, 5px)'
const border = 'var(--v-scroll-indicator-border, rgba(255, 255, 255, 0.35))'
const shadow = 'var(--v-scroll-indicator-shadow, none)'
const thickness = 'var(--v-scroll-indicator-size, 2em)'
const filter = `blur(${blur})`

// The indicators float over the edges of the content as clear glass: the
// content scrolls underneath and shows through them blurred, with almost no
// tint, so the indicator reads as the content itself going out of focus. While inactive
// they are invisible and let clicks through to the content below.
export const css = `
.v-scroll-indicator {
  position: relative;
  display: flex;
  min-height: 0;
  min-width: 0;
}
.v-scroll-indicator__content {
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow: auto;
}
.v-scroll-indicator--vertical > .v-scroll-indicator__content {
  overflow-x: hidden;
}
.v-scroll-indicator--horizontal > .v-scroll-indicator__content {
  overflow-y: hidden;
}
.v-scroll-indicator--horizontal .v-scroll-indicator__inner {
  width: max-content;
  min-width: 100%;
}
.v-scroll-indicator__indicator {
  position: absolute;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  color: ${color};
  text-shadow: var(--v-scroll-indicator-text-shadow, 0 0 6px rgba(255, 255, 255, 0.9));
  font-size: var(--v-scroll-indicator-font-size, 1.15em);
  font-weight: var(--v-scroll-indicator-font-weight, 700);
  background: ${glass};
  -webkit-backdrop-filter: ${filter};
  backdrop-filter: ${filter};
  box-shadow: ${shadow};
  opacity: 0;
  pointer-events: none;
  transition: var(--v-scroll-indicator-transition, opacity 0.3s);
  user-select: none;
}
.v-scroll-indicator__indicator--hidden {
  display: none;
}
.v-scroll-indicator__indicator--active {
  opacity: 1;
  pointer-events: auto;
}
.v-scroll-indicator__indicator--clickable.v-scroll-indicator__indicator--active {
  cursor: var(--v-scroll-indicator-cursor, pointer);
}
.v-scroll-indicator__indicator--up,
.v-scroll-indicator__indicator--down {
  left: 0;
  right: 0;
  height: ${thickness};
}
.v-scroll-indicator__indicator--left,
.v-scroll-indicator__indicator--right {
  top: 0;
  bottom: 0;
  width: ${thickness};
}
.v-scroll-indicator__indicator--up {
  top: 0;
  border-bottom: 1px solid ${border};
}
.v-scroll-indicator__indicator--down {
  bottom: 0;
  border-top: 1px solid ${border};
}
.v-scroll-indicator__indicator--left {
  left: 0;
  border-right: 1px solid ${border};
}
.v-scroll-indicator__indicator--right {
  right: 0;
  border-left: 1px solid ${border};
}
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .v-scroll-indicator__indicator {
    background: var(--v-scroll-indicator-background-solid, rgba(255, 255, 255, 0.92));
  }
}
@media (prefers-reduced-transparency: reduce) {
  .v-scroll-indicator__indicator {
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
    background: var(--v-scroll-indicator-background-solid, rgba(255, 255, 255, 0.92));
  }
}
@media (prefers-reduced-motion: reduce) {
  .v-scroll-indicator__indicator {
    transition: none;
  }
}
`

// Injected once per document on first mount, so the package works from a
// script tag or a bundler without a separate stylesheet import. Never runs
// during server rendering, because mounting only happens in a browser.
export function injectStyles(doc) {
  if (!doc || doc.getElementById(STYLE_ID)) return
  const style = doc.createElement('style')
  style.id = STYLE_ID
  style.textContent = css
  doc.head.appendChild(style)
}
