import first from 'lodash/first'
import { computed, reaction } from 'mobx'
import { getRootStore, Model, model, prop } from 'mobx-keystone'

import { Graph } from './graph'
import { UnsubscribeCallback, unsubscriberListeners } from './lib/unsubscribe-listeners'
import { RootStore } from './root-store'

@model('GraphStore')
export class GraphStore extends Model({
  graphs: prop<Graph[]>(() => []).withSetter(),
  defaultGraphId: prop<string | undefined>().withSetter(),
}) {
  @computed
  get currentGraphId() {
    if (
      this.defaultGraphId &&
      this.graphs.some((graph) => graph.id === this.defaultGraphId)
    ) {
      return this.defaultGraphId
    }

    return first(this.graphs)?.id
  }

  @computed
  get currentGraph() {
    return this.graphs.find((graph) => graph.id === this.currentGraphId)
  }

  async refreshGraphs() {
    const graphs = await this.client.getGraphs()
    this.setGraphs(graphs.map((graph) => new Graph(graph)))

    // Set the current graph to the first graph (if it's not set)
    if (!this.currentGraph) {
      this.setDefaultGraphId(first(graphs)?.id)
    }
  }

  private get rootStore() {
    return getRootStore<RootStore>(this)
  }

  private get client() {
    if (!this.rootStore) {
      throw new Error('No root store found')
    }

    return this.rootStore.client
  }

  private listeners: UnsubscribeCallback[] = []

  onAttachedToRootStore() {
    this.listeners.push(
      reaction(
        () => this.rootStore?.accessToken,
        (value, previousValue) => {
          const blankGraphs = this.graphs.length === 0
          const valueChanged = value !== previousValue

          // Whenever the access token changes, fetch graphs
          if (value && (valueChanged || blankGraphs)) {
            this.refreshGraphs()
          }
        },
      ),
    )

    return () => this.beforeDetach()
  }

  private beforeDetach() {
    unsubscriberListeners(this.listeners)
  }
}
