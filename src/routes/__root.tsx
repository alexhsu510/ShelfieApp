import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import '../styles.css'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Shelfie — Pantry & Grocery Manager',
      },
      {
        name: 'description',
        content: 'A simple, smart pantry tracker and shopping list with barcode scanning.',
      },
      {
        name: 'theme-color',
        content: '#0e1712',
      },
    ],
    links: [{ rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
  }),
  shellComponent: RootDocument,
})

// Runs before first paint so the stored theme is applied without a flash of the
// wrong palette. Mirrors resolveTheme() in lib/theme.ts — dark unless the user
// has explicitly chosen light.
const themeBootScript = `try{var t=localStorage.getItem('shelfie-theme')}catch(e){}
document.documentElement.dataset.theme=t==='light'?'light':'dark'`

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    // themeBootScript rewrites data-theme before hydration, so React would
    // otherwise flag the server's "dark" against a restored "light".
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
