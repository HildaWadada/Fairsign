'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { SessionData } from '@/types'
import DealScoreCard from '@/components/DealScoreCard'
import RedFlagCard from '@/components/RedFlagCard'
import AnalysisResults from '@/components/AnalysisResults'
import ChatInterface from '@/components/ChatInterface'
import LanguageTranslator from '@/components/LanguageTranslator'
import LabelReputationBoard from '@/components/LabelReputationBoard'
import WhatsAppShare from '@/components/WhatsAppShare'
import NegotiationSimulator from '@/components/NegotiationSimulator'
import { submitFeedback } from '@/lib/api'
import { Download, Plus, Star } from 'lucide-react'

type Tab = 'overview' | 'redflags' | 'plainenglish' | 'chat' | 'translate' | 'labels' | 'whatsapp' | 'negotiate'

export default function ResultsPage() {
  const router = useRouter()
  const [session, setSession] = useState<SessionData | null>(null)
  const [tab, setTab] = useState<Tab>('overview')
  const [feedbackRating, setFeedbackRating] = useState(0)
  const [feedbackSent, setFeedbackSent] = useState(false)

  useEffect(() => {
    const raw = sessionStorage.getItem('fairsign_session')
    if (!raw) { router.push('/'); return }
    try { setSession(JSON.parse(raw)) }
    catch { router.push('/') }
  }, [router])

  if (!session) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--forest)' }}>
      <div className="w-10 h-10 rounded-full border-2 border-t-gold animate-spin" style={{ borderTopColor: 'var(--gold)', borderColor: 'rgba(201,146,42,.2)' }} />
    </div>
  )

  const { analysis, sessionId, filename, market, personality } = session

  const handleExport = () => {
    const lines = [
      'FAIRSIGN CONTRACT ANALYSIS',
      `Date: ${new Date().toLocaleDateString()}  |  File: ${filename}  |  Market: ${market}`,
      '',
      `DEAL SCORE: ${analysis.dealScore}/10 — ${analysis.scoreLabel}`,
      analysis.scoreReason, '',
      'SUMMARY', analysis.summary, '',
      'OVERALL ADVICE', analysis.overallAdvice, '',
      'MARKET CONTEXT', analysis.marketContext, '',
      'POSITIVES',
      ...(analysis.positives || []).map(p => `✓ ${p}`), '',
      'KEY TERMS',
      ...(analysis.keyTerms || []).map(t => `• ${t.term}: ${t.contractSays}  |  Benchmark: ${t.benchmark}  |  ${t.status.toUpperCase()}`),
      '', 'RED FLAGS',
      ...(analysis.redFlags || []).flatMap(f => [
        `[${f.severity.toUpperCase()}] ${f.clause}`,
        f.explanation,
        `${market} Context: ${f.africanContext}`,
        `Negotiate for: ${f.suggestion}`,
        f.templateLanguage ? `Suggested language: ${f.templateLanguage}` : '',
        ''
      ]),
      'PLAIN ENGLISH',
      ...(analysis.plainEnglish || []).flatMap(s => [`— ${s.section}`, s.simplified, `Tip: ${s.tip}`, '']),
      '',
      '⚠️  This analysis is for educational purposes only.',
      'Consult a qualified music attorney before signing any contract.',
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `fairsign-analysis-${filename.replace(/\.[^/.]+$/, '')}.txt`
    a.click()
    toast.success('Summary exported!')
  }

  const handleFeedback = async (rating: number) => {
    setFeedbackRating(rating)
    try {
      await submitFeedback(sessionId, rating)
      setFeedbackSent(true)
      toast.success('Thanks for your feedback!')
    } catch {
      toast.error('Could not send feedback.')
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'redflags', label: `Red Flags (${analysis.redFlags?.length || 0})` },
    { id: 'plainenglish', label: 'Plain English' },
    { id: 'chat', label: 'Ask FairSign' },
    { id: 'translate', label: '🌍 Translate' },
    { id: 'negotiate', label: '🥊 Simulate' },
    { id: 'labels', label: '🔴 Labels' },
    { id: 'whatsapp', label: '📱 Share' },
  ]

  const scoreColor = analysis.dealScore >= 7 ? '#16a34a' : analysis.dealScore >= 5 ? '#d97706' : '#dc2626'

  return (
    <div className="min-h-screen" style={{ background: 'var(--cream)' }}>
      {/* Header */}
      <div style={{ background: 'var(--forest)' }} className="px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-serif text-xl shrink-0" style={{ color: '#f9f5ec' }}>FairSign</span>
          <span className="text-xs truncate max-w-[160px]" style={{ color: 'rgba(249,245,236,.35)' }}>{filename}</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full shrink-0" style={{ background: 'rgba(255,255,255,.08)', color: 'rgba(249,245,236,.5)' }}>{market}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="font-bold text-xl leading-none" style={{ color: scoreColor }}>
              {analysis.dealScore}<span className="text-sm font-normal">/10</span>
            </div>
            <div className="text-xs" style={{ color: 'rgba(249,245,236,.4)' }}>{analysis.scoreLabel}</div>
          </div>
          <button onClick={handleExport} className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg" style={{ background: 'var(--gold)', color: '#fff' }}>
            <Download size={14} /> Export
          </button>
          <button onClick={() => router.push('/')} className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,.08)', color: 'rgba(249,245,236,.65)' }}>
            <Plus size={14} /> New
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: '#061710', borderBottom: '1px solid rgba(255,255,255,.08)' }} className="flex overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="px-5 py-3.5 text-sm whitespace-nowrap transition-all"
            style={{
              borderBottom: `2px solid ${tab === t.id ? 'var(--gold)' : 'transparent'}`,
              color: tab === t.id ? 'var(--gold)' : 'rgba(249,245,236,.45)',
              fontWeight: tab === t.id ? 600 : 400,
              background: 'transparent',
              border: 'none',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="max-w-3xl mx-auto px-5 py-7 animate-fade-up">

        {tab === 'overview' && <AnalysisResults analysis={analysis} market={market} />}

        {tab === 'redflags' && (
          <div>
            <p className="text-sm mb-5" style={{ color: '#6b6b6b' }}>
              {analysis.redFlags?.length === 0
                ? '✅ No significant red flags found in this contract.'
                : `Found ${analysis.redFlags.length} clause${analysis.redFlags.length !== 1 ? 's' : ''} that need your attention — sorted by severity.`}
            </p>
            <div className="flex flex-col gap-4">
              {[...( analysis.redFlags || [])]
                .sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.severity] - { high: 0, medium: 1, low: 2 }[b.severity]))
                .map((flag, i) => <RedFlagCard key={i} flag={flag} market={market} />)
              }
            </div>
          </div>
        )}

        {tab === 'plainenglish' && (
          <div>
            <p className="text-sm mb-5" style={{ color: '#6b6b6b' }}>Every section of your contract, explained simply — no legal jargon.</p>
            <div className="flex flex-col gap-4">
              {(analysis.plainEnglish || []).map((s, i) => (
                <div key={i} className="rounded-xl p-5" style={{ background: '#fff', border: '1px solid var(--cream-dark)' }}>
                  <h4 className="font-serif text-lg mb-3" style={{ color: 'var(--forest)', fontWeight: 400 }}>{s.section}</h4>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: '#333' }}>{s.simplified}</p>
                  <div className="flex gap-2.5 rounded-lg p-3" style={{ background: '#fef9f0', border: '1px solid #fde68a' }}>
                    <span className="text-sm shrink-0">💡</span>
                    <p className="text-xs leading-relaxed" style={{ color: '#92400e' }}>{s.tip}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'chat' && (
          <ChatInterface
            sessionId={sessionId}
            market={market}
            personality={personality}
            analysis={analysis}
          />
        )}

        {tab === 'translate' && <LanguageTranslator sessionId={sessionId} />}

        {tab === 'labels' && <LabelReputationBoard />}

        {tab === 'whatsapp' && <WhatsAppShare sessionId={sessionId} market={market} />}

        {tab === 'negotiate' && (
          <NegotiationSimulator sessionId={sessionId} market={market} analysis={analysis} />
        )}

        {/* Feedback */}
        {tab !== 'chat' && (
          <div className="mt-10 rounded-xl p-5 text-center" style={{ background: '#fff', border: '1px solid var(--cream-dark)' }}>
            {feedbackSent ? (
              <p className="text-sm" style={{ color: '#6b6b6b' }}>✅ Thanks for your feedback — it helps us improve FairSign.</p>
            ) : (
              <>
                <p className="text-sm mb-3" style={{ color: '#6b6b6b' }}>Was this analysis helpful?</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => handleFeedback(n)} className="transition-all hover:scale-110">
                      <Star
                        size={22}
                        fill={feedbackRating >= n ? 'var(--gold)' : 'none'}
                        color={feedbackRating >= n ? 'var(--gold)' : '#ccc'}
                      />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
