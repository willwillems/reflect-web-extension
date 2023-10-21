import { performSync } from './services/kindle'

const KINDLE_SYNC_ALARM = 'KINDLE_SYNC_ALARM'

function onAlarm({ name }) {
  try {
    if (name === KINDLE_SYNC_ALARM) {
      performSync()
    }
  } catch (error) {
    console.error('[reflect] error in Alarm', error)
  }
}

chrome.alarms.onAlarm.addListener(onAlarm)

chrome.runtime.onInstalled.addListener(async () => {
  chrome.alarms.clear(KINDLE_SYNC_ALARM, () => {
    const syncTimeout = 60 * 6

    chrome.alarms.create(KINDLE_SYNC_ALARM, {
      periodInMinutes: syncTimeout,
      delayInMinutes: syncTimeout,
    })
  })
})
