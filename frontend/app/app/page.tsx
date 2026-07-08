'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { analyseContract, analyseText } from '@/lib/api'
import type { Market, Personality } from '@/types'

const MARKETS: Market[] = ['Uganda', 'Nigeria', 'Kenya', 'South Africa']
const PERSONALITIES: { value: Personality; label: string }[] = [
  { value: 'friendly', label: 'Friendly' },
  { value: 'formal', label: 'Formal' },
  { value: 'concise', label: 'Concise' },
]

const SAMPLE = `RECORDING AGREEMENT
Between SoundWave Records Ltd ("Label") and the undersigned Artist.

1. TERM: Initial term of one (1) year, with Label holding four (4) options to extend at Label's sole discretion.
2. ROYALTIES: Artist shall receive 12% of suggested retail list price. No royalties payable until recoupment. Digital royalties at 75% of applicable rate.
3. ADVANCES: Non-returnable recoupable advance of $5,000 USD. All recording costs, video costs, and promotional expenses charged against Artist's royalty account.
4. OWNERSHIP: All master recordings shall be the sole property of Label in perpetuity throughout the universe.
5. 360 DEAL: Artist grants Label 25% of gross income from all entertainment activities including touring, merchandise, and endorsements.
6. CREATIVE CONTROL: Label has final approval over song selection, producers, artwork, and release timing.
7. TERRITORY: Entire world in perpetuity.
8. ACCOUNTING: Statements within 90 days after June 30 and December 31. Audit at Artist expense, once per year.
9. GOVERNING LAW: Laws of the State of California, USA.`

export default function AppPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const userMarket = ((session?.user as any)?.market || 'Uganda') as Market

  const [market, setMarket] = useState<Market>(userMarket)
  const [personality, setPersonality] = useState<Personality>('friendly')
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')

  const runAnalysis = useCallback(async (file?: File, text?: string) => {
    setLoading(true)
    const steps = ['Reading your contract...', `Checking ${market} market standards...`, 'Detecting red flags...', 'Calculating deal score...', 'Building your summary...']
    let i = 0
    setLoadingMsg(steps[0])
    const iv = setInterval(() => { i = (i + 1) % steps.length; setLoadingMsg(steps[i]) }, 2200)
    try {
      const result = file
        ? await analyseContract(file, market, personality)
        : await analyseText(text!, market, personality)

      sessionStorage.setItem('fairsign_session', JSON.stringify({
        sessionId: result.session_id,
        filename: result.filename || 'contract',
        market: result.market,
        analysis: result.analysis,
        personality,
      }))
      router.push('/app/results')
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Analysis failed. Check your API key.')
    } finally {
      clearInterval(iv)
      setLoading(false)
    }
  }, [market, personality, router])

  const onDrop = useCallback((files: File[]) => {
    if (files[0]) runAnalysis(files[0])
  }, [runAnalysis])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    disabled: loading,
  })

  return (
    <div style={{ minHeight: '100vh', background: '#0a2316', fontFamily: 'sans-serif' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: '#f9f5ec' }}>FairSign</span>
          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#c9922a', color: '#fff' }}>BETA</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {session && (
            <button onClick={() => router.push('/dashboard')} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,.15)', background: 'transparent', color: 'rgba(249,245,236,.6)', fontSize: 13, cursor: 'pointer' }}>
              Dashboard
            </button>
          )}
        </div>
      </nav>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '60px 24px 24px', textAlign: 'center' }}>
        {session && (
          <p style={{ fontSize: 13, color: 'rgba(249,245,236,.4)', marginBottom: 10 }}>
            Welcome back, {session.user?.name?.split(' ')[0]} 👋
          </p>
        )}
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#c9922a', marginBottom: 14 }}>Music Contract Analyst</p>
        <h1 style={{ fontSize: 'clamp(36px,6vw,60px)', fontWeight: 700, color: '#f9f5ec', lineHeight: 1.1, marginBottom: 14 }}>
          Understand your deal.<br />
          <span style={{ color: '#c9922a' }}>Protect your career.</span>
        </h1>
        <p style={{ fontSize: 16, color: 'rgba(249,245,236,.6)', maxWidth: 460, margin: '0 auto', lineHeight: 1.7 }}>
          Upload your record deal or licensing contract. FairSign breaks it down in plain language.
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: '20px 24px 8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: 'rgba(249,245,236,.4)' }}>Market:</span>
        {MARKETS.map(m => (
          <button key={m} onClick={() => setMarket(m)} style={{ padding: '7px 16px', borderRadius: 100, fontSize: 13, cursor: 'pointer', border: `1px solid ${market === m ? '#c9922a' : 'rgba(255,255,255,.2)'}`, background: market === m ? 'rgba(201,146,42,.15)' : 'transparent', color: market === m ? '#c9922a' : 'rgba(249,245,236,.6)', fontWeight: market === m ? 600 : 400 }}>
            {m}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: '8px 24px 20px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: 'rgba(249,245,236,.4)' }}>Tone:</span>
        {PERSONALITIES.map(p => (
          <button key={p.value} onClick={() => setPersonality(p.value)} style={{ padding: '6px 14px', borderRadius: 100, fontSize: 13, cursor: 'pointer', border: `1px solid ${personality === p.value ? 'rgba(249,245,236,.5)' : 'rgba(255,255,255,.12)'}`, background: personality === p.value ? 'rgba(255,255,255,.08)' : 'transparent', color: personality === p.value ? '#f9f5ec' : 'rgba(249,245,236,.4)' }}>
            {p.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 500, margin: '0 auto', padding: '0 24px 24px' }}>
        {loading ? (
          <div style={{ border: '1px solid rgba(255,255,255,.1)', borderRadius: 16, padding: '48px 32px', textAlign: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', margin: '0 auto 16px', border: '3px solid rgba(201,146,42,.2)', borderTopColor: '#c9922a', animation: 'spin 1s linear infinite' }} />
            <p style={{ fontWeight: 600, color: '#f9f5ec', marginBottom: 6 }}>Analysing your contract</p>
            <p style={{ fontSize: 14, color: 'rgba(249,245,236,.45)' }}>{loadingMsg}</p>
          </div>
        ) : (
          <div {...getRootProps()} style={{ border: `2px dashed ${isDragActive ? '#c9922a' : 'rgba(255,255,255,.2)'}`, borderRadius: 16, padding: '48px 32px', textAlign: 'center', cursor: 'pointer', background: isDragActive ? 'rgba(201,146,42,.07)' : 'transparent', transition: 'all .2s' }}>
            <input {...getInputProps()} />
            <div style={{ fontSize: 36, marginBottom: 12 }}>📄</div>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#f9f5ec', marginBottom: 6 }}>{isDragActive ? 'Drop it here' : 'Drop your contract here'}</p>
            <p style={{ fontSize: 13, color: 'rgba(249,245,236,.4)' }}>PDF, DOCX, or TXT · Click to browse</p>
          </div>
        )}

        {!loading && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <p style={{ fontSize: 12, color: 'rgba(249,245,236,.2)', marginBottom: 12 }}>— or —</p>
            <button onClick={() => runAnalysis(undefined, SAMPLE)} style={{ fontSize: 13, fontWeight: 500, padding: '10px 24px', borderRadius: 100, border: '1px solid rgba(201,146,42,.4)', color: '#c9922a', background: 'transparent', cursor: 'pointer' }}>
              Try a sample contract →
            </button>
          </div>
        )}
      </div>

      <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(249,245,236,.2)', paddingBottom: 28 }}>
        For educational purposes only. Always consult a qualified music attorney before signing.
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
