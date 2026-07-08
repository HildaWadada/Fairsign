'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTIONS = [
  'What is FairSign?',
  'Is it free to use?',
  'What is a 360 deal?',
  'What does recoupment mean?',
  'Which countries does it support?',
]

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 4, padding: '10px 14px', background: '#f3f4f6', borderRadius: '18px 18px 18px 4px', width: 'fit-content' }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 7, height: 7, borderRadius: '50%', background: '#9ca3af',
          display: 'inline-block',
          animation: 'helpDot 1.4s ease-in-out infinite',
          animationDelay: `${i * 0.2}s`,
        }} />
      ))}
    </div>
  )
}

export default function HelpChatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm Dada 👋 I can answer your questions about FairSign and music contracts. To analyse your own contract, create a free account — it only takes 30 seconds!",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [unread, setUnread] = useState(0)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      setUnread(0)
      endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, open])

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setInput('')

    const newMessages: Message[] = [...messages, { role: 'user', content: msg }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const res = await fetch('/api/help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
      if (!open) setUnread(n => n + 1)
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, something went wrong. Please try again." }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  return (
    <>
      <style>{`
        @keyframes helpDot { 0%,80%,100%{opacity:.2} 40%{opacity:1} }
        @keyframes helpSlideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .help-window { animation: helpSlideUp .25s ease forwards }
      `}</style>

      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
          width: 58, height: 58, borderRadius: '50%',
          background: 'linear-gradient(135deg, #c9922a, #0a2316)',
          border: 'none',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(201,146,42,.5)',
          transition: 'transform .2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        title="Chat with Dada"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 0110 10c0 5.52-4.48 10-10 10a9.96 9.96 0 01-5.06-1.38L2 22l1.38-4.94A9.96 9.96 0 012 12 10 10 0 0112 2z"/>
            <path d="M8 10h.01M12 10h.01M16 10h.01" strokeWidth="2.5"/>
          </svg>
        )}
        {!open && unread > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            width: 20, height: 20, borderRadius: '50%',
            background: '#dc2626', color: '#fff',
            fontSize: 11, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {unread}
          </span>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div
          className="help-window"
          style={{
            position: 'fixed', bottom: 88, right: 24, zIndex: 999,
            width: 340, maxWidth: 'calc(100vw - 32px)',
            background: '#fff', borderRadius: 16,
            boxShadow: '0 8px 32px rgba(0,0,0,.18)',
            border: '1px solid #e5e7eb',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden', fontFamily: 'sans-serif',
          }}
        >
          {/* Header */}
          <div style={{ background: '#0a2316', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #c9922a, #1a4a2e)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 0110 10c0 5.52-4.48 10-10 10a9.96 9.96 0 01-5.06-1.38L2 22l1.38-4.94A9.96 9.96 0 012 12 10 10 0 0112 2z"/>
                <path d="M8 10h.01M12 10h.01M16 10h.01" strokeWidth="2.5"/>
              </svg>
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 14, color: '#f9f5ec', margin: 0 }}>Dada</p>
              <p style={{ fontSize: 11, color: 'rgba(249,245,236,.5)', margin: 0 }}>FairSign Guide · Online</p>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 8px', display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 320 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '82%', padding: '9px 13px',
                  borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: m.role === 'user' ? '#0a2316' : '#f3f4f6',
                  color: m.role === 'user' ? '#f9f5ec' : '#1c1c1c',
                  fontSize: 13, lineHeight: 1.65,
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <TypingDots />
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Suggestion pills — only show at start */}
          {messages.length === 1 && (
            <div style={{ padding: '4px 14px 10px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  style={{
                    fontSize: 11, padding: '5px 10px', borderRadius: 100, cursor: 'pointer',
                    border: '1px solid #c9922a', background: 'transparent',
                    color: '#c9922a', fontWeight: 500, fontFamily: 'sans-serif',
                    transition: 'all .15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget.style.background = '#c9922a'); (e.currentTarget.style.color = '#fff') }}
                  onMouseLeave={e => { (e.currentTarget.style.background = 'transparent'); (e.currentTarget.style.color = '#c9922a') }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '8px 12px 12px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask a question..."
              disabled={loading}
              style={{
                flex: 1, padding: '9px 14px', borderRadius: 100,
                border: '1px solid #e5e7eb', fontSize: 13, outline: 'none',
                fontFamily: 'sans-serif', color: '#1c1c1c', background: '#fafafa',
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              style={{
                width: 36, height: 36, borderRadius: '50%', border: 'none',
                background: input.trim() && !loading ? '#0a2316' : '#e5e7eb',
                cursor: input.trim() && !loading ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, fontSize: 14, transition: 'background .2s',
              }}
            >
              <span style={{ color: input.trim() && !loading ? '#f9f5ec' : '#aaa' }}>↑</span>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
