'use client'
import { useEffect, useRef } from 'react'

// Real instrument photos from Unsplash (free, no API key)
const INSTRUMENTS = [
  { name: 'Guitar',         url: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=500&fit=crop&auto=format&q=80' },
  { name: 'Piano',          url: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&h=500&fit=crop&auto=format&q=80' },
  { name: 'Trumpet',        url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=500&fit=crop&auto=format&q=80' },
  { name: 'Violin',         url: 'https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?w=400&h=500&fit=crop&auto=format&q=80' },
  { name: 'Drums',          url: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=400&h=500&fit=crop&auto=format&q=80' },
  { name: 'Saxophone',      url: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=500&fit=crop&auto=format&q=80' },
  { name: 'Microphone',     url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=500&fit=crop&auto=format&q=80' },
  { name: 'Cello',          url: 'https://images.unsplash.com/photo-1465821185615-20b3c2fbf41b?w=400&h=500&fit=crop&auto=format&q=80' },
  { name: 'Acoustic Guitar', url: 'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=400&h=500&fit=crop&auto=format&q=80' },
  { name: 'Flute',          url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=500&fit=crop&auto=format&q=80' },
]

const COL1 = [0, 2, 4, 6, 8, 1, 3, 5]
const COL2 = [7, 9, 1, 3, 5, 0, 8, 6]

export default function InstrumentCarousel() {
  const col1Ref = useRef<HTMLDivElement>(null)
  const col2Ref = useRef<HTMLDivElement>(null)
  const rafRef  = useRef<number>(0)

  useEffect(() => {
    const CARD_H = 220
    const GAP    = 12
    const UNIT   = CARD_H + GAP
    const total1 = COL1.length * UNIT
    const total2 = COL2.length * UNIT

    let pos1 = 0
    let pos2 = UNIT * 2.5

    const tick = () => {
      pos1 += 0.38
      pos2 += 0.56
      if (pos1 >= total1 / 2) pos1 = 0
      if (pos2 >= total2 / 2) pos2 = 0
      if (col1Ref.current) col1Ref.current.style.transform = `translateY(${-pos1}px)`
      if (col2Ref.current) col2Ref.current.style.transform = `translateY(${-pos2}px)`
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const doubled1 = [...COL1, ...COL1]
  const doubled2 = [...COL2, ...COL2]

  const card: React.CSSProperties = {
    width: '100%', height: 220, borderRadius: 14,
    overflow: 'hidden', flexShrink: 0, position: 'relative',
  }

  const img: React.CSSProperties = {
    width: '100%', height: '100%', objectFit: 'cover', display: 'block',
    // Warm amber/sepia tint — no green
    filter: 'brightness(0.68) saturate(0.7) sepia(0.28)',
  }

  // Amber overlay per card — reinforces warm theme
  const tint: React.CSSProperties = {
    position: 'absolute', inset: 0,
    background: 'rgba(122,79,10,0.18)',
    mixBlendMode: 'multiply',
  }

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      display: 'flex', gap: 12, padding: '0 14px',
    }}>
      {/* Column 1 */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <div ref={col1Ref} style={{ display: 'flex', flexDirection: 'column', gap: 12, willChange: 'transform' }}>
          {doubled1.map((idx, i) => (
            <div key={i} style={card}>
              <img src={INSTRUMENTS[idx].url} alt="" style={img} loading="lazy" />
              <div style={tint} />
            </div>
          ))}
        </div>
      </div>

      {/* Column 2 — offset start */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative', marginTop: 60 }}>
        <div ref={col2Ref} style={{ display: 'flex', flexDirection: 'column', gap: 12, willChange: 'transform' }}>
          {doubled2.map((idx, i) => (
            <div key={i} style={card}>
              <img src={INSTRUMENTS[idx].url} alt="" style={img} loading="lazy" />
              <div style={tint} />
            </div>
          ))}
        </div>
      </div>

      {/* Fade top — warm brown, not green */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 140,
        background: 'linear-gradient(to bottom, #1E1206 0%, #1E1206 20%, transparent 100%)',
        pointerEvents: 'none', zIndex: 2,
      }} />
      {/* Fade bottom */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 140,
        background: 'linear-gradient(to top, #1E1206 0%, #1E1206 20%, transparent 100%)',
        pointerEvents: 'none', zIndex: 2,
      }} />
      {/* Left edge */}
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: 48,
        background: 'linear-gradient(to right, #1E1206 0%, transparent 100%)',
        pointerEvents: 'none', zIndex: 2,
      }} />
      {/* Right edge — fades toward the gradient blend zone */}
      <div style={{
        position: 'absolute', top: 0, right: 0, bottom: 0, width: 80,
        background: 'linear-gradient(to left, #2C1A06 0%, transparent 100%)',
        pointerEvents: 'none', zIndex: 2,
      }} />
    </div>
  )
}
