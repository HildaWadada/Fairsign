'use client'

import { ContractAnalysis } from '@/types'

interface Props {
  analysis: ContractAnalysis
}

export default function DealScoreCard({ analysis }: Props) {
  const scoreColor =
    analysis.dealScore >= 7 ? '#16a34a' : analysis.dealScore >= 5 ? '#d97706' : '#dc2626'
  const scoreBg =
    analysis.dealScore >= 7 ? '#f0fdf4' : analysis.dealScore >= 5 ? '#fffbeb' : '#fef2f2'

  return (
    <div
      className="rounded-2xl p-6 flex gap-5 items-start"
      style={{ background: '#fff', border: '1px solid var(--cream-dark)' }}
    >
      {/* Score circle */}
      <div
        className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center shrink-0"
        style={{ background: scoreColor }}
      >
        <span className="text-3xl font-bold text-white leading-none">{analysis.dealScore}</span>
        <span className="text-xs text-white/80 mt-0.5">/ 10</span>
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h2 className="font-serif text-xl" style={{ fontWeight: 400, color: '#1c1c1c' }}>
            {analysis.scoreLabel}
          </h2>
          <span
            className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
            style={{ background: scoreBg, color: scoreColor }}
          >
            {analysis.dealScore >= 7 ? '✓ Sign with confidence' : analysis.dealScore >= 5 ? '⚡ Negotiate first' : '⛔ Proceed with caution'}
          </span>
        </div>
        <p className="text-sm mb-3" style={{ color: '#6b6b6b' }}>{analysis.scoreReason}</p>
        <p className="text-sm leading-relaxed" style={{ color: '#333' }}>{analysis.summary}</p>
      </div>
    </div>
  )
}
