'use client'

import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { ContractAnalysis, Market } from '@/types'
import { Swords, Lightbulb, Star } from 'lucide-react'

interface Props {
  sessionId: string
  market: Market
  analysis: ContractAnalysis
}

const CLAUSES = [
  { id: 'royalties', label: 'Royalty Rate', emoji: '💰' },
  { id: 'masters', label: 'Master Ownership', emoji: '🎵' },
  { id: '360_deal', label: '360 Deal', emoji: '🔄' },
  { id: 'term', label: 'Contract Term', emoji: '📅' },
  { id: 'creative_control', label: 'Creative Control', emoji: '🎨' },
  { id: 'recoupment', label: 'Recoupment', emoji: '💳' },
]

type MsgType = 'label' | 'artist' | 'coach'

interface SimMessage {
  type: MsgType
  content: string
  score?: { score: number; feedback: string }
}

function CoachTip({ content }: { content: string }) {
  const [open, setOpen] = useState(true)
  return (
    <div
      className="rounded-xl overflow-hidden mx-auto"
      style={{ maxWidth: '88%', border: '1px solid #fde68a' }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left"
        style={{ background: '#fef9f0' }}
      >
        <Lightbulb size={13} color="#d97706" />
        <span className="text-xs font-semibold" style={{ color: '#92400e', flex: 1 }}>
          FairSign Coach
        </span>
        <span className="text-xs" style={{ color: '#bbb' }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-3 py-2.5" style={{ background: '#fffbeb' }}>
          <p className="text-xs leading-relaxed whitespace-pre-line" style={{ color: '#78350f' }}>
            {content}
          </p>
        </div>
      )}
    </div>
  )
}

export default function NegotiationSimulator({ sessionId, market, analysis }: Props) {
  const [started, setStarted] = useState(false)
  const [focusClause, setFocusClause] = useState('royalties')
  const [negSessionId, setNegSessionId] = useState('')
  const [messages, setMessages] = useState<SimMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [turn, setTurn] = useState(0)
  const [latestScore, setLatestScore] = useState<{ score: number; feedback: string } | null>(null)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const startNegotiation = async () => {
    setLoading(true)
    try {
      const { data } = await axios.post('/api/negotiate/start', {
        session_id: sessionId,
        focus_clause: focusClause,
      })
      setNegSessionId(data.neg_session_id)
      setMessages([{ type: 'label', content: data.label_message }])
      setStarted(true)
    } catch {
      toast.error('Could not start negotiation simulator')
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    const msg = input.trim()
    if (!msg || loading) return
    setInput('')
    setMessages(prev => [...prev, { type: 'artist', content: msg }])
    setLoading(true)
    try {
      const { data } = await axios.post('/api/negotiate/message', {
        session_id: sessionId,
        neg_session_id: negSessionId,
        message: msg,
      })
      const newMsgs: SimMessage[] = [
        { type: 'label', content: data.label_message },
        { type: 'coach', content: data.coach_tip },
      ]
      if (data.score) {
        setLatestScore(data.score)
        newMsgs[0].score = data.score
      }
      setMessages(prev => [...prev, ...newMsgs])
      setTurn(data.turn)
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const scoreColor = (s: number) => s >= 7 ? '#16a34a' : s >= 5 ? '#d97706' : '#dc2626'

  if (!started) {
    return (
      <div className="flex flex-col gap-5">
        <div
          className="rounded-2xl p-5 flex items-start gap-4"
          style={{ background: 'var(--forest)', border: '1px solid rgba(255,255,255,.08)' }}
        >
          <Swords size={22} color="var(--gold)" className="shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold mb-1" style={{ color: '#f9f5ec' }}>
              Negotiation Simulator
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(249,245,236,.55)' }}>
              Practice the real negotiation before you walk into the room. FairSign plays the
              label rep you play the artist. Get real time coaching on every move.
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#6b6b6b' }}>
            What do you want to negotiate?
          </p>
          <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
            {CLAUSES.map(c => (
              <button
                key={c.id}
                onClick={() => setFocusClause(c.id)}
                className="rounded-xl p-3 text-left transition-all"
                style={{
                  border: `2px solid ${focusClause === c.id ? 'var(--gold)' : 'var(--cream-dark)'}`,
                  background: focusClause === c.id ? 'rgba(201,146,42,.06)' : '#fff',
                }}
              >
                <div className="text-xl mb-1">{c.emoji}</div>
                <div className="text-xs font-semibold" style={{ color: '#1c1c1c' }}>{c.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div
          className="rounded-xl p-4"
          style={{ background: '#fff', border: '1px solid var(--cream-dark)' }}
        >
          <p className="text-xs font-semibold mb-2" style={{ color: '#555' }}>How it works</p>
          <div className="flex flex-col gap-1.5">
            {[
              '🎙️ You are the artist. Type what you want to say to the label.',
              '🏢 FairSign plays the label rep and responds realistically.',
              '💡 After each label message, your coach gives you negotiation tips.',
              '⭐ Your negotiation is scored after 3+ turns.',
            ].map((line, i) => (
              <p key={i} className="text-xs" style={{ color: '#555' }}>{line}</p>
            ))}
          </div>
        </div>

        <button
          onClick={startNegotiation}
          disabled={loading}
          className="flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-sm"
          style={{
            background: loading ? '#ddd' : 'var(--forest)',
            color: loading ? '#999' : '#f9f5ec',
            cursor: loading ? 'default' : 'pointer',
          }}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Setting up negotiation...
            </>
          ) : (
            `Start Negotiating ${CLAUSES.find(c => c.id === focusClause)?.emoji} ${CLAUSES.find(c => c.id === focusClause)?.label}`
          )}
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 220px)', minHeight: 500 }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: '1px solid var(--cream-dark)' }}>
        <div className="flex items-center gap-2">
          <Swords size={15} color="var(--gold)" />
          <span className="text-sm font-semibold" style={{ color: '#1c1c1c' }}>
            Negotiating: {CLAUSES.find(c => c.id === focusClause)?.label}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--cream-dark)', color: '#555' }}>
            Turn {turn}
          </span>
        </div>
        {latestScore && (
          <div className="flex items-center gap-1.5">
            <Star size={13} fill={scoreColor(latestScore.score)} color={scoreColor(latestScore.score)} />
            <span className="text-sm font-bold" style={{ color: scoreColor(latestScore.score) }}>
              {latestScore.score}/10
            </span>
          </div>
        )}
        <button
          onClick={() => { setStarted(false); setMessages([]); setTurn(0); setLatestScore(null) }}
          className="text-xs"
          style={{ color: '#9b9b9b', textDecoration: 'underline' }}
        >
          Restart
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pb-4">
        {messages.map((m, i) => {
          if (m.type === 'coach') return <CoachTip key={i} content={m.content} />

          const isArtist = m.type === 'artist'
          return (
            <div key={i} className={`flex flex-col gap-1 ${isArtist ? 'items-end' : 'items-start'}`}>
              <span className="text-xs px-2" style={{ color: '#bbb' }}>
                {isArtist ? 'You (Artist)' : '🏢 Label Rep'}
              </span>
              <div
                className="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                style={{
                  borderRadius: isArtist ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: isArtist ? 'var(--forest)' : '#fff',
                  color: isArtist ? '#f9f5ec' : '#1c1c1c',
                  border: !isArtist ? '1px solid var(--cream-dark)' : 'none',
                }}
              >
                {m.content}
              </div>
              {m.score && (
                <div className="text-xs px-2 flex items-center gap-1.5" style={{ color: scoreColor(m.score.score) }}>
                  <Star size={11} fill={scoreColor(m.score.score)} color={scoreColor(m.score.score)} />
                  Negotiation score: {m.score.score}/10 — {m.score.feedback}
                </div>
              )}
            </div>
          )
        })}

        {loading && (
          <div className="flex flex-col gap-1 items-start">
            <span className="text-xs px-2" style={{ color: '#bbb' }}>🏢 Label Rep</span>
            <div className="flex gap-1.5 px-4 py-3 rounded-2xl" style={{ background: '#fff', border: '1px solid var(--cream-dark)' }}>
              {[0, 1, 2].map(i => (
                <span key={i} className="typing-dot inline-block w-2 h-2 rounded-full" style={{ background: 'var(--gold)', animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Starter suggestions */}
      {messages.length === 1 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {[
            "I want a higher royalty rate",
            "I'd like to keep my masters",
            "Can we remove the 360 clause?",
            "The contract term is too long",
          ].map(s => (
            <button
              key={s}
              onClick={() => setInput(s)}
              className="text-xs px-3 py-1.5 rounded-full"
              style={{ background: '#fff', border: '1px solid var(--gold)', color: 'var(--gold)', fontWeight: 500 }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 pt-3" style={{ borderTop: '1px solid var(--cream-dark)' }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Say what you want to negotiate..."
          disabled={loading}
          className="flex-1 rounded-full px-5 py-2.5 text-sm outline-none"
          style={{ border: '1px solid #ddd', background: '#fff', color: '#1c1c1c' }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          className="rounded-full px-4 py-2.5 text-sm font-semibold shrink-0"
          style={{
            background: input.trim() && !loading ? 'var(--forest)' : '#ddd',
            color: input.trim() && !loading ? '#f9f5ec' : '#aaa',
            cursor: input.trim() && !loading ? 'pointer' : 'default',
          }}
        >
          Send
        </button>
      </div>
    </div>
  )
}
