export const THEME_STORAGE_KEY = 'shelfie-theme'

export type Theme = 'dark' | 'light'

/**
 * Dark is the default: an unset preference resolves to dark, and only an
 * explicit stored 'light' opts out. Kept in sync with the inline boot script in
 * __root.tsx, which applies the same rule before first paint.
 */
export function resolveTheme(stored: string | null): Theme {
  return stored === 'light' ? 'light' : 'dark'
}

export function toggleTheme(): Theme {
  const current = resolveTheme(document.documentElement.dataset.theme ?? null)
  const next: Theme = current === 'dark' ? 'light' : 'dark'
  document.documentElement.dataset.theme = next
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next)
  } catch {
    // Private browsing or blocked storage: the theme still applies for this page.
  }
  return next
}
