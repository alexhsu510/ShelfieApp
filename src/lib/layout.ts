import { useSyncExternalStore } from 'react'

/**
 * Widths where the shell has room for another column of detail. They match the
 * `min-width` breakpoints in `styles.css`, so CSS-driven columns and the
 * JS-driven list lengths below always appear together.
 */
export const WIDE_QUERY = '(min-width: 1280px)'
export const ULTRAWIDE_QUERY = '(min-width: 1560px)'

const subscribers = new Map<string, (onChange: () => void) => () => void>()

function subscriberFor(query: string) {
  let subscribe = subscribers.get(query)
  if (!subscribe) {
    subscribe = (onChange: () => void) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    }
    subscribers.set(query, subscribe)
  }
  return subscribe
}

/**
 * The server has no viewport, so it renders the compact layout and the client
 * corrects it right after hydration — matching snapshots keep React quiet.
 */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    subscriberFor(query),
    () => window.matchMedia(query).matches,
    () => false,
  )
}

export type LayoutDensity = {
  wide: boolean
  ultrawide: boolean
  pantryPreview: number
  attentionPreview: number
  listPreview: number
}

/** How many rows each dashboard panel can show without the page growing taller. */
export function useLayoutDensity(): LayoutDensity {
  const wide = useMediaQuery(WIDE_QUERY)
  const ultrawide = useMediaQuery(ULTRAWIDE_QUERY)
  return {
    wide,
    ultrawide,
    pantryPreview: ultrawide ? 10 : wide ? 7 : 5,
    attentionPreview: ultrawide ? 6 : wide ? 4 : 3,
    listPreview: ultrawide ? 6 : wide ? 4 : 3,
  }
}
