'use client'

// components/DealReadinessDashboard.tsx

import { useState, useEffect } from 'react'
import {
  ReadinessData, LabelScore, METRICS,
  getScoreTier, formatNumber, buildLabelScores,
} from '@/lib/dealReadiness'

interface RoadmapStep {
  title: string; description: string; timeframe: string; metric: string
}

interface Props {
  data: ReadinessData | null
  onSetup: () => void
}

export default function DealReadinessDashboard({ data, onSetup }: Props) {
  const [expanded, setExpanded]         = useState<string | null>(null)
  const [roadmap, setRoadmap]           = useState<RoadmapStep[] | null>(null)
  const [loadingRoadmap, setLoading]    = useState(false)
  const [showRoadmap, setShowRoadmap]   = useState(false)
  const [filterTier, setFilterTier]     = useState<string>('All')
  const [showQualifiedOnly, setQualified] = useState(false)

  const stats       = data?.stats
  const profile     = data?.profile as any
  const labelScores: LabelScore[] = data?.labelScores ?? []
  const score       = data?.overallScore ?? null
  const tier        = score !== null ? getScoreTier(score) : null
  const closestLabel = labelScores.find(l => !l.qualified) ?? labelScores[0]

  // Filter logic
  const tiers = ['All', ...Array.from(new Set(labelScores.map(l => l.tier)))]
  const filtered = labelScores.filter(l => {
    if (filterTier !== 'All' && l.tier !== filterTier) return false
    if (showQualifiedOnly && !l.qualified) return false
    return true
  })

  async function generateRoadmap() {
    if (!stats || !closestLabel) return
    if (roadmap) { setShowRoadmap(v => !v); return }
    setLoading(true)
    setShowRoadmap(true)

    const gaps = METRICS.map(({ key, label }) => {
      const cur = stats[key] ?? 0
      const req = closestLabel.requirements[key]
      return { metric: label, current: cur, required: req, gap: Math.max(req - cur, 0) }
    }).filter(g => g.gap > 0)

    const gapText = gaps.map(g => `- ${g.metric}: currently ${formatNumber(g.current)}, needs ${formatNumber(g.required)}`).join('\n')

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `You are a music industry advisor for African artists using FairSign.

Artist's genre: ${profile?.genre || 'Afrobeats'}. Market: ${profile?.market || 'Uganda'}.
Target label: "${closestLabel.name}" (${closestLabel.country}). Readiness: ${closestLabel.score}%.

Metric gaps:
${gapText}

Write exactly 4 specific, actionable steps to close these gaps. Reference Audiomack, Boomplay, local radio, and East/West African music industry context where relevant. Order by quickest wins first.

Respond ONLY with a JSON array, no markdown:
[{"title":"...","description":"...","timeframe":"...","metric":"..."}]`,
          }],
        }),
      })
      const json = await res.json()
      const text = (json.content as { type: string; text?: string }[])?.map(c => c.text || '').join('') ?? ''
      setRoadmap(JSON.parse(text.trim()))
    } catch {
      setRoadmap([
        { title: 'Push on Audiomack daily', description: 'Share your Audiomack link in WhatsApp music groups, Twitter/X spaces and DJ networks. Ask DJs to playlist your track.', timeframe: '2–4 weeks', metric: 'Audiomack monthly streams' },
        { title: 'Post 4 Reels per week', description: 'Behind-the-scenes, lyrics clips, studio footage. Use Uganda and East Africa hashtags. Engage with comments within the first hour.', timeframe: '4–6 weeks', metric: 'Instagram followers' },
        { title: 'Release a single + video', description: 'One polished single with a low-budget video counts as an official release and boosts all your metrics simultaneously.', timeframe: '6–8 weeks', metric: 'Original releases' },
        { title: 'Distribute to Boomplay', description: 'Use DistroKid or TuneCore to get on Boomplay. Ask fans to stream and share your YouTube video to build monthly views.', timeframe: '1–2 weeks', metric: 'YouTube monthly views' },
      ])
    } finally {
      setLoading(false)
    }
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!data || !stats) {
    return (
      <div style={{ background: '#fff', borderRadius: 16, border: '1px dashed #ede8dc', padding: '36px 28px', textAlign: 'center' }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(201,146,42,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 24 }}>📋</div>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0a2316', marginBottom: 6 }}>See which labels want you</h3>
        <p style={{ fontSize: 13, color: '#9b9b9b', marginBottom: 22, lineHeight: 1.7, maxWidth: 340, margin: '0 auto 22px' }}>
          Fill in your streaming numbers and we'll match you against real African labels — and tell you exactly what you need to get signed.
        </p>
        <button onClick={onSetup} style={{ padding: '11px 28px', background: '#0a2316', color: '#f9f5ec', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          Get my label matches →
        </button>
      </div>
    )
  }

  const qualifiedCount = labelScores.filter(l => l.qualified).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── Score header ── */}
      <div style={{ background: '#0a2316', borderRadius: 16, padding: '22px 26px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 14 }}>
          <div>
            <p style={{ fontSize: 11, color: '#c9922a', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Deal Readiness Score</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 42, fontWeight: 800, color: '#f9f5ec', lineHeight: 1 }}>{score}</span>
              <span style={{ fontSize: 15, color: 'rgba(249,245,236,.35)' }}>/100</span>
              {tier && (
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: tier.bg, color: tier.color, marginLeft: 6 }}>
                  {tier.label}
                </span>
              )}
            </div>
            <p style={{ fontSize: 13, color: 'rgba(249,245,236,.45)', marginTop: 6 }}>
              {qualifiedCount > 0
                ? <><strong style={{ color: '#4ade80' }}>{qualifiedCount} label{qualifiedCount !== 1 ? 's' : ''}</strong> ready to consider you now</>
                : <>Closest: <strong style={{ color: 'rgba(249,245,236,.7)' }}>{closestLabel?.name}</strong> — {closestLabel?.score}% there</>
              }
            </p>
            {profile?.genre && (
              <p style={{ fontSize: 11, color: 'rgba(249,245,236,.3)', marginTop: 2 }}>
                Genre: {profile.genre} · Market: {profile.market || 'Uganda'}
              </p>
            )}
          </div>

          {/* Ring */}
          <svg width="80" height="80" viewBox="0 0 80 80" aria-hidden="true">
            <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="7" />
            <circle cx="40" cy="40" r="32" fill="none" stroke={tier?.color ?? '#c9922a'} strokeWidth="7"
              strokeLinecap="round" strokeDasharray="201" strokeDashoffset={201 - (201 * (score ?? 0)) / 100}
              transform="rotate(-90 40 40)" />
            <text x="40" y="45" textAnchor="middle" fontSize="15" fontWeight="700" fill={tier?.color ?? '#c9922a'}>{score}</text>
          </svg>
        </div>

        {/* Streaming stats strip */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px', padding: '14px 16px', background: 'rgba(255,255,255,.05)', borderRadius: 10, border: '1px solid rgba(255,255,255,.07)' }}>
          {[
            { label: 'Audiomack', value: formatNumber(stats.audiomack), sub: '/mo' },
            { label: 'Spotify',   value: formatNumber(stats.spotify),   sub: '/mo' },
            { label: 'YouTube',   value: formatNumber(stats.youtube),   sub: '/mo' },
            { label: 'Instagram', value: formatNumber(stats.instagram), sub: '' },
            { label: 'TikTok',    value: formatNumber(stats.tiktok),    sub: '' },
            { label: 'Releases',  value: stats.releases,               sub: '' },
          ].map(m => (
            <div key={m.label}>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#f9f5ec' }}>{m.value}{m.sub}</span>
              <span style={{ fontSize: 11, color: 'rgba(249,245,236,.35)', marginLeft: 4 }}>{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Label matches ── */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #ede8dc', padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0a2316', margin: 0 }}>
            Label matches for you
          </h3>
          <a href="/onboarding" style={{ fontSize: 12, color: '#c9922a', textDecoration: 'none', fontWeight: 600 }}>Update my stats</a>
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
          {tiers.map(t => (
            <button key={t} onClick={() => setFilterTier(t)} style={{
              padding: '5px 12px', borderRadius: 99, fontSize: 12, cursor: 'pointer',
              border: `1px solid ${filterTier === t ? '#0a2316' : '#ddd8cc'}`,
              background: filterTier === t ? '#0a2316' : '#fff',
              color: filterTier === t ? '#f9f5ec' : '#555',
              fontWeight: filterTier === t ? 600 : 400,
            }}>{t}</button>
          ))}
          <button onClick={() => setQualified(v => !v)} style={{
            padding: '5px 12px', borderRadius: 99, fontSize: 12, cursor: 'pointer', marginLeft: 4,
            border: `1px solid ${showQualifiedOnly ? '#16a34a' : '#ddd8cc'}`,
            background: showQualifiedOnly ? '#f0fdf4' : '#fff',
            color: showQualifiedOnly ? '#16a34a' : '#555',
            fontWeight: showQualifiedOnly ? 600 : 400,
          }}>
            {showQualifiedOnly ? '✓ ' : ''}Ready now only
          </button>
        </div>

        {filtered.length === 0 && (
          <p style={{ fontSize: 13, color: '#9b9b9b', textAlign: 'center', padding: '20px 0' }}>
            No labels match these filters. Try adjusting.
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(label => {
            const t = getScoreTier(label.score)
            const isOpen = expanded === label.name
            return (
              <div key={label.name} style={{ borderRadius: 12, border: `1px solid ${label.qualified ? '#bbf7d0' : '#ede8dc'}`, background: label.qualified ? '#f0fdf4' : '#fafaf8', overflow: 'hidden' }}>

                {/* Label row */}
                <button
                  onClick={() => setExpanded(isOpen ? null : label.name)}
                  style={{ width: '100%', padding: '14px 16px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12 }}
                >
                  {/* Score ring mini */}
                  <div style={{ width: 44, height: 44, flexShrink: 0, position: 'relative' }}>
                    <svg width="44" height="44" viewBox="0 0 44 44">
                      <circle cx="22" cy="22" r="18" fill="none" stroke="#E5E7EB" strokeWidth="4" />
                      <circle cx="22" cy="22" r="18" fill="none" stroke={t.color} strokeWidth="4"
                        strokeLinecap="round" strokeDasharray="113"
                        strokeDashoffset={113 - (113 * label.score) / 100}
                        transform="rotate(-90 22 22)" />
                      <text x="22" y="26" textAnchor="middle" fontSize="10" fontWeight="700" fill={t.color}>{label.score}%</text>
                    </svg>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#0a2316' }}>{label.name}</span>
                      {label.qualified && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: '#16a34a', color: '#fff' }}>READY NOW</span>
                      )}
                      <span style={{ fontSize: 11, color: '#9b9b9b' }}>{label.country} · {label.tier}</span>
                    </div>
                    {label.notableActs.length > 0 && (
                      <p style={{ fontSize: 11, color: '#9b9b9b', margin: '2px 0 0' }}>
                        {label.notableActs.slice(0, 3).join(', ')}
                      </p>
                    )}
                  </div>

                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
                    <path d="M3 5l4 4 4-4" stroke="#9b9b9b" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>

                {/* Expanded detail */}
                {isOpen && (
                  <div style={{ padding: '0 16px 16px', borderTop: '1px solid #ede8dc' }}>
                    <p style={{ fontSize: 13, color: '#6b6b6b', margin: '14px 0 16px', lineHeight: 1.6 }}>{label.description}</p>

                    {/* Genres */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                      {label.genres.map(g => (
                        <span key={g} style={{ fontSize: 11, padding: '2px 10px', borderRadius: 99, background: 'rgba(10,35,22,.07)', color: '#0a2316', fontWeight: 500 }}>{g}</span>
                      ))}
                    </div>

                    {/* Metric breakdown */}
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Your numbers vs. their requirements</p>
                    {METRICS.map(({ key, label: mLabel }) => {
                      const cur = stats[key] ?? 0
                      const req = label.requirements[key]
                      const pct = Math.min(Math.round((cur / req) * 100), 100)
                      const met = cur >= req
                      return (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 9 }}>
                          <span style={{ fontSize: 11, color: '#6b6b6b', width: 148, flexShrink: 0 }}>{mLabel}</span>
                          <div style={{ flex: 1, height: 5, background: '#E5E7EB', borderRadius: 99, overflow: 'hidden' }}>
                            <div style={{ height: 5, borderRadius: 99, background: met ? '#16a34a' : '#d97706', width: `${pct}%`, transition: 'width .5s ease' }} />
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 600, color: met ? '#16a34a' : '#6b6b6b', minWidth: 90, textAlign: 'right' }}>
                            {formatNumber(cur)} <span style={{ color: '#ccc', fontWeight: 400 }}>/ {formatNumber(req)}</span>
                          </span>
                          {met && <span style={{ fontSize: 12 }}>✓</span>}
                        </div>
                      )
                    })}

                    {/* CTA */}
                    {label.website && (
                      <a href={label.website} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: 12, padding: '8px 16px', borderRadius: 8, background: '#0a2316', color: '#f9f5ec', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                        Visit {label.name} →
                      </a>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Roadmap ── */}
      <div style={{ background: '#0a2316', borderRadius: 16, padding: '20px 24px' }}>
        <button
          onClick={generateRoadmap}
          style={{ width: '100%', padding: '11px', background: 'rgba(201,146,42,.15)', border: '1px solid rgba(201,146,42,.25)', borderRadius: 10, color: '#c9922a', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: showRoadmap ? 16 : 0 }}
        >
          {showRoadmap ? '↑ Hide roadmap' : `📋 Show my roadmap to ${closestLabel?.name ?? 'my next label'}`}
        </button>

        {showRoadmap && (
          <>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f9f5ec', margin: '0 0 14px' }}>
              Your roadmap to {closestLabel?.name}
            </h3>

            {loadingRoadmap && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#c9922a', opacity: 0.7, animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
                <span style={{ fontSize: 13, color: 'rgba(249,245,236,.5)' }}>Generating your personalised roadmap…</span>
              </div>
            )}

            {roadmap && roadmap.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, padding: '12px 0', borderBottom: i < roadmap.length - 1 ? '1px solid rgba(255,255,255,.06)' : 'none' }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(74,222,128,.15)', color: '#4ade80', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4, flexWrap: 'wrap', gap: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#f9f5ec' }}>{step.title}</span>
                    <span style={{ fontSize: 11, color: '#c9922a', fontWeight: 600 }}>{step.timeframe}</span>
                  </div>
                  <p style={{ fontSize: 12, color: 'rgba(249,245,236,.5)', margin: '0 0 4px', lineHeight: 1.6 }}>{step.description}</p>
                  <span style={{ fontSize: 11, color: '#c9922a' }}>↑ {step.metric}</span>
                </div>
              </div>
            ))}

            <p style={{ fontSize: 11, color: 'rgba(249,245,236,.2)', textAlign: 'right', marginTop: 14, marginBottom: 0 }}>
              Last updated: {data.completedAt ? new Date(data.completedAt).toLocaleDateString('en-UG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
            </p>
          </>
        )}
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:.2} 50%{opacity:1} }`}</style>
    </div>
  )
}
