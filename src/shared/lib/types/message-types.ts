import { HighlightSnapshot } from './highlight-snapshot'
import { LinkSnapshot } from './link-snapshot'
import {StateSnapshot} from './state-snapshot'

export const LINK_TRANSPORT = 'link-transport'

export interface SetLinkMessage {
  type: 'set-link'
  args: {
    url: string
    graphId?: string
    title?: string
    description?: string
    highlight?: HighlightSnapshot
  }
}

export interface RemoveLinkMessage {
  type: 'remove-link'
  args: {
    url: string
    graphId?: string
  }
}

export interface RemoveHighlightMessage {
  type: 'remove-highlight'
  args: {
    url: string
    highlight: HighlightSnapshot
    graphId?: string
  }
}

export interface ContentScriptReadyMessage {
  type: 'content-script-ready'
  args: {
    url: string
  }
}

export interface LinkSnapshotMessage {
  type: 'link-snapshot'
  args: {
    snapshot: LinkSnapshot | null
  }
}

export interface KindleSyncMessage {
  type: 'kindle-sync'
}

export interface KindleSyncEnabledMessage {
  type: 'kindle-sync-enabled'
  args: {
    enabled: boolean
  }
}

export interface SignOutMessage {
  type: 'sign-out'
}
export interface GetStateMessage {
  type: 'get-state'
}

export interface StateSnapshotMessage {
  type: 'state-snapshot'
  args: {
    snapshot: StateSnapshot
  }
}

export interface SetDefaultGraphIdMessage {
  type: 'set-default-graph-id'
  args: {
    graphId: string
  }
}

export interface GetAuthUrlMessage {
  type: 'get-auth-url'
}

export interface OptionsOpenedMessage {
  type: 'options-opened'
}

export interface SetAutoHighlightMessage {
  type: 'set-auto-highlight'
  args: {
    enabled: boolean
  }
}

export interface SetSaveBookmarkedTweetsMessage {
  type: 'set-save-bookmarked-tweets'
  args: {
    enabled: boolean
  }
}

export interface SetSaveFavoritedTweetsMessage {
  type: 'set-save-favorited-tweets'
  args: {
    enabled: boolean
  }
}

export type Message =
  | SetLinkMessage
  | RemoveLinkMessage
  | RemoveHighlightMessage
  | GetAuthUrlMessage
  | GetStateMessage
  | KindleSyncMessage
  | KindleSyncEnabledMessage
  | LinkSnapshotMessage
  | ContentScriptReadyMessage
  | SetDefaultGraphIdMessage
  | SignOutMessage
  | StateSnapshotMessage
  | OptionsOpenedMessage
  | SetAutoHighlightMessage
  | SetSaveBookmarkedTweetsMessage
  | SetSaveFavoritedTweetsMessage
