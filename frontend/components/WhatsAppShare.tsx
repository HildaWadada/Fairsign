'use client'

import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { MessageCircle, Copy, ExternalLink } from 'lucide-react'

interface Props {
  sessionId: string
  market: string
}

export default function WhatsAppShare({ sessionId, market }: Props) {
  const [preview, setPreview] = useState('')
  const [waUrl, setWaUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState(false)

  const generate = async () => {
    setLoading(true)
    try {
      const form = new FormData()
      form.append('session_id', sessionId)
      const { data } = await axios.post('/api/whatsapp-summary', form)
      setPreview(data.text)
      setWaUrl(data.whatsapp_url)
      setGenerated(true)
    } catch {
      toast.error('Could not generate WhatsApp summary')
    } finally {
      setLoading(false)
    }
  }

  const copyText = () => {
    navigator.clipboard.writeText(preview)
    toast.success('Copied to clipboard!')
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div
        className="rounded-2xl p-5 flex items-start gap-4"
        style={{ background: 'var(--forest)', border: '1px solid rgba(255,255,255,.08)' }}
      >
        <MessageCircle size={22} color="#25D366" className="shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold mb-1" style={{ color: '#f9f5ec' }}>
            Share on WhatsApp
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(249,245,236,.55)' }}>
            Fairsign runs on WhatsApp. One tap sends your contract summary to your manager,
            producer, or a lawyer friend formatted perfectly for the app.
          </p>
        </div>
      </div>

      {!generated ? (
        <button
          onClick={generate}
          disabled={loading}
          className="flex items-center justify-center gap-2.5 py-4 rounded-xl font-semibold text-base transition-all"
          style={{
            background: loading ? '#ddd' : '#25D366',
            color: '#fff',
            cursor: loading ? 'default' : 'pointer',
          }}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Preparing summary...
            </>
          ) : (
            <>
              <MessageCircle size={18} />
              Generate WhatsApp Summary
            </>
          )}
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Phone preview */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid var(--cream-dark)' }}
          >
            {/* WhatsApp-style header */}
            <div
              className="px-4 py-3 flex items-center gap-3"
              style={{ background: '#075e54' }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: '#128c7e', color: '#fff' }}
              >
                FS
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: '#fff' }}>FairSign Analysis</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,.6)' }}>Contract Summary · {market}</p>
              </div>
            </div>

            {/* Message bubble */}
            <div className="p-4" style={{ background: '#e5ddd5' }}>
              <div
                className="rounded-lg p-3 max-w-xs ml-auto"
                style={{ background: '#dcf8c6' }}
              >
                <pre
                  className="text-xs leading-relaxed whitespace-pre-wrap font-sans"
                  style={{ color: '#1c1c1c' }}
                >
                  {preview.slice(0, 600)}{preview.length > 600 ? '...' : ''}
                </pre>
                <p className="text-right text-xs mt-1" style={{ color: '#9b9b9b' }}>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ✓✓
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2.5">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm"
              style={{ background: '#25D366', color: '#fff', textDecoration: 'none' }}
            >
              <ExternalLink size={15} />
              Open in WhatsApp
            </a>
            <button
              onClick={copyText}
              className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm"
              style={{ background: '#fff', color: '#1c1c1c', border: '1px solid var(--cream-dark)' }}
            >
              <Copy size={15} />
              Copy Text
            </button>
          </div>

          <button
            onClick={() => setGenerated(false)}
            className="text-xs text-center"
            style={{ color: '#9b9b9b', textDecoration: 'underline' }}
          >
            Regenerate
          </button>
        </div>
      )}
    </div>
  )
}
