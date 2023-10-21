import { action, computed, observable } from 'mobx'
import { idProp, Model, model, modelAction, prop } from 'mobx-keystone'

import { KindleSyncSnapshot } from '../../lib/types/kindle-sync-snapshot'

@model('KindleSync')
export class KindleSync extends Model({
  id: idProp,
  createdAt: prop<number>(() => new Date().getTime()).withSetter(),
  finishedAt: prop<number | undefined>().withSetter(),
  status: prop<'pending' | 'success' | 'error'>('pending').withSetter(),
  errorMessage: prop<string | undefined>().withSetter(),
  processedCount: prop<number>(0).withSetter(),
  totalCount: prop<number | undefined>().withSetter(),
}) {
  @observable logMessages: string[] = []

  @action
  log(message: string) {
    console.log('[reflect]', '[kindle-sync]', message)
    this.logMessages.push(message)
  }

  incrementProcessed() {
    this.setProcessedCount(this.processedCount + 1)
  }

  @modelAction
  success() {
    this.setFinishedAt(new Date().getTime())
    this.setStatus('success')
  }

  @computed
  get progress(): number {
    if (!this.totalCount) {
      return 0
    }

    return this.processedCount / this.totalCount
  }

  @computed
  get snapshot(): KindleSyncSnapshot {
    return {
      id: this.id,
      createdAt: this.createdAt,
      finishedAt: this.finishedAt,
      status: this.status,
      errorMessage: this.errorMessage,
      processedCount: this.processedCount,
      totalCount: this.totalCount,
      progress: this.progress,
      logMessages: this.logMessages,
    }
  }
}
