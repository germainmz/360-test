import { createContext, useContext, type Dispatch } from 'react'
import type { Draft, DraftAction } from './draftReducer'

export interface DraftContextValue {
  draft: Draft
  dispatch: Dispatch<DraftAction>
}

export const DraftContext = createContext<DraftContextValue | null>(null)

export function useDraft(): DraftContextValue {
  const value = useContext(DraftContext)
  if (!value) throw new Error('useDraft doit être utilisé sous <DraftProvider>')
  return value
}
