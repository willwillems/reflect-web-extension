import { HighlightSnapshot } from "./highlight-snapshot"

export type LinkSnapshot = {
   url: string
   title: string | null
   showToolbar: boolean
   highlights: HighlightSnapshot[]
   noteUrl: string | null
   description: string | null
   autoHighlight: boolean
 }