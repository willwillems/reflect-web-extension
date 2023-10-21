import { computedFn as computedFnBase } from 'mobx-utils'

export function computedFn() {
  return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = computedFnBase(method)
  }
}
