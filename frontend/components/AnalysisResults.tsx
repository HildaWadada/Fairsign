'use client'

import { ContractAnalysis, Market, TermStatus } from '@/types'
import DealScoreCard from './DealScoreCard'

interface Props {
  analysis: ContractAnalysis
  market: Market
}

const STATUS_STYLE: Record<TermStatus, { bg: string; color: string }> = {
  good: { bg: '#dcfce7', color: '#166534' },
  fair: { bg: '#dbeafe', color: '#1e40af' },
  concerning: { bg: '#fef3c7', color: '#92400e' },
  bad: { bg: '#fee2e2', color: '#991b1b' },
}

export default function AnalysisResults({ analysis, market }: Props) {
  return (
    <div className="flex flex-col gap-5">
      {/* Score card */}
      <DealScoreCard analysis={analysis} />

      {/* Overall advice */}
      <div
        className="rounded-xl p-5"
        style={{ background: 'var(--forest)', border: '1px solid rgba(255,255,255,.08)' }}
      >
        <p
          className="text-xs font-bold uppercase tracking-widest mb-2"
          style={{ color: 'var(--gold)', letterSpacing: '2px' }}
        >
          FairSign Recommendation
        </p>
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(249,245,236,.85)' }}>
          {analysis.overallAdvice}
        </p>
      </div>

      {/* Market context */}
      <div
        className="rounded-xl p-5"
        style={{ background: 'rgba(10,35,22,.06)', border: '1px solid rgba(10,35,22,.12)' }}
      >
        <p
          className="text-xs font-bold uppercase tracking-widest mb-2"
          style={{ color: 'var(--forest)', letterSpacing: '1.5px' }}
        >
          🌍 {market} Market Context
        </p>
        <p className="text-sm leading-relaxed" style={{ color: '#333' }}>{analysis.marketContext}</p>
      </div>

      {/* Positives */}
      {analysis.positives?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3" style={{ color: '#1c1c1c' }}>
            ✅ What Works in Your Favour
          </h3>
          <div className="flex flex-col gap-2">
            {analysis.positives.map((p, i) => (
              <div
                key={i}
                className="flex gap-2.5 rounded-lg px-4 py-3 text-sm"
                style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534' }}
              >
                <span className="shrink-0">✓</span>
                <span>{p}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key terms table */}
      <div>
        <h3 className="text-sm font-semibold mb-3" style={{ color: '#1c1c1c' }}>Key Contract Terms</h3>
        <div className="flex flex-col gap-2.5">
          {(analysis.keyTerms || []).map((t, i) => {
            const style = STATUS_STYLE[t.status] || STATUS_STYLE.fair
            return (
              <div
                key={i}
                className="rounded-xl px-4 py-3.5 flex items-start justify-between gap-3 flex-wrap"
                style={{ background: '#fff', border: '1px solid var(--cream-dark)' }}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm mb-0.5" style={{ color: '#1c1c1c' }}>{t.term}</p>
                  <p className="text-xs" style={{ color: '#6b6b6b' }}>
                    {t.contractSays}
                    <span style={{ color: '#bbb' }}> · Benchmark: {t.benchmark}</span>
                  </p>
                </div>
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full uppercase shrink-0"
                  style={{ background: style.bg, color: style.color, letterSpacing: '0.04em' }}
                >
                  {t.status}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Red flag count summary */}
      {analysis.redFlags?.length > 0 && (
        <div
          className="rounded-xl p-4 flex items-center gap-3"
          style={{ background: '#fef2f2', border: '1px solid #fca5a5' }}
        >
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="text-sm font-semibold" style={{ color: '#991b1b' }}>
              {analysis.redFlags.filter(f => f.severity === 'high').length} high risk and{' '}
              {analysis.redFlags.filter(f => f.severity === 'medium').length} moderate issues found
            </p>
            <p className="text-xs" style={{ color: '#b91c1c' }}>
              Switch to the Red Flags tab for detailed breakdowns and negotiation language.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
