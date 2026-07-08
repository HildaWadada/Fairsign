'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { Send } from 'lucide-react'
import { sendChatMessage } from '@/lib/api'
import { ContractAnalysis, Personality, Market, ChatMessage } from '@/types'

interface Props {
  sessionId: string
  market: Market
  personality: Personality
  analysis: ContractAnalysis
}

const SUGGESTIONS = [
  'Do I own my masters?',
  'What does recoupment mean for me?',
  'How bad is the 360 deal?',
  'Can I release music independently?',
  'What should I negotiate first?',
  'Is this royalty rate fair?',
]

function TypingIndicator() {
  return (
    <div className="flex gap-1.5 px-4 py-3 rounded-2xl w-fit" style={{ background: '#fff', border: '1px solid #ede8dc' }}>
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="typing-dot inline-block w-2 h-2 rounded-full"
          style={{ background: 'var(--gold)', animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  )
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className="max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
        style={{
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          background: isUser ? 'var(--forest)' : '#fff',
          color: isUser ? '#f9f5ec' : '#1c1c1c',
          border: isUser ? 'none' : '1px solid #ede8dc',
        }}
      >
        {/* Bold markdown rendering */}
        {msg.content.split(/\*\*(.+?)\*\*/g).map((part, i) =>
          i % 2 === 1 ? <strong key={i}>{part}</strong> : part
        )}
      </div>
    </div>
  )
}

export default function ChatInterface({ sessionId, market, personality, analysis }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Hi! I've finished reading your contract. Your deal scored **${analysis.dealScore}/10** (${analysis.scoreLabel}). ${analysis.scoreReason}\n\nAsk me anything — I'm here to help you understand every clause.`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentPersonality, setCurrentPersonality] = useState<Personality>(personality)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async (text?: string) => {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setInput('')
    const userMsg: ChatMessage = { role: 'user', content: msg, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)
    try {
      const reply = await sendChatMessage(sessionId, msg, currentPersonality)
      setMessages(prev => [...prev, { role: 'assistant', content: reply, timestamp: new Date() }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I couldn't process that. Please try again.",
        timestamp: new Date(),
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 220px)', minHeight: 480 }}>
      {/* Personality switcher */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-xs" style={{ color: '#6b6b6b' }}>Tone:</span>
        {(['friendly', 'formal', 'concise'] as Personality[]).map(p => (
          <button
            key={p}
            onClick={() => setCurrentPersonality(p)}
            className="text-xs px-3 py-1 rounded-full transition-all capitalize"
            style={{
              border: `1px solid ${currentPersonality === p ? 'var(--forest)' : '#ddd'}`,
              background: currentPersonality === p ? 'var(--forest)' : 'transparent',
              color: currentPersonality === p ? '#f9f5ec' : '#6b6b6b',
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pb-4">
        {messages.map((m, i) => <MessageBubble key={i} msg={m} />)}
        {loading && <TypingIndicator />}
        <div ref={endRef} />
      </div>

      {/* Suggestion pills — shown when only the welcome message exists */}
      {messages.length === 1 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => handleSend(s)}
              className="text-xs px-3 py-1.5 rounded-full transition-all"
              style={{
                background: '#fff',
                border: '1px solid var(--gold)',
                color: 'var(--gold)',
                fontWeight: 500,
              }}
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
          onKeyDown={handleKey}
          placeholder={`Ask about your ${market} contract...`}
          disabled={loading}
          className="flex-1 rounded-full px-5 py-2.5 text-sm outline-none"
          style={{
            border: '1px solid #ddd',
            background: '#fff',
            color: '#1c1c1c',
          }}
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          className="rounded-full w-10 h-10 flex items-center justify-center transition-all shrink-0"
          style={{
            background: input.trim() && !loading ? 'var(--forest)' : '#ddd',
            cursor: input.trim() && !loading ? 'pointer' : 'default',
          }}
        >
          <Send size={15} color={input.trim() && !loading ? '#f9f5ec' : '#aaa'} />
        </button>
      </div>
    </div>
  )
}
