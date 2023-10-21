import { rootStore } from '../models/store'

export async function processAuthCallback({ code }: { code: string }) {
  console.log('[reflect]', 'Processing auth callback...')

  const token = await rootStore.client.getToken(code)
  rootStore.setAccessToken(token)

  console.log('[reflect]', 'Running post auth setup...')

  try {
    await rootStore.postAuthSetup()
  } catch (error) {
    console.error('Error in post auth setup', error)
  }
}

export async function signOut() {
  rootStore.reset()
}
