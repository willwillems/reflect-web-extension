// Returns a url without an #anchor
export function getLocationUrl(): string {
  const url = new URL(location.href)
  url.hash = ''
  return url.href
}
