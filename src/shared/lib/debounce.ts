export function debounce<T extends (...args: any[]) => any>(func: T, wait: number) {
  let timeout: NodeJS.Timeout | null

  return function (localThis: any, ...args: any[]) {
    const context = localThis

    const later = function () {
      timeout = null
      func.apply(context, args)
    }

    clearTimeout(timeout!)
    timeout = setTimeout(later, wait)
  }
}
