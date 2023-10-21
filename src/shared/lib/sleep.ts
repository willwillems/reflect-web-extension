function sleep(time: number) {
  return new Promise((success) => {
    setTimeout(success, time)
  })
}

export default sleep
