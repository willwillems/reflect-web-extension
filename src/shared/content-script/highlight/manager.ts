import './element'
import { toRange } from 'dom-anchor-text-quote'
import wrap from 'wrap-range-text'

import { onReady } from '../../lib/ready'
import { HighlightSnapshot } from '../../lib/types/highlight-snapshot'
import { LinkSnapshot } from '../../lib/types/link-snapshot'

import { addStyles } from './styles'

export function setMarks(link: LinkSnapshot | null) {
  removeMarks()

  if (link) {
    addMarksWhenReady(link)
    addStyles()
  }
}

function addMarksWhenReady(link: LinkSnapshot) {
  onReady(() => {
    // We try adding the marks twice, because sometimes the first time fails
    // (e.g. if the page is still loading or mutating)
    addMarks(link)
    setTimeout(() => addMarks(link), 500)
  })
}

function addMarks(link: LinkSnapshot) {
  for (const highlight of link.highlights) {
    if (highlight) {
      wrapTextWithMark(highlight)
    }
  }
}

function wrapTextWithMark(highlight: HighlightSnapshot) {
  const range = findRangeWithText(highlight.text, highlight.offset)

  if (!range) {
    console.log('[reflect]', 'Unable to find range for highlighting')
    return
  }

  const mark = document.createElement('reflect-highlight')
  mark.dataset.text = highlight.text
  mark.dataset.offset = highlight.offset + ''

  wrap(mark, range)
}

function findRangeWithText(text: string, offset: number | null) {
  try {
    const range1 =
      offset !== null ? toRange(document.body, { exact: text }, { hint: offset }) : null

    const range =
      range1 ??
      toRange(document.body, { exact: text }) ??
      toRange(document.body, { exact: text }, { hint: 0 })

    if (range) {
      return range
    }
  } catch (e) {
    console.error(e)
  }
}

export function removeMarks() {
  const nodes = Array.from(document.querySelectorAll('reflect-highlight'))

  for (const node of nodes) {
    unwrapNode(node)
  }
}

function unwrapNode(el: Element) {
  const parent = el.parentNode
  while (el.firstChild) {
    parent?.insertBefore(el.firstChild, el)
  }
  parent?.removeChild(el)
}
