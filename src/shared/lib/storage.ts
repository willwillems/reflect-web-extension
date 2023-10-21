import { isSafari } from './platform'

export type StorageType = 'local' | 'sync'

function pickStorage(type: StorageType) {
  type = isSafari() ? 'local' : type

  return chrome.storage[type]
}

export function storageGet(type: StorageType, property: string) {
  return new Promise<any>((resolve) => {
    pickStorage(type).get([property], (result) => {
      resolve(result[property])
    })
  })
}

export function storageSet(type: StorageType, property: string, value: any) {
  const toSet = {}
  toSet[property] = value

  return new Promise<void>((resolve) => {
    pickStorage(type).set(toSet, resolve)
  })
}

export function storageRemove(type: StorageType, property: string) {
  return new Promise<void>((resolve) => {
    pickStorage(type).remove(property, resolve)
  })
}

export function storageClear(type: StorageType) {
  return new Promise<void>((resolve) => {
    pickStorage(type).clear(resolve)
  })
}
