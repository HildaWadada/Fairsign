'use client'
// frontend/components/LangThemePicker.tsx

import { useState } from 'react'
import { Globe, Sun, Moon, ChevronDown } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { LANGUAGES } from '@/lib/i18n'
import type { Lang } from '@/lib/i18n'

export default function LangThemePicker() {
  const { lang, setLang, theme, toggleTheme } = useApp()
  const [open, setOpen] = useState(false)

  const current = LANGUAGES.find(l => l.id === lang) ?? LANGUAGES[0]

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
      {/* Theme toggle */}
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
          transition: 'background 0.2s',
        }}
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      {/* Language picker */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 10px',
            borderRadius: '8px',
            border: '1px solid var(--border, #e2e8f0)',
            background: 'var(--card, #fff)',
            color: 'var(--text, #0f172a)',
            cursor: 'pointer',
            fontSize: '14px',
            whiteSpace: 'nowrap',
          }}
        >
          <Globe size={15} />
          <span>{current.flag} {current.name}</span>
          <ChevronDown size={13} style={{ opacity: 0.6 }} />
        </button>

        {open && (
          <>
            {/* Backdrop */}
            <div
              onClick={() => setOpen(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 40 }}
            />
            {/* Dropdown */}
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              zIndex: 50,
              minWidth: '200px',
              borderRadius: '10px',
              border: '1px solid var(--border, #e2e8f0)',
              background: 'var(--card, #fff)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              overflow: 'hidden',
            }}>
              {LANGUAGES.map(l => (
                <button
                  key={l.id}
                  onClick={() => { setLang(l.id as Lang); setOpen(false) }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '10px 14px',
                    border: 'none',
                    background: lang === l.id ? 'var(--primary, #6366f1)22' : 'transparent',
                    color: lang === l.id ? 'var(--primary, #6366f1)' : 'var(--text, #0f172a)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: lang === l.id ? 600 : 400,
                  }}
                >
                  <span style={{ fontSize: '18px' }}>{l.flag}</span>
                  <div>
                    <div>{l.name}</div>
                    <div style={{ fontSize: '11px', opacity: 0.6 }}>{l.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
