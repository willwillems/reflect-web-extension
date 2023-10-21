import { HighlightSnapshot } from '../../lib/types/highlight-snapshot'

export function getSelectedHighlight(selection: Selection): HighlightSnapshot | null {
  if (selection.type === 'None') {
    return null
  }

  if (selection.isCollapsed) {
    return null
  }

  if (selection.rangeCount === 0) {
    return null
  }

  const range = selection.getRangeAt(0)

  const container = range.commonAncestorContainer

  if (isContentEditable(container)) {
    return null
  }

  const text = selection.toString().trim()

  if (!text) {
    return null
  }

  const offset = getRangeOffset(range)

  return {
    text,
    offset,
  }
}

function isContentEditable(selected: Node) {
  // Returns true if the any of the parent is an anchor element
  // or is content editable.
  let parent = selected.parentElement

  while (parent) {
    if (parent.isContentEditable) {
      return true
    }
    parent = parent.parentElement
  }

  return false
}

function getRangeOffset(range: Range): number | null {
  if (!range) {
    return null
  }

  const clone = range.cloneRange()
  clone.selectNodeContents(document.body)
  clone.setEnd(range.startContainer, range.startOffset)
  return clone.toString().length
}
