'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { RedFlag } from '@/types'

interface Props {
  flag: RedFlag
  market: string
}

const SEV = {
  high: { color: '#dc2626', bg: '#fef2f2', border: '#fca5a5', label: 'HIGH RISK', dot: '🔴' },
  medium: { color: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'MODERATE', dot: '🟡' },
  low: { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', label: 'NOTE', dot: '🔵' },
}

export default function RedFlagCard({ flag, market }: Props) {
  const [expanded, setExpanded] = useState(flag.severity === 'high')
  const s = SEV[flag.severity] || SEV.low

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: `1px solid ${s.border}` }}
    >
      {/* Header */}
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-opacity hover:opacity-90"
        style={{ background: s.bg }}
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-base">{s.dot}</span>
        <span className="font-semibold text-sm flex-1" style={{ color: s.color }}>{flag.clause}</span>
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ background: s.color, color: '#fff', letterSpacing: '0.05em' }}
        >
          {s.label}
        </span>
        {expanded ? <ChevronUp size={16} color={s.color} /> : <ChevronDown size={16} color={s.color} />}
      </button>

      {/* Body */}
      {expanded && (
        <div className="px-4 py-4" style={{ background: '#fff' }}>
          <p className="text-sm leading-relaxed mb-4" style={{ color: '#333' }}>{flag.explanation}</p>

          {/* African context */}
          <div
            className="rounded-lg px-4 py-3 mb-3"
            style={{ background: 'rgba(10,35,22,.05)', border: '1px solid rgba(10,35,22,.1)' }}
          >
            <p
              className="text-xs font-bold uppercase tracking-wider mb-1.5"
              style={{ color: 'var(--forest)', letterSpacing: '1.5px' }}
            >
              🌍 {market} Context
            </p>
            <p className="text-sm leading-relaxed" style={{ color: '#333' }}>{flag.africanContext}</p>
          </div>

          {/* Suggestion */}
          <div
            className="rounded-lg px-4 py-3 mb-3"
            style={{ background: '#fef9f0', border: '1px solid #fde68a' }}
          >
            <p className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#92400e', letterSpacing: '1.5px' }}>
              💡 Negotiate For
            </p>
            <p className="text-sm leading-relaxed" style={{ color: '#78350f' }}>{flag.suggestion}</p>
          </div>

          {/* Template language */}
          {flag.templateLanguage && (
            <div
              className="rounded-lg px-4 py-3"
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
            >
              <p className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#475569', letterSpacing: '1.5px' }}>
                📝 Suggested Contract Language
              </p>
              <p className="text-xs leading-relaxed font-mono" style={{ color: '#334155' }}>{flag.templateLanguage}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
