// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AppProvider } from '@/contexts/AppContext'
import Providers from './providers' // your existing NextAuth SessionProvider

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FairSign — Know your deal before you sign',
  description: 'AI-powered music contract analysis for African artists.',
}

// Global CSS variables — both themes defined here so they work app-wide
const GLOBAL_THEME = `
  :root {
    --forest:     #0a2316;
    --gold:       #c9922a;
    --cream:      #f7f3eb;
    --cream-dark: #ede8dc;
  }
  [data-theme="light"] {
    --bg:        #f7f3eb;
    --surface:   #ffffff;
    --nav:       #0a2316;
    --border:    #ede8dc;
    --text:      #0a2316;
    --text-2:    #6b6b6b;
    --text-3:    #aaaaaa;
    --accent:    #c9922a;
    --danger:    #dc2626;
    --success:   #16a34a;
    --input-bg:  #fafafa;
    --hover:     #f7f3eb;
    --card:      #ffffff;
    --section-bg:#f7f3eb;
  }
  [data-theme="dark"] {
    --bg:        #0d1a12;
    --surface:   #152019;
    --nav:       #061710;
    --border:    #1e3328;
    --text:      #f0ece3;
    --text-2:    #8a9e90;
    --text-3:    #4a6054;
    --accent:    #c9922a;
    --danger:    #ef4444;
    --success:   #4ade80;
    --input-bg:  #0f1e15;
    --hover:     #1a2e21;
    --card:      #152019;
    --section-bg:#0f1a14;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: var(--bg);
    color: var(--text);
    transition: background-color 0.2s ease, color 0.15s ease;
  }
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: GLOBAL_THEME }} />
        {/* Prevent flash of wrong theme — reads localStorage before React hydrates */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var theme = localStorage.getItem('fs-theme') || 'light';
            document.documentElement.setAttribute('data-theme', theme);
          })();
        `}} />
      </head>
      <body className={inter.className}>
        <Providers>
          <AppProvider>
            {children}
          </AppProvider>
        </Providers>
      </body>
    </html>
  )
}
