import { LinkSnapshot } from '../lib/types/link-snapshot'

export let link: LinkSnapshot | null = null

export function setLink(newLink: LinkSnapshot | null) {
  link = newLink
}
