'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import axios from 'axios'
import toast from 'react-hot-toast'
import type { Market, Personality, ContractAnalysis } from '@/types'
import AnalysisResults from '@/components/AnalysisResults'
import RedFlagCard from '@/components/RedFlagCard'
import ChatInterface from '@/components/ChatInterface'
import LanguageTranslator from '@/components/LanguageTranslator'
import LabelReputationBoard from '@/components/LabelReputationBoard'
import WhatsAppShare from '@/components/WhatsAppShare'
import NegotiationSimulator from '@/components/NegotiationSimulator'
import MusicPromotionGuide from '@/components/MusicPromotionGuide'
import { Star, Download, Upload } from 'lucide-react'
import {
  ReadinessData,
  LabelScore,
  METRICS,
  getScoreTier,
  formatNumber,
} from '@/lib/dealReadiness'

// ─── Types ────────────────────────────────────────────────────────────────────
type View = 'home' | 'uploading' | 'results'
type Tab = 'overview' | 'redflags' | 'plainenglish' | 'chat' | 'translate' | 'negotiate' | 'labels' | 'whatsapp' | 'promote'
type NavPage = 'dashboard' | 'analyses' | 'promotion' | 'label'
type SettingsKey = 'profile' | 'appearance' | 'notifications' | 'account'

const MARKET_FLAGS: Record<string, string> = {
  Uganda: '🇺🇬', Nigeria: '🇳🇬', Kenya: '🇰🇪', 'South Africa': '🇿🇦',
}

// ─── SVG Icon helper ──────────────────────────────────────────────────────────
const Ico = ({ d, size = 16, stroke = 'currentColor' }: { d: string | string[], size?: number, stroke?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
)

const PATHS = {
  dashboard: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  analyses:  ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6'],
  promotion: ['M22 2L11 13', 'M22 2l-7 20-4-9-9-4 20-7z'],
  label:     ['M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z', 'M7 7h.01'],
  logout:    ['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'M16 17l5-5-5-5', 'M21 12H9'],
  settings:  'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z',
  user:      ['M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'],
  bell:      ['M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9', 'M13.73 21a2 2 0 0 1-3.46 0'],
  globe:     ['M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z', 'M2 12h20', 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'],
  chevron:   'M9 18l6-6-6-6',
  clock:     ['M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z', 'M12 6v6l4 2'],
}

const scoreColor = (s: number) => s >= 7 ? '#15803d' : s >= 5 ? '#B87A14' : '#DC2626'
const scoreBg    = (s: number) => s >= 7 ? '#F0FDF4' : s >= 5 ? '#FEF3DC' : '#FEF2F2'

// ─── Settings Dropdown ────────────────────────────────────────────────────────
function SettingsDropdown({ onClose, onNav }: { onClose: () => void, onNav: (k: SettingsKey) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose() }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [onClose])
  const items: { key: SettingsKey, label: string, icon: string | string[] }[] = [
    { key: 'profile',       label: 'Profile',          icon: PATHS.user },
    { key: 'appearance',    label: 'Appearance',        icon: PATHS.globe },
    { key: 'notifications', label: 'Notifications',     icon: PATHS.bell },
    { key: 'account',       label: 'Account Settings',  icon: PATHS.settings },
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
          color: '#3D3530', fontSize: 14, fontWeight: 500, cursor: 'pointer',
          textAlign: 'left', fontFamily: 'inherit', transition: 'background .15s',
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

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { data: session } = useSession()
  const router = useRouter()

  const [view, setView]             = useState<View>('home')
  const [tab, setTab]               = useState<Tab>('overview')
  const [loadingMsg, setLoadingMsg] = useState('')
  const [analysis, setAnalysis]     = useState<ContractAnalysis | null>(null)
  const [sessionId, setSessionId]   = useState('')
  const [filename, setFilename]     = useState('')
  const [history, setHistory]       = useState<any[]>([])
  const [feedbackRating, setFeedbackRating] = useState(0)
  const [feedbackSent, setFeedbackSent]     = useState(false)
  const [readinessData, setReadinessData]   = useState<ReadinessData | null>(null)
  const [readinessLoaded, setReadinessLoaded] = useState(false)
  const [backendToken, setBackendToken]     = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen]     = useState(false)

  const market = (((session?.user as any)?.market) || 'Uganda') as Market
  const personality: Personality = 'formal'
  const profile = (readinessData as any)?.profile
  const stats   = readinessData?.stats

  useEffect(() => { if (session) { fetchHistory(); fetchReadiness() } }, [session?.user?.email])
  useEffect(() => { if (view === 'home' && session) fetchHistory() }, [view])

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
        const t = res.data.token
        setBackendToken(t)
        return t
      } catch { return null }
    }
    return null
  }

  const fetchHistory = async () => {
    try {
      const token = await getToken()
      if (!token) return
      const { data } = await axios.get('/api/history', { headers: { Authorization: `Bearer ${token}` } })
      setHistory(data)
    } catch { setHistory([]) }
  }

  const fetchReadiness = async () => {
    try {
      const res = await fetch('/api/artist/readiness')
      if (res.ok) setReadinessData(await res.json())
    } catch {} finally { setReadinessLoaded(true) }
  }

  const runAnalysis = useCallback(async (file?: File, text?: string) => {
    setView('uploading')
    const steps = ['Reading your contract...', `Checking ${market} standards...`, 'Detecting red flags...', 'Calculating score...', 'Building summary...']
    let i = 0; setLoadingMsg(steps[0])
    const iv = setInterval(() => { i = (i + 1) % steps.length; setLoadingMsg(steps[i]) }, 2200)
    try {
      const token = await getToken()
      const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}
      let result
      if (file) {
        const form = new FormData(); form.append('file', file); form.append('market', market); form.append('personality', personality)
        const { data } = await axios.post('/api/analyse', form, { headers: { ...authHeaders, 'Content-Type': 'multipart/form-data' } })
        result = data
      } else {
        const form = new FormData(); form.append('text', text!); form.append('market', market); form.append('personality', personality)
        const { data } = await axios.post('/api/analyse-text', form, { headers: authHeaders })
        result = data
      }
      setAnalysis(result.analysis); setSessionId(result.session_id); setFilename(result.filename || 'contract')
      setTab('overview'); setFeedbackRating(0); setFeedbackSent(false)
      fetchHistory()
      router.push(`/analyses?session=${result.session_id}`)
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Analysis failed.')
      setView('home')
    } finally { clearInterval(iv) }
  }, [market, personality])

  const onDrop = useCallback((files: File[]) => { if (files[0]) runAnalysis(files[0]) }, [runAnalysis])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 'text/plain': ['.txt'] },
    maxFiles: 1, disabled: view === 'uploading',
  })

  const handleExport = async () => {
    if (!analysis) return
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const W = 210, margin = 18, maxW = W - margin * 2; let y = 20
      const addText = (text: string, size: number, bold: boolean, color: [number,number,number], indent = 0) => {
        doc.setFontSize(size); doc.setFont('helvetica', bold ? 'bold' : 'normal'); doc.setTextColor(...color)
        const lines = doc.splitTextToSize(text, maxW - indent)
        lines.forEach((line: string) => { if (y > 270) { doc.addPage(); y = 20 } doc.text(line, margin + indent, y); y += size * 0.45 }); y += 2
      }
      doc.setFillColor(184, 122, 20); doc.rect(0, 0, W, 28, 'F')
      doc.setFontSize(18); doc.setFont('helvetica','bold'); doc.setTextColor(254,252,248); doc.text('FairSign', margin, 17)
      doc.setFontSize(9); doc.setFont('helvetica','normal'); doc.setTextColor(122,79,10); doc.text('MUSIC CONTRACT ANALYSIS', margin+36, 17)
      doc.setTextColor(180,175,165); doc.text(`${new Date().toLocaleDateString()}  ·  ${market}`, W-margin, 17, { align:'right' })
      y = 38; addText('Summary', 12, true, [26,18,8]); addText(analysis.summary, 10, false, [50,50,50])
      doc.save(`fairsign-analysis-${filename.replace(/\.[^/.]+$/,'')}.pdf`); toast.success('PDF exported!')
    } catch (err) { console.error(err); toast.error('Export failed.') }
  }

  const handleFeedback = async (rating: number) => {
    setFeedbackRating(rating)
    try {
      const form = new FormData(); form.append('session_id', sessionId); form.append('rating', String(rating))
      await axios.post('/api/feedback', form); setFeedbackSent(true); toast.success('Thanks for your feedback!')
    } catch { toast.error('Could not send feedback.') }
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: 'overview',     label: 'Overview' },
    { id: 'redflags',     label: `Red Flags (${analysis?.redFlags?.length || 0})` },
    { id: 'plainenglish', label: 'Plain English' },
    { id: 'chat',         label: 'Ask FairSign' },
    { id: 'translate',    label: '🌍 Translate' },
    { id: 'negotiate',    label: '🥊 Simulate' },
    { id: 'labels',       label: '🔴 Labels' },
    { id: 'whatsapp',     label: '📱 Share' },
    { id: 'promote',      label: '📢 Promote' },
  ]

  const navItems: { key: NavPage, label: string, path: string }[] = [
    { key: 'dashboard', label: 'Dashboard', path: '/dashboard' },
    { key: 'analyses',  label: 'Analyses',  path: '/analyses'  },
    { key: 'promotion', label: 'Promotion', path: '/promotion' },
    { key: 'label',     label: 'Label Match',path: '/onboarding'},
  ]

  return (
    <>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; background: #FEFCF8; font-family: 'Inter', sans-serif; color: #3D3530; }
        button, input { font-family: inherit; }

        .app { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }

        /* ── Top Nav ── */
        .topnav {
          height: 56px; background: #fff; border-bottom: 1px solid #EDEBE6;
          display: flex; align-items: center; padding: 0 20px 0 0; flex-shrink: 0; z-index: 100; position: relative;
        }
        .topnav-logo {
          width: 220px; display: flex; align-items: center; gap: 10px;
          padding: 0 20px; flex-shrink: 0; text-decoration: none;
        }
        .logo-box {
          width: 30px; height: 30px; background: #B87A14; border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Playfair Display', serif; font-weight: 700; font-size: 15px; color: #fff;
        }
        .logo-name { font-weight: 700; font-size: 16px; color: #1A1208; letter-spacing: -0.02em; }
        .logo-beta { font-size: 9px; font-weight: 700; padding: 2px 7px; background: #FEF3DC; color: #7A4F0A; border-radius: 99px; border: 1px solid #F0D9A0; }
        .topnav-spacer { flex: 1; }
        .topnav-actions { display: flex; align-items: center; gap: 8px; position: relative; }
        .market-badge { background: #FEF3DC; border: 1px solid #F0D9A0; border-radius: 20px; padding: 4px 12px; font-size: 12px; font-weight: 600; color: #7A4F0A; }
        .icon-btn {
          width: 36px; height: 36px; border-radius: 9px; border: 1px solid #EDEBE6;
          background: #fff; display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #8A7F72; transition: all .15s;
        }
        .icon-btn:hover { background: #FEF3DC; color: #B87A14; border-color: #F0D9A0; }
        .avatar {
          width: 32px; height: 32px; border-radius: 50%; background: #B87A14;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700; color: #fff; cursor: default; flex-shrink: 0;
        }

        /* ── Body ── */
        .body { flex: 1; display: flex; overflow: hidden; }

        /* ── Sidebar ── */
        .sidebar {
          width: 220px; background: #fff; border-right: 1px solid #EDEBE6;
          display: flex; flex-direction: column; flex-shrink: 0; padding: 16px 10px;
        }
        .sidebar-label { font-size: 10px; font-weight: 600; color: #B4A99A; letter-spacing: .1em; text-transform: uppercase; padding: 0 10px; margin: 16px 0 6px; }
        .sidenav-btn {
          display: flex; align-items: center; gap: 10px; width: 100%;
          padding: 10px 12px; border-radius: 10px; border: none; background: transparent;
          color: #8A7F72; font-size: 13.5px; font-weight: 500; cursor: pointer;
          text-align: left; transition: all .15s; margin-bottom: 2px;
        }
        .sidenav-btn:hover { background: #FEF3DC; color: #B87A14; }
        .sidenav-btn.active { background: #FEF3DC; color: #B87A14; font-weight: 600; }
        .sidebar-spacer { flex: 1; }
        .logout-btn {
          display: flex; align-items: center; gap: 10px; width: 100%;
          padding: 10px 12px; border-radius: 10px; border: none; background: transparent;
          color: #B4A99A; font-size: 13.5px; font-weight: 500; cursor: pointer; text-align: left; transition: all .15s;
        }
        .logout-btn:hover { background: #FFF0F0; color: #C0392B; }

        /* ── Main scroll area ── */
        .main { flex: 1; overflow-y: auto; background: #FEFCF8; padding: 28px 32px; }

        /* ── Stat cards ── */
        .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-bottom: 24px; }
        .stat-card {
          background: #fff; border: 1px solid #EDEBE6; border-radius: 14px;
          padding: 20px 22px; box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .stat-label { font-size: 12px; font-weight: 500; color: #8A7F72; margin-bottom: 10px; }
        .stat-value { font-family: 'Playfair Display', serif; font-size: 30px; font-weight: 700; color: #B87A14; line-height: 1; }
        .stat-sub { font-size: 11px; color: #B4A99A; margin-top: 4px; }
        .stat-icon { float: right; width: 34px; height: 34px; background: #FEF3DC; border-radius: 9px; display: flex; align-items: center; justify-content: center; color: #B87A14; }

        /* ── Upload card ── */
        .card { background: #fff; border: 1px solid #EDEBE6; border-radius: 16px; padding: 26px 28px; box-shadow: 0 1px 4px rgba(0,0,0,0.04); margin-bottom: 20px; }
        .card-title { font-size: 15px; font-weight: 700; color: #1A1208; margin-bottom: 4px; }
        .card-sub-text { font-size: 13px; color: #8A7F72; margin-bottom: 18px; }

        .dropzone {
          border: 2px dashed #E8E0D4; border-radius: 12px; padding: 36px 20px;
          text-align: center; cursor: pointer; transition: all .2s; background: #FEFCF8;
          display: flex; flex-direction: column; align-items: center; gap: 8px;
        }
        .dropzone:hover, .dropzone.active { border-color: #B87A14; background: #FEF3DC; }
        .dz-main { font-size: 14px; font-weight: 600; color: #3D3530; }
        .dz-sub { font-size: 12px; color: #B4A99A; }

        /* ── Results header ── */
        .results-header {
          background: #fff; border: 1px solid #EDEBE6; border-radius: 14px;
          padding: 16px 20px; margin-bottom: 14px; display: flex; align-items: center;
          justify-content: space-between; flex-wrap: wrap; gap: 10;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .results-tabs {
          background: #fff; border: 1px solid #EDEBE6; border-radius: 12px 12px 0 0;
          display: flex; overflow-x: auto; border-bottom: none;
        }
        .tab-btn {
          padding: 12px 15px; font-size: 13px; white-space: nowrap; cursor: pointer;
          background: transparent; border: none; border-bottom: 2.5px solid transparent;
          color: #8A7F72; font-weight: 500; font-family: inherit; transition: all .15s;
        }
        .tab-btn:hover { color: #B87A14; }
        .tab-btn.active { color: #B87A14; font-weight: 600; border-bottom-color: #B87A14; }
        .tab-content {
          background: #fff; border: 1px solid #EDEBE6; border-radius: 0 0 14px 14px;
          padding: 24px 22px; min-height: 300px;
        }

        /* ── Uploading state ── */
        .uploading-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 18px; }
        .spinner { width: 48px; height: 48px; border-radius: 50%; border: 3px solid #F0D9A0; border-top-color: #B87A14; animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg) } }

        /* ── Numbers strip ── */
        .numbers-strip { background: #FEF3DC; border: 1px solid #F0D9A0; border-radius: 12px; padding: 14px 18px; margin-bottom: 20px; display: flex; flex-wrap: wrap; gap: 20px; }

        @media (max-width: 768px) {
          .sidebar { display: none; }
          .main { padding: 18px 14px; }
          .topnav-logo { width: auto; padding: 0 14px; }
        }
      `}</style>

      <div className="app">

        {/* ── Top Nav ── */}
        <nav className="topnav">
          <a className="topnav-logo" href="/dashboard">
            <div className="logo-box">F</div>
            <span className="logo-name">FairSign</span>
            <span className="logo-beta">BETA</span>
          </a>
          <div className="topnav-spacer" />
          <div className="topnav-actions">
            <span className="market-badge">{MARKET_FLAGS[market] || '🌍'} {market}</span>
            {view === 'results' && (
              <button className="icon-btn" onClick={() => setView('home')} title="New analysis" style={{ width: 'auto', padding: '0 12px', fontSize: 13, fontWeight: 600, gap: 6, display: 'flex' }}>
                <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> New Analysis
              </button>
            )}
            <div style={{ position: 'relative' }}>
              <button className="icon-btn" onClick={() => setSettingsOpen(o => !o)} title="Settings">
                <Ico d={PATHS.settings} size={17} />
              </button>
              {settingsOpen && (
                <SettingsDropdown
                  onClose={() => setSettingsOpen(false)}
                  onNav={k => router.push(`/settings?tab=${k}`)}
                />
              )}
            </div>
            <div className="avatar" title={profile?.stageName || session?.user?.name || ''}>
              {(profile?.stageName || session?.user?.name || '?').charAt(0).toUpperCase()}
            </div>
          </div>
        </nav>

        {/* ── App body ── */}
        <div className="body">

          {/* ── Sidebar ── */}
          <aside className="sidebar">
            <div className="sidebar-label">Menu</div>
            {navItems.map(item => (
              <button key={item.key} className={`sidenav-btn ${item.key === 'dashboard' ? 'active' : ''}`}
                onClick={() => {
                  if (item.key === 'dashboard') setView('home')
                  else router.push(item.path)
                }}>
                <Ico d={PATHS[item.key] as string | string[]} size={16} />
                {item.label}
              </button>
            ))}
            <div className="sidebar-spacer" />
            <button className="logout-btn" onClick={() => signOut({ callbackUrl: '/' })}>
              <Ico d={PATHS.logout} size={16} /> Log out
            </button>
          </aside>

          {/* ── Main ── */}
          <main className="main">

            {/* ─── HOME ─── */}
            {view === 'home' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

                {/* Welcome */}
                <div style={{ marginBottom: 24 }}>
                  <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: '#1A1208' }}>
                    Welcome back, {profile?.stageName || session?.user?.name?.split(' ')[0]}
                  </h1>
                  <p style={{ fontSize: 14, color: '#8A7F72', marginTop: 4 }}>
                    {profile?.genre && <>{profile.genre} · </>}
                    {profile?.audiomackHandle && <>@{profile.audiomackHandle} on Audiomack · </>}
                    {session?.user?.email}
                    {profile && (
                      <a href="/onboarding" style={{ color: '#B87A14', textDecoration: 'none', marginLeft: 8, fontSize: 12 }}>Edit stats</a>
                    )}
                  </p>
                </div>

                {/* Stats */}
                <div className="stats-row">
                  {[
                    { label: 'Contracts Analysed', value: history.length, sub: 'All time', icon: ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6', 'M16 13H8', 'M12 17H8'] },
                    { label: 'Average Deal Score', value: history.length ? (history.reduce((s, h) => s + (h.deal_score || 0), 0) / history.length).toFixed(1) + '/10' : '—', sub: 'All analyses', icon: ['M18 20V10', 'M12 20V4', 'M6 20v-6'] },
                    { label: 'High Risk Deals', value: history.filter(h => h.deal_score < 4).length, sub: 'Score below 4/10', icon: ['M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z', 'M12 9v4', 'M12 17h.01'] },
                    ...(readinessData?.overallScore != null ? [{ label: 'Deal Readiness', value: `${readinessData.overallScore}/100`, sub: 'Career score', icon: ['M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z', 'M12 6v6l4 2'] }] : []),
                  ].map(s => (
                    <div key={s.label} className="stat-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="stat-label">{s.label}</span>
                        <span className="stat-icon"><Ico d={s.icon} size={16} /></span>
                      </div>
                      <div className="stat-value">{s.value}</div>
                      <div className="stat-sub">{s.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Your numbers strip (only when stats exist) */}
                {stats && (
                  <div className="numbers-strip">
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#7A4F0A', letterSpacing: '0.1em', textTransform: 'uppercase', alignSelf: 'center' }}>Your numbers</span>
                    {[
                      { label: 'Audiomack', value: formatNumber(stats.audiomack), sub: 'streams/mo' },
                      { label: 'Spotify',   value: formatNumber(stats.spotify),   sub: 'listeners/mo' },
                      { label: 'YouTube',   value: formatNumber(stats.youtube),   sub: 'views/mo' },
                      { label: 'Instagram', value: formatNumber(stats.instagram), sub: 'followers' },
                      { label: 'TikTok',    value: formatNumber(stats.tiktok),    sub: 'followers' },
                      { label: 'Releases',  value: stats.releases,                sub: 'originals' },
                    ].map(m => (
                      <div key={m.label}>
                        <div style={{ fontSize: 17, fontWeight: 700, color: '#1A1208', lineHeight: 1 }}>{m.value}</div>
                        <div style={{ fontSize: 11, color: '#7A4F0A', marginTop: 2 }}>{m.label} <span style={{ opacity: 0.6 }}>{m.sub}</span></div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload */}
                <div className="card">
                  <div className="card-title">Analyse a Contract</div>
                  <div className="card-sub-text">Upload a PDF, DOCX, or TXT. FairSign will detect red flags, calculate a deal score, and give you negotiation tips.</div>
                  <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
                    <input {...getInputProps()} />
                    <Upload size={28} color="#B87A14" />
                    <div className="dz-main">{isDragActive ? 'Drop it here' : 'Drag & drop your contract'}</div>
                    <div className="dz-sub">PDF, DOCX, or TXT · Click to browse</div>
                  </div>
                </div>

              </div>
            )}

            {/* ─── UPLOADING ─── */}
            {view === 'uploading' && (
              <div className="uploading-wrap">
                <div className="spinner" />
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#1A1208' }}>Analysing your contract</h2>
                <p style={{ fontSize: 14, color: '#8A7F72' }}>{loadingMsg}</p>
              </div>
            )}

            {/* ─── RESULTS ─── */}
            {view === 'results' && analysis && (
              <div>
                <div className="results-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <span style={{ fontSize: 13, color: '#8A7F72', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>{filename}</span>
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#FEF3DC', color: '#7A4F0A', fontWeight: 600 }}>{MARKET_FLAGS[market]} {market}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: scoreColor(analysis.dealScore), lineHeight: 1, fontFamily: "'Playfair Display', serif" }}>
                        {analysis.dealScore}<span style={{ fontSize: 12, fontWeight: 400, color: '#B4A99A' }}>/10</span>
                      </div>
                      <div style={{ fontSize: 11, color: '#8A7F72' }}>{analysis.scoreLabel}</div>
                    </div>
                    <button onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: 'none', background: '#B87A14', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                      <Download size={13} /> Export PDF
                    </button>
                  </div>
                </div>

                <div className="results-tabs">
                  {TABS.map(t => (
                    <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="tab-content">
                  {tab === 'overview'     && <AnalysisResults analysis={analysis} market={market} />}
                  {tab === 'redflags'     && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <p style={{ fontSize: 13, color: '#8A7F72', marginBottom: 4 }}>
                        {analysis.redFlags?.length === 0 ? '✅ No significant red flags found.' : `${analysis.redFlags.length} clause${analysis.redFlags.length !== 1 ? 's' : ''} need your attention.`}
                      </p>
                      {[...(analysis.redFlags || [])].sort((a, b) => ({high:0,medium:1,low:2}[a.severity] - {high:0,medium:1,low:2}[b.severity])).map((flag, i) => <RedFlagCard key={i} flag={flag} market={market} />)}
                    </div>
                  )}
                  {tab === 'plainenglish' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {(analysis.plainEnglish || []).map((s, i) => (
                        <div key={i} style={{ borderRadius: 10, padding: 16, border: '1px solid #EDEBE6' }}>
                          <h4 style={{ fontSize: 15, fontWeight: 600, color: '#1A1208', marginBottom: 8 }}>{s.section}</h4>
                          <p style={{ fontSize: 13, color: '#3D3530', lineHeight: 1.7, marginBottom: 10 }}>{s.simplified}</p>
                          <div style={{ background: '#FEF3DC', border: '1px solid #F0D9A0', borderRadius: 8, padding: '10px 12px', display: 'flex', gap: 8 }}>
                            <span style={{ fontSize: 14 }}>💡</span>
                            <p style={{ fontSize: 12, color: '#7A4F0A', lineHeight: 1.6, margin: 0 }}>{s.tip}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {tab === 'chat'      && <ChatInterface sessionId={sessionId} market={market} personality={personality} analysis={analysis} />}
                  {tab === 'translate' && <LanguageTranslator sessionId={sessionId} />}
                  {tab === 'labels'    && <LabelReputationBoard />}
                  {tab === 'whatsapp'  && <WhatsAppShare sessionId={sessionId} market={market} />}
                  {tab === 'negotiate' && <NegotiationSimulator sessionId={sessionId} market={market} analysis={analysis} />}
                  {tab === 'promote'   && <MusicPromotionGuide market={market} />}

                  {tab !== 'chat' && (
                    <div style={{ marginTop: 24, padding: 16, borderRadius: 10, border: '1px solid #EDEBE6', textAlign: 'center', background: '#FEFCF8' }}>
                      {feedbackSent ? (
                        <p style={{ fontSize: 13, color: '#8A7F72' }}>✅ Thanks for your feedback!</p>
                      ) : (
                        <>
                          <p style={{ fontSize: 13, color: '#8A7F72', marginBottom: 10 }}>Was this analysis helpful?</p>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                            {[1,2,3,4,5].map(n => (
                              <button key={n} onClick={() => handleFeedback(n)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                                <Star size={20} fill={feedbackRating >= n ? '#B87A14' : 'none'} color={feedbackRating >= n ? '#B87A14' : '#EDEBE6'} />
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </>
  )
}