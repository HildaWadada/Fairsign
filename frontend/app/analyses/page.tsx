'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import toast from 'react-hot-toast'
import type { Market, Personality, ContractAnalysis } from '@/types'
import AnalysisResults from '@/components/AnalysisResults'
import RedFlagCard from '@/components/RedFlagCard'
import ChatInterface from '@/components/ChatInterface'
import LanguageTranslator from '@/components/LanguageTranslator'
import WhatsAppShare from '@/components/WhatsAppShare'
import NegotiationSimulator from '@/components/NegotiationSimulator'
import { Download, Star } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
type WorkspaceTab = 'overview' | 'redflags' | 'language' | 'simulator' | 'chat' | 'share' | 'export'

const MARKET_FLAGS: Record<string, string> = {
  Uganda: '🇺🇬', Nigeria: '🇳🇬', Kenya: '🇰🇪', 'South Africa': '🇿🇦',
}

// ─── SVG Icon ─────────────────────────────────────────────────────────────────
const Ico = ({ d, size = 16, stroke = 'currentColor' }: { d: string | string[], size?: number, stroke?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
)

const P = {
  dashboard: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  analyses:  ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6'],
  promotion: ['M22 2L11 13', 'M22 2l-7 20-4-9-9-4 20-7z'],
  label:     ['M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z', 'M7 7h.01'],
  logout:    ['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'M16 17l5-5-5-5', 'M21 12H9'],
  settings:  'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z',
  search:    ['M11 17a6 6 0 1 0 0-12 6 6 0 0 0 0 12z', 'M21 21l-4.35-4.35'],
  user:      ['M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'],
  bell:      ['M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9', 'M13.73 21a2 2 0 0 1-3.46 0'],
  globe:     ['M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z', 'M2 12h20', 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'],
  chevron:   'M9 18l6-6-6-6',
  copy:      ['M20 9H11a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2z', 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9'],
  whatsapp:  'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z',
}

// Score helpers — matches exact values from screenshot (score out of 10)
const scoreColor = (s: number) => s >= 7 ? '#15803d' : s >= 4 ? '#B87A14' : '#DC2626'
const scoreBg    = (s: number) => s >= 7 ? '#F0FDF4' : s >= 4 ? '#FEF3DC' : '#FEF2F2'

// Status label from score_label field
const statusColor = (label: string) => {
  const l = (label || '').toLowerCase()
  if (l.includes('exploit') || l.includes('risky')) return { color: '#DC2626', bg: '#FEF2F2' }
  if (l.includes('fair') || l.includes('artist') || l.includes('good')) return { color: '#15803d', bg: '#F0FDF4' }
  return { color: '#B87A14', bg: '#FEF3DC' }
}

// ─── Settings Dropdown ────────────────────────────────────────────────────────
function SettingsDropdown({ onClose, onNav }: { onClose: () => void, onNav: (k: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose() }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [onClose])

  const items = [
    { key: 'profile', label: 'Profile', icon: P.user },
    { key: 'appearance', label: 'Appearance', icon: P.globe },
    { key: 'notifications', label: 'Notifications', icon: P.bell },
    { key: 'account', label: 'Account Settings', icon: P.settings },
  ]
  return (
    <div ref={ref} style={{
      position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 300,
      background: '#fff', border: '1px solid #EDEBE6', borderRadius: 14,
      boxShadow: '0 8px 32px rgba(0,0,0,0.10)', padding: 6, minWidth: 200,
    }}>
      {items.map(item => (
        <button key={item.key} onClick={() => { onNav(item.key); onClose() }} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', borderRadius: 9, border: 'none', background: 'transparent',
          color: '#3D3530', fontSize: 14, fontWeight: 500, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
        }}
          onMouseEnter={e => (e.currentTarget.style.background = '#FEF3DC')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <span style={{ color: '#B87A14' }}><Ico d={item.icon} size={15} /></span>
          {item.label}
        </button>
      ))}
    </div>
  )
}

// Overview tab just uses the real AnalysisResults component — same as dashboard

// ─── Red Flags Tab ────────────────────────────────────────────────────────────
function RedFlagsTab({ analysis, market }: { analysis: ContractAnalysis, market: Market }) {
  const flags = analysis.redFlags || []
  if (!flags.length) return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#8A7F72' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
      <div style={{ fontWeight: 600, fontSize: 15, color: '#1A1208' }}>No red flags detected</div>
      <div style={{ fontSize: 13, marginTop: 4 }}>This contract appears relatively fair.</div>
    </div>
  )
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ fontSize: 13, color: '#8A7F72', marginBottom: 4 }}>
        {flags.length} clause{flags.length !== 1 ? 's' : ''} need{flags.length === 1 ? 's' : ''} your attention.
      </p>
      {[...flags]
        .sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.severity] - { high: 0, medium: 1, low: 2 }[b.severity]))
        .map((flag, i) => <RedFlagCard key={i} flag={flag} market={market} />)
      }
    </div>
  )
}

// ─── Export handler (same logic as dashboard) ─────────────────────────────────
async function doExport(analysis: ContractAnalysis, filename: string, market: string) {
  try {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const W = 210, margin = 18; let y = 20
    const maxW = W - margin * 2
    const addText = (text: string, size: number, bold: boolean, color: [number, number, number]) => {
      doc.setFontSize(size); doc.setFont('helvetica', bold ? 'bold' : 'normal'); doc.setTextColor(...color)
      const lines = doc.splitTextToSize(text, maxW)
      lines.forEach((line: string) => { if (y > 270) { doc.addPage(); y = 20 } doc.text(line, margin, y); y += size * 0.45 }); y += 2
    }
    doc.setFillColor(184, 122, 20); doc.rect(0, 0, W, 28, 'F')
    doc.setFontSize(18); doc.setFont('helvetica', 'bold'); doc.setTextColor(254, 252, 248); doc.text('FairSign', margin, 17)
    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(122, 79, 10); doc.text('MUSIC CONTRACT ANALYSIS', margin + 36, 17)
    doc.setTextColor(180, 175, 165); doc.text(`${new Date().toLocaleDateString()}  ·  ${market}`, W - margin, 17, { align: 'right' })
    y = 38
    addText('Summary', 12, true, [26, 18, 8]); addText(analysis.summary || '', 10, false, [50, 50, 50])
    if (analysis.redFlags?.length) {
      y += 6; addText('Red Flags', 12, true, [26, 18, 8])
      analysis.redFlags.forEach(f => { addText(`• [${f.severity?.toUpperCase()}] ${f.clause || f.title || ''}`, 10, true, [60, 40, 10]); addText(f.explanation || f.description || '', 9, false, [80, 70, 60]) })
    }
    doc.save(`fairsign-${filename.replace(/\.[^/.]+$/, '')}.pdf`)
    toast.success('PDF exported!')
  } catch { toast.error('Export failed.') }
}

// ─── Export Tab ───────────────────────────────────────────────────────────────
function ExportTab({ analysis, filename, market }: { analysis: ContractAnalysis, filename: string, market: string }) {
  const [exporting, setExporting] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: '#fff', border: '1px solid #EDEBE6', borderRadius: 14, padding: '24px 24px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1208', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Export as PDF</div>
        <div style={{ fontSize: 13, color: '#8A7F72', marginBottom: 20, lineHeight: 1.6 }}>
          Download a full report of this contract analysis — executive summary, deal score, red flags, and key recommendations.
        </div>
        <button onClick={async () => { setExporting(true); await doExport(analysis, filename, market); setExporting(false) }}
          disabled={exporting} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px',
            borderRadius: 9, background: '#B87A14', color: '#fff', border: 'none',
            fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: exporting ? 0.6 : 1,
          }}>
          <Download size={15} color="#fff" />
          {exporting ? 'Exporting…' : 'Download PDF Report'}
        </button>
      </div>
    </div>
  )
}

// ─── Share Tab ────────────────────────────────────────────────────────────────
function ShareTabInline({ analysis, sessionId, market }: { analysis: ContractAnalysis, sessionId: string, market: string }) {
  const [copied, setCopied] = useState(false)
  const score = analysis.dealScore ?? 0
  const summary = (analysis.summary || '').slice(0, 200)
  const message = `🎵 FairSign Contract Analysis\n\nFairness Score: ${score}/10 — ${analysis.scoreLabel || ''}\n\n${summary}…\n\nAnalyse your contracts free: https://fairsign.app`
  const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: '#fff', border: '1px solid #EDEBE6', borderRadius: 14, padding: '24px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1208', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Share via WhatsApp</div>
        <div style={{ fontSize: 13, color: '#8A7F72', marginBottom: 14 }}>Send a summary to your manager, lawyer, or bandmates.</div>
        <div style={{ background: '#FEFCF8', border: '1px solid #EDEBE6', borderRadius: 10, padding: '14px 16px', fontSize: 13, color: '#3D3530', lineHeight: 1.7, marginBottom: 16, whiteSpace: 'pre-wrap' }}>
          {message}
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a href={waUrl} target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 20px',
            borderRadius: 9, background: '#25D366', color: '#fff', textDecoration: 'none',
            fontSize: 14, fontWeight: 600,
          }}>
            <Ico d={P.whatsapp} size={15} stroke="#fff" /> Open in WhatsApp
          </a>
          <button onClick={() => { navigator.clipboard.writeText(message); setCopied(true); setTimeout(() => setCopied(false), 2000) }} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 20px',
            borderRadius: 9, border: '1px solid #EDEBE6', background: '#fff', color: '#B87A14',
            fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            <Ico d={P.copy} size={15} stroke="#B87A14" />
            {copied ? 'Copied!' : 'Copy text'}
          </button>
        </div>
      </div>
      {/* Also render the full WhatsAppShare component if it has extra functionality */}
      <WhatsAppShare sessionId={sessionId} market={market as Market} />
    </div>
  )
}

// ─── Feedback row ─────────────────────────────────────────────────────────────
function FeedbackRow({ sessionId }: { sessionId: string }) {
  const [rating, setRating] = useState(0)
  const [sent, setSent] = useState(false)
  const send = async (n: number) => {
    setRating(n)
    try {
      const form = new FormData(); form.append('session_id', sessionId); form.append('rating', String(n))
      await axios.post('/api/feedback', form); setSent(true); toast.success('Thanks for your feedback!')
    } catch { toast.error('Could not send feedback.') }
  }
  return (
    <div style={{ marginTop: 24, padding: '16px', borderRadius: 12, border: '1px solid #EDEBE6', textAlign: 'center', background: '#FEFCF8' }}>
      {sent ? <p style={{ fontSize: 13, color: '#8A7F72', margin: 0 }}>✅ Thanks for your feedback!</p> : (
        <>
          <p style={{ fontSize: 13, color: '#8A7F72', marginBottom: 10 }}>Was this analysis helpful?</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => send(n)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                <Star size={20} fill={rating >= n ? '#B87A14' : 'none'} color={rating >= n ? '#B87A14' : '#EDEBE6'} />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Main content ─────────────────────────────────────────────────────────────
function AnalysesContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const autoSessionId = searchParams.get('session')

  const [history, setHistory]         = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [selectedId, setSelectedId]   = useState<string | null>(null)
  const [analysis, setAnalysis]       = useState<ContractAnalysis | null>(null)
  const [currentFilename, setCurrentFilename] = useState('')
  const [currentMarket, setCurrentMarket]     = useState('Uganda')
  const [loadingAnalysis, setLoadingAnalysis] = useState(false)
  const [activeTab, setActiveTab]     = useState<WorkspaceTab>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [backendToken, setBackendToken] = useState<string | null>(null)

  const name = session?.user?.name || 'Artist'
  const sessionMarket = ((session?.user as any)?.market || 'Uganda') as Market
  const personality: Personality = 'formal'

  // ── Token helper (same as dashboard) ──────────────────────────────────────
  const getToken = async (): Promise<string | null> => {
    const existing = (session as any)?.backendToken
    if (existing) return existing
    if (backendToken) return backendToken
    if (session?.user?.email) {
      try {
        const res = await axios.post('/backend/auth/google', {
          google_id: (session as any)?.user?.id || session!.user!.email,
          email: session!.user!.email,
          name: session!.user!.name || '',
        })
        const t = res.data.token; setBackendToken(t); return t
      } catch { return null }
    }
    return null
  }

  // ── Fetch history (same auth pattern as dashboard) ────────────────────────
  const fetchHistory = async () => {
    setLoadingHistory(true)
    try {
      const token = await getToken()
      if (!token) { setLoadingHistory(false); return }
      const { data } = await axios.get('/api/history', { headers: { Authorization: `Bearer ${token}` } })
      const sorted = Array.isArray(data)
        ? [...data].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
        : []
      setHistory(sorted)
    } catch { setHistory([]) } finally { setLoadingHistory(false) }
  }

  useEffect(() => { if (session) fetchHistory() }, [session?.user?.email])

  // ── Auto-select contract from URL param (after new analysis) ──────────────
  useEffect(() => {
    if (autoSessionId && history.length > 0 && !selectedId) {
      loadContract(autoSessionId, history.find(h => (h.id || h.session_id) === autoSessionId)?.filename || 'contract', history.find(h => (h.id || h.session_id) === autoSessionId)?.market || sessionMarket)
    }
  }, [autoSessionId, history])

  // ── Load a contract's full analysis ──────────────────────────────────────
  const loadContract = async (id: string, filename: string, market: string) => {
    setSelectedId(id)
    setCurrentFilename(filename)
    setCurrentMarket(market)
    setActiveTab('overview')
    setLoadingAnalysis(true)
    setAnalysis(null)
    try {
      const token = await getToken()
      const { data } = await axios.get(`/api/history/${id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      setAnalysis(data.analysis || data)
    } catch { toast.error('Could not load analysis.') } finally { setLoadingAnalysis(false) }
  }

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = history.filter(h => {
    const q = searchQuery.toLowerCase()
    return !q || (h.filename || '').toLowerCase().includes(q) || (h.score_label || '').toLowerCase().includes(q) || (h.market || '').toLowerCase().includes(q)
  })

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', path: '/dashboard' },
    { key: 'analyses',  label: 'Analyses',  path: '/analyses'  },
    { key: 'promotion', label: 'Promotion', path: '/promotion' },
    { key: 'label',     label: 'Label Match',path: '/onboarding'},
  ]

  const TABS: { id: WorkspaceTab, label: string }[] = [
    { id: 'overview',   label: 'Overview'    },
    { id: 'redflags',   label: `Red Flags${analysis ? ` (${analysis.redFlags?.length ?? 0})` : ''}` },
    { id: 'language',   label: '🌍 Translate' },
    { id: 'simulator',  label: '🥊 Simulate'  },
    { id: 'chat',       label: 'Ask FairSign' },
    { id: 'share',      label: '📱 Share'     },
    { id: 'export',     label: 'Export'       },
  ]

  return (
    <>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; background: #FEFCF8; font-family: 'Inter', sans-serif; color: #3D3530; }
        button, input { font-family: inherit; }

        .shell { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }

        /* Top nav */
        .topnav { height: 56px; background: #fff; border-bottom: 1px solid #EDEBE6; display: flex; align-items: center; padding: 0 20px 0 0; flex-shrink: 0; z-index: 100; position: relative; }
        .topnav-logo { width: 220px; display: flex; align-items: center; gap: 10px; padding: 0 20px; flex-shrink: 0; text-decoration: none; }
        .logo-box { width: 30px; height: 30px; background: #B87A14; border-radius: 7px; display: flex; align-items: center; justify-content: center; font-family: 'Playfair Display', serif; font-weight: 700; font-size: 15px; color: #fff; }
        .logo-name { font-weight: 700; font-size: 16px; color: #1A1208; letter-spacing: -0.02em; }
        .logo-beta { font-size: 9px; font-weight: 700; padding: 2px 7px; background: #FEF3DC; color: #7A4F0A; border-radius: 99px; border: 1px solid #F0D9A0; }
        .nav-sp { flex: 1; }
        .nav-actions { display: flex; align-items: center; gap: 8px; position: relative; }
        .market-badge { background: #FEF3DC; border: 1px solid #F0D9A0; border-radius: 20px; padding: 4px 12px; font-size: 12px; font-weight: 600; color: #7A4F0A; }
        .icon-btn { width: 36px; height: 36px; border-radius: 9px; border: 1px solid #EDEBE6; background: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #8A7F72; transition: all .15s; }
        .icon-btn:hover { background: #FEF3DC; color: #B87A14; border-color: #F0D9A0; }
        .avatar { width: 32px; height: 32px; border-radius: 50%; background: #B87A14; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #fff; }

        /* Layout */
        .body { flex: 1; display: flex; overflow: hidden; }

        /* Left sidebar nav */
        .sidenav { width: 220px; background: #fff; border-right: 1px solid #EDEBE6; display: flex; flex-direction: column; flex-shrink: 0; padding: 16px 10px; }
        .sidenav-label { font-size: 10px; font-weight: 600; color: #B4A99A; letter-spacing: .1em; text-transform: uppercase; padding: 0 10px; margin: 16px 0 6px; }
        .sidenav-btn { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 12px; border-radius: 10px; border: none; background: transparent; color: #8A7F72; font-size: 13.5px; font-weight: 500; cursor: pointer; text-align: left; transition: all .15s; margin-bottom: 2px; }
        .sidenav-btn:hover { background: #FEF3DC; color: #B87A14; }
        .sidenav-btn.active { background: #FEF3DC; color: #B87A14; font-weight: 600; }
        .sidenav-sp { flex: 1; }
        .logout-btn { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 12px; border-radius: 10px; border: none; background: transparent; color: #B4A99A; font-size: 13.5px; font-weight: 500; cursor: pointer; text-align: left; transition: all .15s; }
        .logout-btn:hover { background: #FFF0F0; color: #C0392B; }

        /* Three-panel content */
        .panels { flex: 1; display: flex; overflow: hidden; }

        /* Contract list panel */
        .list-panel { width: 300px; border-right: 1px solid #EDEBE6; display: flex; flex-direction: column; background: #fff; flex-shrink: 0; }
        .list-header { padding: 16px 16px 12px; border-bottom: 1px solid #EDEBE6; flex-shrink: 0; }
        .list-header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
        .list-title { font-size: 13px; font-weight: 700; color: #1A1208; }
        .list-count { font-size: 12px; color: '#B4A99A'; }
        .search-wrap { position: relative; }
        .search-ico { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #B4A99A; pointer-events: none; }
        .search-input { width: 100%; padding: 8px 10px 8px 32px; border-radius: 8px; border: 1.5px solid #EDEBE6; font-size: 13px; color: #3D3530; outline: none; background: #FEFCF8; transition: border-color .15s; }
        .search-input:focus { border-color: #B87A14; }
        .list-body { flex: 1; overflow-y: auto; padding: 8px; }

        /* Contract item — matches screenshot exactly */
        .contract-item { display: flex; align-items: center; gap: 12px; padding: 13px 12px; border-radius: 10px; cursor: pointer; transition: background .15s; border: 1.5px solid transparent; margin-bottom: 2px; }
        .contract-item:hover { background: #FEF9F2; }
        .contract-item.selected { background: #FEF3DC; border-color: #F0D9A0; }
        .score-box { width: 42px; height: 42px; border-radius: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0; }
        .score-num { font-size: 17px; font-weight: 700; line-height: 1; }
        .score-denom { font-size: 9px; opacity: 0.7; }
        .contract-meta { flex: 1; min-width: 0; }
        .contract-name { font-size: 13px; font-weight: 600; color: #1A1208; margin-bottom: 3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .contract-detail { font-size: 11px; color: #8A7F72; display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
        .status-pill { font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 20px; white-space: nowrap; }

        /* Workspace */
        .workspace { flex: 1; display: flex; flex-direction: column; overflow: hidden; background: #FEFCF8; }
        .ws-header { padding: 16px 24px; border-bottom: 1px solid #EDEBE6; background: #fff; flex-shrink: 0; display: flex; align-items: flex-start; justify-content: space-between; gap: 12; flex-wrap: wrap; }
        .ws-title { font-family: 'Playfair Display', serif; font-size: 19px; font-weight: 700; color: #1A1208; margin-bottom: 3px; }
        .ws-meta { font-size: 12px; color: #8A7F72; }

        /* Tabs */
        .ws-tabs { display: flex; gap: 0; border-bottom: 1px solid #EDEBE6; background: #fff; flex-shrink: 0; overflow-x: auto; padding: 0 20px; }
        .ws-tab { padding: 11px 14px; border: none; background: transparent; color: #8A7F72; font-size: 13px; font-weight: 500; cursor: pointer; font-family: inherit; border-bottom: 2.5px solid transparent; margin-bottom: -1px; white-space: nowrap; transition: all .15s; }
        .ws-tab:hover { color: #B87A14; }
        .ws-tab.active { color: #B87A14; font-weight: 600; border-bottom-color: #B87A14; }

        .ws-content { flex: 1; overflow-y: auto; padding: 24px; }

        /* Empty / loading states */
        .empty { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 40px; text-align: center; color: #8A7F72; gap: 10; }
        .empty-icon { font-size: 48px; }
        .empty-title { font-size: 16px; font-weight: 700; color: #1A1208; }
        .empty-sub { font-size: 13px; line-height: 1.6; max-width: 260px; }

        @media (max-width: 900px) {
          .sidenav, .list-panel { display: none; }
          .workspace { width: 100%; }
        }
      `}</style>

      <div className="shell">

        {/* ── Top Nav ── */}
        <nav className="topnav">
          <a className="topnav-logo" href="/dashboard">
            <div className="logo-box">F</div>
            <span className="logo-name">FairSign</span>
            <span className="logo-beta">BETA</span>
          </a>
          <div className="nav-sp" />
          <div className="nav-actions">
            <span className="market-badge">{MARKET_FLAGS[sessionMarket] || '🌍'} {sessionMarket}</span>
            <div style={{ position: 'relative' }}>
              <button className="icon-btn" onClick={() => setSettingsOpen(o => !o)}>
                <Ico d={P.settings} size={17} />
              </button>
              {settingsOpen && (
                <SettingsDropdown
                  onClose={() => setSettingsOpen(false)}
                  onNav={k => router.push(`/settings?tab=${k}`)}
                />
              )}
            </div>
            <div className="avatar">{name.charAt(0).toUpperCase()}</div>
          </div>
        </nav>

        <div className="body">

          {/* ── Left sidebar nav ── */}
          <aside className="sidenav">
            <div className="sidenav-label">Menu</div>
            {navItems.map(item => (
              <button key={item.key}
                className={`sidenav-btn ${item.key === 'analyses' ? 'active' : ''}`}
                onClick={() => router.push(item.path)}>
                <Ico d={P[item.key as keyof typeof P] as string | string[]} size={16} />
                {item.label}
              </button>
            ))}
            <div className="sidenav-sp" />
            <button className="logout-btn" onClick={() => signOut({ callbackUrl: '/' })}>
              <Ico d={P.logout} size={16} /> Log out
            </button>
          </aside>

          {/* ── Three panels ── */}
          <div className="panels">

            {/* ── Contract list ── */}
            <div className="list-panel">
              <div className="list-header">
                <div className="list-header-row">
                  <span className="list-title">Past Analyses</span>
                  <span style={{ fontSize: 12, color: '#B4A99A' }}>{history.length} total</span>
                </div>
                <div className="search-wrap">
                  <span className="search-ico"><Ico d={P.search} size={13} /></span>
                  <input
                    className="search-input"
                    placeholder="Search contracts…"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="list-body">
                {loadingHistory ? (
                  <div style={{ padding: '32px 12px', textAlign: 'center', color: '#B4A99A', fontSize: 13 }}>Loading…</div>
                ) : filtered.length === 0 ? (
                  <div style={{ padding: '32px 12px', textAlign: 'center', color: '#B4A99A', fontSize: 13, lineHeight: 1.6 }}>
                    {history.length === 0
                      ? <>No analyses yet.<br /><a href="/dashboard" style={{ color: '#B87A14', textDecoration: 'none', fontWeight: 600 }}>Analyse a contract →</a></>
                      : 'No matches found.'}
                  </div>
                ) : filtered.map(h => {
                  const score   = h.deal_score ?? 0
                  const id      = h.id || h.session_id
                  const fname   = h.filename || 'Contract'
                  const mkt     = h.market || 'Uganda'
                  const label   = h.score_label || ''
                  const date    = h.created_at
                    ? new Date(h.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                    : ''
                  const sc = statusColor(label)
                  return (
                    <div key={id}
                      className={`contract-item ${selectedId === id ? 'selected' : ''}`}
                      onClick={() => loadContract(id, fname, mkt)}>
                      <div className="score-box" style={{ background: scoreBg(score) }}>
                        <span className="score-num" style={{ color: scoreColor(score) }}>{score}</span>
                        <span className="score-denom" style={{ color: scoreColor(score) }}>/10</span>
                      </div>
                      <div className="contract-meta">
                        <div className="contract-name" title={fname}>{fname}</div>
                        <div className="contract-detail">
                          <span>{MARKET_FLAGS[mkt] || ''} {mkt}</span>
                          {label && (
                            <span className="status-pill" style={{ color: sc.color, background: sc.bg }}>
                              {label}
                            </span>
                          )}
                          <span>· {date}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ── Workspace ── */}
            <div className="workspace">
              {!selectedId ? (
                <div className="empty">
                  <div className="empty-icon">📄</div>
                  <div className="empty-title">Select a contract</div>
                  <div className="empty-sub">Choose a contract from the list on the left to open its full analysis workspace.</div>
                  <a href="/dashboard" style={{ marginTop: 8, fontSize: 13, color: '#B87A14', fontWeight: 600, textDecoration: 'none' }}>
                    + Analyse a new contract
                  </a>
                </div>
              ) : loadingAnalysis ? (
                <div className="empty">
                  <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #F0D9A0', borderTopColor: '#B87A14', animation: 'spin 1s linear infinite' }} />
                  <div style={{ fontSize: 14, color: '#8A7F72' }}>Loading analysis…</div>
                  <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                </div>
              ) : !analysis ? (
                <div className="empty">
                  <div className="empty-title">Could not load analysis</div>
                  <div className="empty-sub">The data for this contract may be unavailable.</div>
                </div>
              ) : (
                <>
                  {/* Workspace header */}
                  <div className="ws-header">
                    <div style={{ minWidth: 0 }}>
                      <div className="ws-title" title={currentFilename}>{currentFilename}</div>
                      <div className="ws-meta">
                        {MARKET_FLAGS[currentMarket]} {currentMarket}
                        {' · '}
                        <span style={{ color: scoreColor(analysis.dealScore ?? 0), fontWeight: 600 }}>
                          Score: {analysis.dealScore}/10
                        </span>
                        {analysis.scoreLabel && (
                          <span style={{ ...statusColor(analysis.scoreLabel), fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, marginLeft: 8 }}>
                            {analysis.scoreLabel}
                          </span>
                        )}
                      </div>
                    </div>
                    <button onClick={() => doExport(analysis, currentFilename, currentMarket)} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                      borderRadius: 8, background: '#B87A14', color: '#fff', border: 'none',
                      fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
                    }}>
                      <Download size={13} /> Export PDF
                    </button>
                  </div>

                  {/* Tabs */}
                  <div className="ws-tabs">
                    {TABS.map(t => (
                      <button key={t.id} className={`ws-tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* Tab content */}
                  <div className="ws-content">
                    {activeTab === 'overview'  && <AnalysisResults analysis={analysis} market={currentMarket as Market} />}
                    {activeTab === 'redflags'  && <RedFlagsTab analysis={analysis} market={currentMarket as Market} />}
                    {activeTab === 'language'  && <LanguageTranslator sessionId={selectedId} />}
                    {activeTab === 'simulator' && <NegotiationSimulator sessionId={selectedId} market={currentMarket as Market} analysis={analysis} />}
                    {activeTab === 'chat'      && <ChatInterface sessionId={selectedId} market={currentMarket as Market} personality={personality} analysis={analysis} />}
                    {activeTab === 'share'     && <ShareTabInline analysis={analysis} sessionId={selectedId} market={currentMarket} />}
                    {activeTab === 'export'    && <ExportTab analysis={analysis} filename={currentFilename} market={currentMarket} />}

                    {/* Feedback on all tabs except chat */}
                    {activeTab !== 'chat' && <FeedbackRow sessionId={selectedId} />}
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

export default function AnalysesPage() {
  return <Suspense><AnalysesContent /></Suspense>
}
