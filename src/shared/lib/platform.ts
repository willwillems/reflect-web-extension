export const platformIsMac = /Mac/.test(navigator.platform)

export function isSafari() {
  return process.env.BROWSER === 'safari'
}
