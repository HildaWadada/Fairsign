// components/LanguageTranslator.tsx
'use client'

import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Globe } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { t, LANGUAGES } from '@/lib/i18n'

interface Props { sessionId: string }

const CONTENT_TYPE_IDS = ['summary', 'redflags', 'advice'] as const

// ── Color tokens ──────────────────────────────────────────────────────────────
const C = {
  pageBg:     '#FEFCF8',
  navBg:      '#FFFFFF',
  cardBg:     '#FFFFFF',
  surfaceBg:  '#F5F1E8',
  border:     '#EDEBE6',
  borderMd:   '#E2DDD4',
  gold:       '#B87A14',
  goldHover:  '#9E6910',
  goldTint:   '#FEF3DC',
  goldBorder: 'rgba(184,122,20,0.22)',
  goldText:   '#7A4F0A',
  textPrimary:   '#1A1410',
  textSecondary: '#6B5F52',
  textMuted:     '#A0927F',
  textDisabled:  '#C8BDB0',
  red:    '#DC2626', redTint:    '#FEF2F2',
  green:  '#16A34A', greenTint:  '#F0FDF4',
  yellow: '#D97706', yellowTint: '#FFFBEB',
}

export default function LanguageTranslator({ sessionId }: Props) {
  const { lang } = useApp()
  const tx = t(lang).translator

  const [targetLang, setTargetLang]   = useState('swahili')
  const [contentType, setContentType] = useState('summary')
  const [translation, setTranslation] = useState('')
  const [loading, setLoading]         = useState(false)
  const [activeLang, setActiveLang]   = useState<any>(null)

  const translate = async () => {
    setLoading(true)
    setTranslation('')
    try {
      const { data } = await axios.post('/api/translate', {
        session_id: sessionId, language: targetLang, content_type: contentType,
      })
      setTranslation(data.translation)
      setActiveLang(LANGUAGES.find(l => l.id === targetLang))
      toast.success(`Translated to ${data.language}`)
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Translation failed')
    } finally { setLoading(false) }
  }

  const selectedLang = LANGUAGES.find(l => l.id === targetLang)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Hero banner ──────────────────────────────────────────────────── */}
      <div style={{
        background: C.goldTint,
        border: `1px solid ${C.goldBorder}`,
        borderRadius: 14,
        padding: '18px 20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 14,
      }}>
        <Globe size={22} color={C.gold} style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: C.textPrimary, marginBottom: 4 }}>
            {tx.title}
          </h3>
          <p style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.65 }}>
            {tx.subtitle}
          </p>
        </div>
      </div>

      {/* ── Language picker ───────────────────────────────────────────────── */}
      <div>
        <p style={{
          fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.1em', color: C.textMuted, marginBottom: 12,
        }}>
          {tx.chooseLanguage}
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(154px, 1fr))',
          gap: 10,
        }}>
          {LANGUAGES.map(l => {
            const isActive = targetLang === l.id
            return (
              <button
                key={l.id}
                onClick={() => setTargetLang(l.id)}
                style={{
                  padding: '14px 16px',
                  borderRadius: 12,
                  textAlign: 'left',
                  cursor: 'pointer',
                  border: `2px solid ${isActive ? C.gold : C.border}`,
                  background: isActive ? C.goldTint : C.cardBg,
                  transition: 'all 0.15s',
                  boxShadow: isActive ? `0 0 0 3px rgba(184,122,20,0.08)` : 'none',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    const b = e.currentTarget as HTMLButtonElement
                    b.style.borderColor = C.goldBorder
                    b.style.background = C.surfaceBg
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    const b = e.currentTarget as HTMLButtonElement
                    b.style.borderColor = C.border
                    b.style.background = C.cardBg
                  }
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 6 }}>{l.flag}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: isActive ? C.goldText : C.textPrimary }}>
                  {l.name}
                </div>
                <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{l.desc}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Content type pills ────────────────────────────────────────────── */}
      <div>
        <p style={{
          fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.1em', color: C.textMuted, marginBottom: 12,
        }}>
          {tx.whatToTranslate}
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {CONTENT_TYPE_IDS.map(id => {
            const isActive = contentType === id
            return (
              <button
                key={id}
                onClick={() => setContentType(id)}
                style={{
                  padding: '7px 18px',
                  borderRadius: 99,
                  fontSize: 13,
                  cursor: 'pointer',
                  border: `1.5px solid ${isActive ? C.goldBorder : C.border}`,
                  background: isActive ? C.goldTint : C.cardBg,
                  color: isActive ? C.goldText : C.textSecondary,
                  fontWeight: isActive ? 600 : 400,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    const b = e.currentTarget as HTMLButtonElement
                    b.style.background = C.surfaceBg
                    b.style.borderColor = C.goldBorder
                    b.style.color = C.textPrimary
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    const b = e.currentTarget as HTMLButtonElement
                    b.style.background = C.cardBg
                    b.style.borderColor = C.border
                    b.style.color = C.textSecondary
                  }
                }}
              >
                {tx.contentTypes[id]}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Translate button ──────────────────────────────────────────────── */}
      <button
        onClick={translate}
        disabled={loading}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: '13px',
          borderRadius: 12,
          fontWeight: 700,
          fontSize: 14,
          cursor: loading ? 'not-allowed' : 'pointer',
          background: loading ? C.border : C.gold,
          color: loading ? C.textDisabled : '#FEFCF8',
          border: 'none',
          letterSpacing: '0.01em',
          transition: 'background 0.2s, box-shadow 0.2s',
          boxShadow: loading ? 'none' : '0 2px 12px rgba(184,122,20,0.22)',
        }}
        onMouseEnter={e => {
          if (!loading) {
            const b = e.currentTarget as HTMLButtonElement
            b.style.background = C.goldHover
            b.style.boxShadow = '0 4px 20px rgba(184,122,20,0.32)'
          }
        }}
        onMouseLeave={e => {
          if (!loading) {
            const b = e.currentTarget as HTMLButtonElement
            b.style.background = C.gold
            b.style.boxShadow = '0 2px 12px rgba(184,122,20,0.22)'
          }
        }}
      >
        {loading ? (
          <>
            <div style={{
              width: 16, height: 16, borderRadius: '50%',
              border: `2px solid ${C.textDisabled}`,
              borderTopColor: C.goldText,
              animation: 'lt-spin 0.8s linear infinite',
            }} />
            {tx.translating}
          </>
        ) : (
          tx.translateBtn(selectedLang?.name || '', selectedLang?.flag || '')
        )}
      </button>

      {/* ── Translation result ────────────────────────────────────────────── */}
      {translation && activeLang && (
        <div style={{
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          overflow: 'hidden',
          boxShadow: '0 1px 4px rgba(26,20,16,0.05)',
        }}>
          {/* Header row */}
          <div style={{
            padding: '12px 16px',
            background: C.surfaceBg,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            borderBottom: `1px solid ${C.border}`,
          }}>
            <span style={{ fontSize: 18 }}>{activeLang.flag}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary }}>
              {activeLang.name}
            </span>
            <span style={{
              fontSize: 11, fontWeight: 600,
              background: C.goldTint,
              color: C.goldText,
              border: `1px solid ${C.goldBorder}`,
              borderRadius: 99,
              padding: '2px 9px',
              marginLeft: 'auto',
              textTransform: 'capitalize',
            }}>
              {tx.contentTypes[contentType as keyof typeof tx.contentTypes]}
            </span>
          </div>

          {/* Body */}
          <div style={{ padding: '18px 18px', background: C.cardBg }}>
            <p style={{
              fontSize: 14,
              lineHeight: 1.85,
              color: C.textSecondary,
              whiteSpace: 'pre-line',
              margin: 0,
            }}>
              {translation}
            </p>
          </div>

          {/* Footer / copy */}
          <div style={{
            padding: '10px 16px',
            background: C.surfaceBg,
            borderTop: `1px solid ${C.border}`,
            display: 'flex',
            justifyContent: 'flex-end',
          }}>
            <button
              onClick={() => { navigator.clipboard.writeText(translation); toast.success(tx.copied) }}
              style={{
                fontSize: 12, fontWeight: 600,
                padding: '5px 16px',
                borderRadius: 99,
                background: C.cardBg,
                color: C.textSecondary,
                border: `1px solid ${C.border}`,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                const b = e.currentTarget as HTMLButtonElement
                b.style.background = C.goldTint
                b.style.color = C.goldText
                b.style.borderColor = C.goldBorder
              }}
              onMouseLeave={e => {
                const b = e.currentTarget as HTMLButtonElement
                b.style.background = C.cardBg
                b.style.color = C.textSecondary
                b.style.borderColor = C.border
              }}
            >
              {tx.copy}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes lt-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
