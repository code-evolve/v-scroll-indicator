import { describe, expect, it } from 'vitest'
import { measure, stepFor } from '../src/geometry'

describe('measure', () => {
  it('reports no overflow when the content fits', () => {
    const el = { scrollTop: 0, scrollHeight: 100, clientHeight: 100 }
    expect(measure(el, 'vertical').scrollable, 'fits').toBe(false)
  })

  it('ignores sub-pixel overflow', () => {
    const el = { scrollTop: 0, scrollHeight: 100.5, clientHeight: 100 }
    expect(measure(el, 'vertical').scrollable, 'half a pixel is not overflow').toBe(false)
  })

  it('finds the start and the end with a one pixel tolerance', () => {
    expect(measure({ scrollTop: 0.6, scrollHeight: 300, clientHeight: 100 }, 'vertical').atStart, 'near start').toBe(true)
    expect(measure({ scrollTop: 199.2, scrollHeight: 300, clientHeight: 100 }, 'vertical').atEnd, 'near end').toBe(true)
    expect(measure({ scrollTop: 150, scrollHeight: 300, clientHeight: 100 }, 'vertical'), 'middle').toEqual({ scrollable: true, atStart: false, atEnd: false })
  })

  it('reads the horizontal axis', () => {
    const el = { scrollLeft: 200, scrollWidth: 300, clientWidth: 100 }
    expect(measure(el, 'horizontal'), 'at the right end').toEqual({ scrollable: true, atStart: false, atEnd: true })
  })

  it('rejects an unknown direction', () => {
    expect(() => measure({}, 'diagonal'), 'throws').toThrow('unknown direction "diagonal"')
  })
})

describe('stepFor', () => {
  it('scales the visible size and keeps at least one pixel', () => {
    expect(stepFor({ clientHeight: 200 }, 'vertical', 0.9, 1), 'down').toEqual({ top: 180, left: 0 })
    expect(stepFor({ clientWidth: 200 }, 'horizontal', 0.5, -1), 'left').toEqual({ top: 0, left: -100 })
    expect(stepFor({ clientHeight: 0 }, 'vertical', 0.9, 1), 'never zero').toEqual({ top: 1, left: 0 })
  })
})
