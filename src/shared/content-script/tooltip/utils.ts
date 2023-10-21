import { Coords, Placement } from '@floating-ui/dom'

import { assertString } from '../../lib/assert'

export function getArrowStyle(
  placement: Placement,
  position:
    | (Partial<Coords> & {
        centerOffset: number
      })
    | undefined,
) {
  if (!position) {
    return { display: 'none' }
  }

  const { x, y } = position

  const staticSide = getArrowStaticSidePosition(placement)

  return {
    display: 'block',
    left: x != null ? `${x}px` : '',
    top: y != null ? `${y}px` : '',
    ...staticSide,
  }
}

function getArrowStaticSidePosition(placement: Placement) {
  const side = placement.split('-')[0]

  const staticSide = {
    top: 'bottom',
    right: 'left',
    bottom: 'top',
    left: 'right',
  }[side]

  assertString(staticSide)

  return {
    [staticSide]: `-15px`,
  }
}
