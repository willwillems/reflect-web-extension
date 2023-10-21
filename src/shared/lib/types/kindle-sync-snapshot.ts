export type KindleSyncSnapshot = {
   id: string
   createdAt: number
   finishedAt?: number
   status: 'pending' | 'success' | 'error'
   errorMessage?: string
   processedCount: number
   totalCount?: number
   progress: number
   logMessages: string[]
 }
