import { cloneDeep } from 'lodash'
import { Message } from './types/message-types'

export async function sendMessage(message: Message): Promise<any> {
  console.log('[reflect] Sending message: ', message)

  let result: any

  try {
    const messageCopy = cloneDeep(message)
    result = await chrome.runtime.sendMessage(messageCopy)
  } catch (error: any) {
    // We get this message when the then the options page is closed, for example.
    if (
      error.message === 'Could not establish connection. Receiving end does not exist.'
    ) {
      return
    }

    console.error('Error sending message: ', { message, error })
    throw error
  }

  console.log('[reflect] Response is: ', result)
  return result
}

export function onConnect(name: string, callback: (port: chrome.runtime.Port) => void) {
  chrome.runtime.onConnect.addListener((port) => {
    if (port.name !== name) return
    callback(port)
  })
}
