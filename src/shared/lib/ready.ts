export function onReady(callback: () => void) {
  if (document.readyState != 'loading') {
    callback()
  } else {
    document.addEventListener('DOMContentLoaded', callback)
  }
}
