export function retry(fn: () => Promise<any>, retries = 3, delay = 1000): Promise<void> {
  return new Promise((resolve, reject) => {
    const retryFn = (retries: number): void => {
      fn()
        .then(resolve)
        .catch((err) => {
          console.error(err)

          if (retries > 0) {
            console.log(`[retry] retry ${retries} in ${delay}`)
            setTimeout(() => retryFn(retries - 1), delay)
          } else {
            console.error('[retry] failed retries')
            reject(err)
          }
        })
    }

    retryFn(retries)
  })
}
