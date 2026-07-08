'use client'

// Add this to your existing providers.tsx
// It reads the saved theme on mount and applies it to <html> immediately

import { useEffect } from 'react'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const saved = localStorage.getItem('fs-theme') || 'light'
    document.documentElement.setAttribute('data-theme', saved)
  }, [])

  return <>{children}</>
}

// ── Also add these CSS variables to your globals.css ─────────────────────────
//
// [data-theme="light"] {
//   --bg:       #f7f3eb;
//   --surface:  #ffffff;
//   --text:     #0a2316;
//   --text-2:   #6b6b6b;
//   --border:   #ede8dc;
//   --accent:   #c9922a;
// }
// [data-theme="dark"] {
//   --bg:       #0d1a12;
//   --surface:  #152019;
//   --text:     #f0ece3;
//   --text-2:   #8a9e90;
//   --border:   #1e3328;
//   --accent:   #c9922a;
// }
//
// Then use var(--bg), var(--text) etc in your components instead of hardcoded colors.
