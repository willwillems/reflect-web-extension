// @ts-ignore
import css from "../../../highlight.css"
let addedStyles = false

export function addStyles() {
  if (addedStyles) {
    return
  }

  const style = document.createElement('style')
  style.innerHTML = css
  document.head.appendChild(style)
  addedStyles = true
}
