import '@webcomponents/webcomponentsjs/webcomponents-bundle'
import html from 'bundle-text:./template.html'

import { assert, assertString } from '../../lib/assert'
import { LinkSnapshot } from '../../lib/types/link-snapshot'
import {
  RemoveLinkMessage,
  SetAutoHighlightMessage,
  SetLinkMessage,
} from '../../lib/types/message-types'

export const TOOLBAR_HEIGHT = 30

export class ToolbarElement extends HTMLElement {
  link: LinkSnapshot | null = null
  descriptionDropdown = false
  shadow: ShadowRoot

  constructor() {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    const linkJson = this.getAttribute('link')

    if (linkJson) {
      this.link = JSON.parse(linkJson)
    }

    this.render()
    this.addDocumentEventListeners()
  }

  get autoHighlight() {
    return this.link?.autoHighlight ?? true
  }

  disconnectedCallback() {
    this.removeDocumentEventListeners()
  }

  setDescriptionDropdown(value: boolean) {
    this.descriptionDropdown = value
    this.render()
  }

  setAutoHighlight(enabled: boolean) {
    const message: SetAutoHighlightMessage = {
      type: 'set-auto-highlight',
      args: {
        enabled,
      },
    }

    chrome.runtime.sendMessage(message)
  }

  setDescription(value: string) {
    const url = this.link?.url
    assertString(url, 'url must be set')

    const message: SetLinkMessage = {
      type: 'set-link',
      args: {
        url,
        description: value,
      },
    }

    chrome.runtime.sendMessage(message)
  }

  render() {
    assert(this.link, 'link must be set')

    this.setHtml()
    this.addEventListeners()
  }

  private addDocumentEventListeners() {
    document.addEventListener('click', this.boundHandleDocumentClick)
  }

  private removeDocumentEventListeners() {
    document.removeEventListener('click', this.boundHandleDocumentClick)
  }

  private handleDocumentClick(event: MouseEvent) {
    if (!this.descriptionDropdown) {
      return
    }

    const target = event.target as HTMLElement
    const isToolbar = target.closest('reflect-toolbar')

    if (!isToolbar) {
      this.setDescriptionDropdown(false)
    }
  }

  private boundHandleDocumentClick = this.handleDocumentClick.bind(this)

  private get checkboxInput() {
    const element = this.shadow.querySelector('input[name="auto-highlight"]')
    assert(element, 'checkbox must be set')
    return element as HTMLInputElement
  }

  private get descriptionInput() {
    const element = this.shadow.querySelector('textarea[name="description"]')
    assert(element, 'description must be set')
    return element as HTMLInputElement
  }

  private get descriptionDropdownButton() {
    const element = this.shadow.querySelector('button[name="description-dropdown"]')
    assert(element, 'description dropdown button must be set')
    return element as HTMLButtonElement
  }

  private get removeLinkButton() {
    const element = this.shadow.querySelector('button[name="remove-link"]')
    assert(element, 'remove link button must be set')
    return element as HTMLButtonElement
  }

  private addEventListeners() {
    this.checkboxInput.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement
      this.setAutoHighlight(target.checked)
    })

    this.descriptionInput.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement
      this.setDescription(target.value)
    })

    this.descriptionInput.addEventListener('keydown', (e) => {
      // If escape, or cmd+enter, blur the input
      if (e.key === 'Escape' || (e.key === 'Enter' && e.metaKey)) {
        this.descriptionInput.blur()
        this.setDescriptionDropdown(false)
      }
    })

    this.descriptionDropdownButton.addEventListener('click', () => {
      this.setDescriptionDropdown(!this.descriptionDropdown)
    })

    this.removeLinkButton.addEventListener('click', () => {
      this.removeLink()
    })
  }

  private removeLink() {
    const url = this.link?.url
    assertString(url, 'url must be set')

    const message: RemoveLinkMessage = {
      type: 'remove-link',
      args: {
        url,
      },
    }

    chrome.runtime.sendMessage(message)
  }

  private setHtml() {
    this.shadow.innerHTML = this.compiledHtml
    this.checkboxInput.checked = this.autoHighlight
  }

  private get compiledHtml() {
    return html.replace(/\${(\w+)}/g, (_, key) => {
      return this.htmlVariables[key]
    })
  }

  private get htmlVariables() {
    assert(this.link, 'link must be set')

    return {
      highlightsCount: this.link.highlights.length,
      noteUrl: this.link.noteUrl ?? 'https://app.reflect.app',
      description: this.link.description ?? '',
      descriptionDropdownDisplay: this.descriptionDropdown ? 'block' : 'hidden',
      logoSrc: chrome.runtime.getURL('icons/icon-128.png'),
    }
  }
}

customElements.define('reflect-toolbar', ToolbarElement)
