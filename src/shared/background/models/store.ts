import { registerRootStore } from 'mobx-keystone'

import { persist } from './lib/persist'
import { RootStore } from './root-store'

async function setupPersistance(store: RootStore) {
  const version = 2

  await persist('store', store, {
    version,
  })

  store.setReady(true)
}

function setupRootStore() {
  const rootStore = new RootStore({})

  registerRootStore(rootStore)

  setupPersistance(rootStore)

  return rootStore
}

export const rootStore: RootStore = setupRootStore()
