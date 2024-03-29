import '@webcomponents/webcomponentsjs/webcomponents-bundle'
// @ts-ignore
import css from "../../../tooltip.css"

import { assert } from '../../lib/assert'
import { getLocationUrl } from '../../lib/location'
import { HighlightSnapshot } from '../../lib/types/highlight-snapshot'
import { RemoveHighlightMessage } from '../../lib/types/message-types'

export class TooltipElement extends HTMLElement {
  private shadow: ShadowRoot
  private styles: CSSStyleSheet

  constructor() {
    super()
    {
      // https://bugzilla.mozilla.org/show_bug.cgi?id=1716685
      const proto = TooltipElement.prototype
      for (const key of Object.getOwnPropertyNames(proto)) {
        const descriptor = Object.getOwnPropertyDescriptor(proto, key)
        if (descriptor && descriptor.get) {
          Object.defineProperty(this, key, {
            get: descriptor.get.bind(this),
          })
        } else {
          this[key] = proto[key]
        }
      }
    }
    this.shadow = this.attachShadow({ mode: 'open' })
    this.styles = new CSSStyleSheet()
    this.styles.replaceSync(css)
  }

  connectedCallback() {
    this.render()
  }

  render() {
    this.addStyles()
    this.renderHtml()
    this.addEventListeners()
  }

  get highlight(): HighlightSnapshot {
    return {
      text: this.dataset.text!,
      offset: Number.parseInt(this.dataset.offset!, 10),
    }
  }

  get url(): string {
    return getLocationUrl()
  }

  get arrowElement(): HTMLElement {
    const arrow = this.shadow.querySelector('.arrow')
    assert(arrow, 'arrow element must exist')
    return arrow as HTMLElement
  }

  private addEventListeners() {
    this.shadow
      .querySelector('button[name="remove-highlight"]')!
      .addEventListener('click', () => {
        this.removeHighlight()
        this.close()
      })
  }

  private close() {
    this.remove()
  }

  private removeHighlight() {
    const message: RemoveHighlightMessage = {
      type: 'remove-highlight',
      args: {
        url: this.url,
        highlight: this.highlight,
      },
    }

    chrome.runtime.sendMessage(message)
  }

  private renderHtml() {
    this.shadow.innerHTML = `
      <button name="remove-highlight">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-list-x">
        <path d="M11 12H3"/>
        <path d="M16 6H3"/>
        <path d="M16 18H3"/>
        <path d="m19 10-4 4"/>
        <path d="m15 10 4 4"/>
        </svg>
        <span>Remove highlight</span>
        <div class="arrow" />
      </button>
    `
  }

  private addStyles() {
    this.shadow.adoptedStyleSheets = [this.styles]
  }
}

customElements.define('reflect-tooltip', TooltipElement)
