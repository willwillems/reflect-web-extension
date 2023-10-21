import debounce from 'lodash/debounce'
import isString from 'lodash/isString'
import { applySnapshot, onSnapshot } from 'mobx-keystone'

import { storageGet, storageSet, StorageType } from '../../../lib/storage'

export type Args = (name: string, store: any, options?: Options) => Promise<void>

export interface Options {
  storageType?: StorageType
  version?: number
  debounceInterval?: number
  saveOnUnload?: boolean
}

type StrToAnyMap = { [key: string]: any }

export const persist: Args = async (name, store, options = {}) => {
  const { storageType = 'local', version = 1, debounceInterval = 2000 } = options

  const storageKey = `${name}-${version}`

  const setSnapshot = (snapshot: StrToAnyMap) => {
    return storageSet(storageType, storageKey, JSON.stringify(snapshot))
  }

  onSnapshot(store, debounce(setSnapshot, debounceInterval))

  const storedItem = await storageGet(storageType, storageKey)
  const storedSnapshot = isString(storedItem) ? JSON.parse(storedItem) : storedItem

  if (!storedSnapshot) return

  applySnapshot(store, storedSnapshot)
}
