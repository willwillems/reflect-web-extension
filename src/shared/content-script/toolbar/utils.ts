export function getBodyMarginTop() {
  const result = Number.parseInt(window.getComputedStyle(document.body).marginTop)

  return Math.max(0, result)
}
