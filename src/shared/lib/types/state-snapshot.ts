export type StateSnapshot = {
   ready: boolean
   isSignedIn: boolean
   hasSetupKindle: boolean
   defaultGraphId: string | null
   currentGraphId: string | null
   graphs: any[]
   recentKindleSyncs: any[]
   canAccessAllWebsites: boolean
   kindleSyncEnabled: boolean
   autoHighlight: boolean
   showToolbar: boolean
   saveBookmarkedTweets: boolean
   saveFavoritedTweets: boolean
 }
 