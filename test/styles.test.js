import { describe, expect, it } from 'vitest'
import { css } from '../src/styles'

describe('stylesheet', () => {
  it('never declares a theme property, so an app theme is not overridden', () => {
    const declarations = css.match(/--v-scroll-indicator-[a-z-]+\s*:/g)
    expect(declarations, 'no custom property declarations').toBeNull()
  })

  it('reads every theme property with a fallback', () => {
    const uses = css.match(/var\(--v-scroll-indicator-[a-z-]+[^)]*\)/g)
    expect(uses.length, 'theme properties are used').toBeGreaterThan(0)
    for (const use of uses) {
      expect(use, 'has a fallback').toMatch(/,\s*\S/)
    }
  })
})
