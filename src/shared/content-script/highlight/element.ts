import '@webcomponents/webcomponentsjs/webcomponents-bundle'

class HighlightElement extends HTMLElement {
  constructor() {
    super()
    {
      // https://bugzilla.mozilla.org/show_bug.cgi?id=1716685
      const proto = HighlightElement.prototype
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
    this.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('reflect-highlight-click', { bubbles: true }))
    })
  }
}

customElements.define('reflect-highlight', HighlightElement, { extends: 'mark' })
