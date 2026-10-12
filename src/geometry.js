// Zoomed and high-density displays report fractional scroll positions, so an
// element scrolled fully to its end can sit a fraction of a pixel short of it.
export const EDGE_TOLERANCE = 1

const AXES = {
  vertical: { position: 'scrollTop', size: 'scrollHeight', visible: 'clientHeight' },
  horizontal: { position: 'scrollLeft', size: 'scrollWidth', visible: 'clientWidth' },
}

export function axisOf(direction) {
  const axis = AXES[direction]
  if (!axis) throw new Error(`v-scroll-indicator: unknown direction "${direction}"`)
  return axis
}

// Where an element sits along one axis: whether it overflows at all, and
// whether it is at the start or the end of its scroll range.
export function measure(el, direction) {
  const axis = axisOf(direction)
  const position = el[axis.position]
  const overflow = el[axis.size] - el[axis.visible]
  return {
    scrollable: overflow > EDGE_TOLERANCE,
    atStart: position <= EDGE_TOLERANCE,
    atEnd: overflow - position <= EDGE_TOLERANCE,
  }
}

// The scroll offset for one indicator click: a fraction of the visible size,
// towards the start (-1) or the end (+1).
export function stepFor(el, direction, fraction, sign) {
  const distance = Math.max(1, Math.round(el[axisOf(direction).visible] * fraction))
  return direction === 'vertical'
    ? { top: sign * distance, left: 0 }
    : { top: 0, left: sign * distance }
}
