import '@webcomponents/webcomponentsjs/webcomponents-bundle'

class HighlightElement extends HTMLElement {
  constructor() {
    super()
    this.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('reflect-highlight-click', { bubbles: true }))
    })
  }
}

customElements.define('reflect-highlight', HighlightElement, { extends: 'mark' })
