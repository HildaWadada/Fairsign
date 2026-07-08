'use client'
// frontend/components/ThemeToggle.tsx

import { Sun, Moon } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useApp()

  return (
    <button
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '36px',
        height: '36px',
        borderRadius: '8px',
        border: '1px solid var(--border, #e2e8f0)',
        background: 'var(--card, #fff)',
        color: 'var(--text, #0f172a)',
        cursor: 'pointer',
        transition: 'background 0.2s, color 0.2s',
      }}
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}
