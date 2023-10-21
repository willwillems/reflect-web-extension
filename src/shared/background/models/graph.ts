import { Model, idProp, model, prop } from 'mobx-keystone'

import { LinkStore } from './link-store'

@model('Graph')
export class Graph extends Model({
  id: idProp,
  name: prop<string>().withSetter(),
  linkStore: prop<LinkStore>(() => new LinkStore({})),
}) {
  get snapshot() {
    return {
      id: this.id,
      name: this.name,
    }
  }
}
