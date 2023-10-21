import { computePosition, offset, flip, shift, arrow } from '@floating-ui/dom'

import { assert } from '../../lib/assert'

import { TooltipElement } from './element'
import { getArrowStyle } from './utils'

async function positionTooltip(
  highlightElement: HTMLElement,
  tooltipElement: TooltipElement,
) {
  const position = await computePosition(highlightElement, tooltipElement, {
    placement: 'top',
    middleware: [
      offset(10),
      flip(),
      shift({ padding: 10 }),
      arrow({
        element: tooltipElement.arrowElement,
      }),
    ],
  })

  const { x, y, middlewareData, placement } = position

  // Set position of tooltip
  Object.assign(tooltipElement.style, {
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
  })

  if (middlewareData.arrow) {
    // Set position of arrow
    Object.assign(
      tooltipElement.arrowElement.style,
      getArrowStyle(placement, middlewareData.arrow),
    )
  }
}

let tooltipElement: TooltipElement | null = null

function createOrAppendTooltip() {
  tooltipElement =
    tooltipElement ?? (document.createElement('reflect-tooltip') as TooltipElement)
  document.body.appendChild(tooltipElement)
}

function onHighlightClick(event: Event) {
  const highlightElement = event.target as HTMLElement

  createOrAppendTooltip()
  assert(tooltipElement)

  tooltipElement.dataset.text = highlightElement.dataset.text!
  tooltipElement.dataset.offset = highlightElement.dataset.offset!
  positionTooltip(highlightElement, tooltipElement)
}

function onDocumentClick(event: Event) {
  const target = event.target as HTMLElement

  if (!tooltipElement) {
    return
  }

  // Ignore if event is inside tooltip
  if (tooltipElement.contains(target)) {
    return
  }

  // Ignore if event is inside highlight by checking for the `reflect-highlight` tag
  if (target.closest('reflect-highlight')) {
    return
  }

  if (tooltipElement.parentNode) {
    tooltipElement.remove()
  }
}

let addedEventListeners = false

export function addTooltipEventListeners() {
  if (addedEventListeners) {
    return
  }

  addedEventListeners = true
  document.addEventListener('reflect-highlight-click', onHighlightClick)
  document.addEventListener('click', onDocumentClick)
}
