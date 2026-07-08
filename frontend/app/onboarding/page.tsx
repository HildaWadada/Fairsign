'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { buildLabelScores, getOverallScore } from '@/lib/dealReadiness'
import type { ArtistStats } from '@/lib/dealReadiness'

const GENRES = [
  'Afrobeats', 'Afropop', 'RnB', 'Dancehall', 'Hip-hop',
  'Amapiano', 'Bongo Flava', 'Gengetone', 'Gospel', 'Pop',
]

const STEPS = [
  {
    id: 'profile',
    title: 'Tell us about you',
    subtitle: 'This helps FairSign match you with the right labels and give market-specific contract advice.',
    fields: [
      { key: 'stageName',       label: 'Stage name',         placeholder: 'e.g. King Saha',   hint: 'The name you perform under',    type: 'text' },
      { key: 'audiomackHandle', label: 'Audiomack username',  placeholder: 'e.g. kingsaha256', hint: 'Your Audiomack profile name',   type: 'text' },
      { key: 'instagramHandle', label: 'Instagram handle',    placeholder: 'e.g. kingsaha',    hint: 'Without the @ symbol',          type: 'text' },
      { key: 'tiktokHandle',    label: 'TikTok handle',       placeholder: 'e.g. kingsaha',    hint: 'Without the @ symbol',          type: 'text' },
    ],
  },
  {
    id: 'streaming',
    title: 'Your streaming numbers',
    subtitle: 'We compare these against real label thresholds to calculate your deal readiness score.',
    fields: [
      { key: 'audiomack', label: 'Audiomack monthly streams', placeholder: 'e.g. 3000', hint: 'Check your Audiomack artist dashboard', type: 'number' },
      { key: 'spotify',   label: 'Spotify monthly listeners', placeholder: 'e.g. 1200', hint: 'Found in Spotify for Artists',          type: 'number' },
      { key: 'youtube',   label: 'YouTube monthly views',     placeholder: 'e.g. 5000', hint: 'Check YouTube Studio analytics',        type: 'number' },
    ],
  },
  {
    id: 'social',
    title: 'Your social presence',
    subtitle: 'Labels check social proof before agreeing to any meeting.',
    fields: [
      { key: 'instagram', label: 'Instagram followers', placeholder: 'e.g. 2500', hint: 'Your current public follower count', type: 'number' },
      { key: 'tiktok',    label: 'TikTok followers',    placeholder: 'e.g. 800',  hint: 'Your current follower count',        type: 'number' },
      { key: 'releases',  label: 'Original releases',   placeholder: 'e.g. 2',    hint: 'Singles + EPs + albums you own',    type: 'number' },
    ],
  },
]

const MARKET_FLAG: Record<string, string> = {
  Uganda: '🇺🇬', Nigeria: '🇳🇬', Kenya: '🇰🇪', 'South Africa': '🇿🇦',
}

// ── Color tokens ──────────────────────────────────────────────────────────────
const C = {
  bg:        '#FEFCF8',   // page background
  gold:      '#B87A14',   // primary accent
  tint:      '#FEF3DC',   // soft gold tint
  darkAmber: '#7A4F0A',   // dark amber text / nav bg
  navBg:     '#EDEBE6',   // nav secondary bg / surfaces
  white:     '#FFFFFF',
  // derived utilities
  goldMid:   'rgba(184,122,20,.12)',
  goldBorder:'rgba(184,122,20,.25)',
  darkText:  '#3B2800',   // body text on light
  mutedText: '#9B8B72',   // hints / secondary text
  inputBorder:'#DDD5C4',
  errorBg:   '#FEF2F2',
  errorBorder:'#FECACA',
  errorText: '#DC2626',
}

export default function OnboardingPage() {
  const router       = useRouter()
  const params       = useSearchParams()
  const { data: session } = useSession()

  const isEditMode = params.get('edit') === 'true'

  const [step, setStep]       = useState(0)
  const [saving, setSaving]   = useState(false)
  const [loading, setLoading] = useState(isEditMode)
  const [error, setError]     = useState('')

  const [genre, setGenre]           = useState('')
  const [customGenre, setCustomGenre] = useState('')

  const [form, setForm] = useState<Record<string, string>>({
    stageName: '', audiomackHandle: '', instagramHandle: '', tiktokHandle: '',
    audiomack: '', spotify: '', youtube: '',
    instagram: '', tiktok: '', releases: '',
  })

  const market      = (session?.user as any)?.market || 'Uganda'
  const activeGenre = genre === 'Other' ? customGenre : genre
  const isLast      = step === STEPS.length - 1

  // ── Pre-fill form in edit mode ─────────────────────────────────────────────
  useEffect(() => {
    if (!isEditMode) return
    ;(async () => {
      try {
        const res = await fetch('/api/artist/readiness')
        if (!res.ok) return
        const data = await res.json()
        if (!data) return

        if (data.stats) {
          setForm(prev => ({
            ...prev,
            audiomack: String(data.stats.audiomack ?? ''),
            spotify:   String(data.stats.spotify   ?? ''),
            youtube:   String(data.stats.youtube   ?? ''),
            instagram: String(data.stats.instagram ?? ''),
            tiktok:    String(data.stats.tiktok    ?? ''),
            releases:  String(data.stats.releases  ?? ''),
          }))
        }

        if (data.profile) {
          setForm(prev => ({
            ...prev,
            stageName:       data.profile.stageName       ?? '',
            audiomackHandle: data.profile.audiomackHandle ?? '',
            instagramHandle: data.profile.instagramHandle ?? '',
            tiktokHandle:    data.profile.tiktokHandle    ?? '',
          }))
          const savedGenre = data.profile.genre ?? ''
          if (GENRES.includes(savedGenre)) {
            setGenre(savedGenre)
          } else if (savedGenre) {
            setGenre('Other')
            setCustomGenre(savedGenre)
          }
        }
      } catch {
        // Silent
      } finally {
        setLoading(false)
      }
    })()
  }, [isEditMode])

  // ── Handlers ───────────────────────────────────────────────────────────────
  function handleChange(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }))
    setError('')
  }

  function validate(): boolean {
    if (step === 0 && !activeGenre.trim()) {
      setError('Please select or enter your primary genre.')
      return false
    }
    for (const field of STEPS[step].fields) {
      const val = form[field.key]?.trim()
      if (!val) { setError(`Please fill in "${field.label}".`); return false }
      if (field.type === 'number' && (isNaN(Number(val)) || Number(val) < 0)) {
        setError(`Please enter a valid number for "${field.label}".`)
        return false
      }
    }
    return true
  }

  function handleNext() {
    if (!validate()) return
    if (!isLast) { setStep(s => s + 1) }
    else handleSubmit()
  }

  async function handleSubmit() {
    if (!validate()) return
    setSaving(true)

    const stats: ArtistStats = {
      audiomack: parseInt(form.audiomack) || 0,
      spotify:   parseInt(form.spotify)   || 0,
      youtube:   parseInt(form.youtube)   || 0,
      instagram: parseInt(form.instagram) || 0,
      tiktok:    parseInt(form.tiktok)    || 0,
      releases:  parseInt(form.releases)  || 0,
    }

    const labelScores  = buildLabelScores(stats, activeGenre, market)
    const overallScore = getOverallScore(stats)

    const payload = {
      profile: {
        stageName:       form.stageName,
        genre:           activeGenre,
        audiomackHandle: form.audiomackHandle,
        instagramHandle: form.instagramHandle,
        tiktokHandle:    form.tiktokHandle,
        market,
      },
      stats,
      overallScore,
      labelScores,
      completedAt: new Date().toISOString(),
    }

    try {
      const res = await fetch('/api/artist/readiness', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Save failed')
      router.push('/dashboard?readiness=updated')
    } catch {
      setError('Something went wrong. Please try again.')
      setSaving(false)
    }
  }

  // ── Loading skeleton (edit mode only) ─────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40, height: 40, border: `3px solid ${C.goldBorder}`,
            borderTop: `3px solid ${C.gold}`, borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 16px',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          <p style={{ color: C.mutedText, fontSize: 14 }}>Loading your profile…</p>
        </div>
      </div>
    )
  }

  const currentStep = STEPS[step]

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* ── Nav ── */}
      <nav style={{ background: C.white, borderBottom: `1px solid ${C.navBg}`, padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: C.darkAmber }}>FairSign</span>
          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: C.gold, color: C.white }}>BETA</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: C.navBg, border: `1px solid ${C.inputBorder}`,
              borderRadius: 8, padding: '7px 14px', color: C.darkAmber,
              fontSize: 13, cursor: 'pointer', fontFamily: 'sans-serif',
              transition: 'all .15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = C.tint
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = C.gold
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = C.navBg
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = C.inputBorder
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Dashboard
          </button>

          <span style={{ fontSize: 13, color: C.mutedText }}>
            {(session?.user as any)?.name}
          </span>
        </div>
      </nav>

      {/* ── Edit mode banner ── */}
      {isEditMode && (
        <div style={{
          background: C.tint, borderBottom: `1px solid ${C.goldBorder}`,
          padding: '10px 28px', display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          <p style={{ fontSize: 13, color: C.darkAmber, margin: 0 }}>
            <strong>Edit mode</strong> — Your existing answers are pre-filled. Change only what you need to update.
          </p>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <div style={{ width: '100%', maxWidth: 500 }}>

          {/* ── Progress bar ── */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: C.mutedText }}>Step {step + 1} of {STEPS.length}</span>
              <span style={{ fontSize: 12, color: C.gold, fontWeight: 600 }}>
                {Math.round(((step + 1) / STEPS.length) * 100)}% complete
              </span>
            </div>
            <div style={{ height: 4, background: C.goldMid, borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: 4, background: C.gold, borderRadius: 99,
                width: `${((step + 1) / STEPS.length) * 100}%`,
                transition: 'width .4s ease',
              }} />
            </div>
          </div>

          {/* ── Card ── */}
          <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.navBg}`, overflow: 'hidden', boxShadow: '0 2px 12px rgba(122,79,10,.06)' }}>

            {/* Warm header */}
            <div style={{ background: C.darkAmber, padding: '24px 28px' }}>
              <p style={{ fontSize: 11, color: C.tint, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 6px', opacity: 0.8 }}>
                {isEditMode ? 'Editing your profile' : 'Setting up your profile'}
              </p>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: C.white, margin: '0 0 6px' }}>
                {currentStep.title}
              </h1>
              <p style={{ fontSize: 13, color: C.tint, lineHeight: 1.5, margin: 0, opacity: 0.75 }}>
                {currentStep.subtitle}
              </p>
            </div>

            <div style={{ padding: '28px' }}>

              {/* ── Genre picker — step 0 only ── */}
              {step === 0 && (
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.darkText, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Primary genre <span style={{ color: C.gold }}>*</span>
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                    {GENRES.map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => { setGenre(g); setCustomGenre(''); setError('') }}
                        style={{
                          padding: '6px 14px', borderRadius: 99, fontSize: 13, cursor: 'pointer',
                          border: `1.5px solid ${genre === g ? C.darkAmber : C.inputBorder}`,
                          background: genre === g ? C.darkAmber : C.white,
                          color: genre === g ? C.white : '#555',
                          fontWeight: genre === g ? 600 : 400,
                          transition: 'all .15s',
                        }}
                      >
                        {g}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => { setGenre('Other'); setError('') }}
                      style={{
                        padding: '6px 14px', borderRadius: 99, fontSize: 13, cursor: 'pointer',
                        border: `1.5px solid ${genre === 'Other' ? C.gold : C.inputBorder}`,
                        background: genre === 'Other' ? C.tint : C.white,
                        color: genre === 'Other' ? C.gold : '#555',
                        transition: 'all .15s',
                      }}
                    >
                      Other
                    </button>
                  </div>
                  {genre === 'Other' && (
                    <input
                      autoFocus
                      type="text"
                      placeholder="e.g. Bongo Flava, Muganda..."
                      value={customGenre}
                      onChange={e => { setCustomGenre(e.target.value); setError('') }}
                      style={{
                        width: '100%', boxSizing: 'border-box', padding: '10px 14px',
                        border: `1.5px solid ${C.gold}`, borderRadius: 10, fontSize: 14,
                        color: C.darkText, outline: 'none', fontFamily: 'inherit', background: C.white,
                      }}
                    />
                  )}
                  {activeGenre && (
                    <p style={{ fontSize: 11, color: C.gold, marginTop: 6, fontWeight: 600 }}>
                      ✓ Labels will be matched to: {activeGenre}
                    </p>
                  )}
                </div>
              )}

              {/* ── Regular fields ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 24 }}>
                {currentStep.fields.map(field => (
                  <div key={field.key}>
                    <label style={{
                      display: 'block', fontSize: 12, fontWeight: 600, color: C.darkText,
                      marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5,
                    }}>
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      min={field.type === 'number' ? '0' : undefined}
                      placeholder={field.placeholder}
                      value={form[field.key] || ''}
                      onChange={e => handleChange(field.key, e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleNext()}
                      style={{
                        width: '100%', boxSizing: 'border-box', padding: '11px 14px',
                        border: `1px solid ${C.inputBorder}`, borderRadius: 10, fontSize: 14,
                        color: C.darkText, outline: 'none', fontFamily: 'inherit',
                        background: isEditMode && form[field.key] ? C.tint : C.white,
                      }}
                      onFocus={e => (e.target.style.borderColor = C.gold)}
                      onBlur={e => (e.target.style.borderColor = C.inputBorder)}
                    />
                    <p style={{ fontSize: 11, color: C.mutedText, marginTop: 4, marginBottom: 0 }}>{field.hint}</p>
                  </div>
                ))}
              </div>

              {/* ── Market reminder ── */}
              <div style={{
                background: C.tint, border: `1px solid ${C.goldBorder}`,
                borderRadius: 8, padding: '10px 14px', marginBottom: 20,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ fontSize: 16 }}>{MARKET_FLAG[market] ?? '🌍'}</span>
                <p style={{ fontSize: 12, color: C.mutedText, margin: 0 }}>
                  Matching labels in <strong style={{ color: C.darkText }}>{market}</strong> — set during signup.{' '}
                  <a href="/settings" style={{ color: C.gold }}>Change in settings</a>
                </p>
              </div>

              {/* ── Error ── */}
              {error && (
                <div style={{ background: C.errorBg, border: `1px solid ${C.errorBorder}`, borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
                  <p style={{ fontSize: 13, color: C.errorText, margin: 0 }}>{error}</p>
                </div>
              )}

              {/* ── Primary button ── */}
              <button
                onClick={handleNext}
                disabled={saving}
                style={{
                  width: '100%', padding: '13px',
                  background: saving ? C.navBg : C.darkAmber,
                  color: saving ? C.mutedText : C.white,
                  border: 'none', borderRadius: 10, fontSize: 15,
                  fontWeight: 600, cursor: saving ? 'default' : 'pointer',
                  marginBottom: 10, fontFamily: 'inherit', transition: 'background .15s',
                }}
              >
                {saving
                  ? 'Calculating your label matches…'
                  : isLast
                    ? (isEditMode ? 'Save changes →' : 'Show my label matches →')
                    : 'Continue →'}
              </button>

              {/* ── Step back / cancel edit ── */}
              <div style={{ display: 'flex', gap: 8 }}>
                {step > 0 && !saving && (
                  <button
                    onClick={() => setStep(s => s - 1)}
                    style={{
                      flex: 1, padding: '10px', background: 'transparent', color: C.mutedText,
                      border: 'none', borderRadius: 10, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    ← Back
                  </button>
                )}
                {isEditMode && !saving && (
                  <button
                    onClick={() => router.push('/dashboard')}
                    style={{
                      flex: 1, padding: '10px', background: 'transparent', color: C.mutedText,
                      border: `1px solid ${C.inputBorder}`, borderRadius: 10, fontSize: 13,
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    Cancel edit
                  </button>
                )}
              </div>

              <p style={{ fontSize: 11, color: C.mutedText, textAlign: 'center', marginTop: 12, lineHeight: 1.5 }}>
                {isEditMode
                  ? 'Only fields you change will be updated.'
                  : "Don't have exact numbers? Estimate — you can update anytime from your dashboard."}
              </p>
            </div>
          </div>

          {/* ── Step dots ── */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
            {STEPS.map((s, i) => (
              <div
                key={s.id}
                style={{
                  width: i === step ? 24 : 8, height: 8, borderRadius: 99,
                  background: i === step ? C.gold : i < step ? C.darkAmber : C.goldMid,
                  transition: 'all .3s ease',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
