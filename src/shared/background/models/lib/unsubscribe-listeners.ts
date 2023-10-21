type FunctionUnsubscriber = () => void

type MobxUnsubscriber = Promise<any> & {
  cancel(): void
}

export type UnsubscribeCallback =
  | FunctionUnsubscriber
  | Promise<FunctionUnsubscriber>
  | MobxUnsubscriber

export function unsubscriberListeners(listeners: UnsubscribeCallback[]) {
  listeners.forEach(unsubscriberListener)
}

async function unsubscriberListener(unsubscriber: any) {
  if (typeof unsubscriber === 'function') {
    // Firebase unsubscriber
    unsubscriber()
  } else if (typeof unsubscriber.cancel === 'function') {
    // Mobx unsubscriber
    unsubscriber.cancel()
  } else {
    // FunctionUnsubscriber in a promise
    ;(await unsubscriber)?.()
  }
}
