import { LinkSnapshot } from '../../lib/types/link-snapshot'
import { addTooltipEventListeners } from '../tooltip'

import { TOOLBAR_HEIGHT } from './element'
import { getBodyMarginTop } from './utils'

let toolbarElement: HTMLElement | null = null

function addMarginTop() {
  // Add margin top to body to make space for toolbar
  const marginTop = getBodyMarginTop()
  document.body.style.marginTop = `${marginTop + TOOLBAR_HEIGHT}px`
}

function removeMarginTop() {
  const marginTop = getBodyMarginTop()
  const newMarginTop = Math.max(marginTop - TOOLBAR_HEIGHT, 0)
  document.body.style.marginTop = `${newMarginTop}px`
}

function addToolbarElement(link: LinkSnapshot) {
  toolbarElement = document.createElement('reflect-toolbar')
  toolbarElement.setAttribute('link', JSON.stringify(link))
  document.body.appendChild(toolbarElement)
}

function addToolbar(link: LinkSnapshot) {
  addToolbarElement(link)
  addMarginTop()
  addTooltipEventListeners()
}

function removeToolbar() {
  if (!toolbarElement) {
    return
  }

  toolbarElement.remove()
  toolbarElement = null

  removeMarginTop()
}

export function setToolbar(link: LinkSnapshot | null) {
  removeToolbar()

  if (link && link.showToolbar) {
    addToolbar(link)
  }
}
