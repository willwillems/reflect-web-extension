import { onConnect } from '../lib/message'
import { LINK_TRANSPORT } from '../lib/types/message-types'

import { ContentScriptTransport } from './lib/content-script-transport'

// From content-scripts -> background
onConnect(LINK_TRANSPORT, (port) => {
  ContentScriptTransport.listen(port)
})
