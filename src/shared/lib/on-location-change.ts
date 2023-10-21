import { getLocationUrl } from './location'

export function onLocationChange(callback: () => void) {
  let href = getLocationUrl()

  const checkHref = () => {
    if (getLocationUrl() != href) {
      href = getLocationUrl()
      callback()
    }
  }

  window.addEventListener('popstate', checkHref)
  window.addEventListener('click', () => {
    setTimeout(checkHref)
  })
}
