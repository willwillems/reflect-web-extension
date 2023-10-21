import { debounce } from '../../lib/debounce'
import { SetLinkMessage } from '../../lib/types/message-types'
import { link } from '../store'

import { getSelectedHighlight } from './utils'

let mouseDown = false

document.addEventListener('mousedown', () => {
  mouseDown = true
})

document.addEventListener('mouseup', () => {
  mouseDown = false
})

const addHighlightFromSelectionDebounced = debounce(addHighlightFromSelection, 50)

// On selection change, send the selection to the background script
document.addEventListener('selectionchange', addHighlightFromSelectionDebounced)
document.addEventListener('mouseup', addHighlightFromSelectionDebounced)

function addHighlightFromSelection() {
  if (mouseDown) {
    return
  }

  if (!link) {
    return
  }

  if (!link.autoHighlight) {
    return
  }

  const selection = window.getSelection()

  if (!selection) {
    return
  }

  const highlight = getSelectedHighlight(selection)

  if (!highlight) {
    return
  }

  const message: SetLinkMessage = {
    type: 'set-link',
    args: {
      url: window.location.href,
      highlight,
    },
  }

  chrome.runtime.sendMessage(message)
}
