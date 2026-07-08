'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Search, AlertTriangle, Flag, Star } from 'lucide-react'

const SEVERITY_STYLE = {
  high: { bg: '#fee2e2', color: '#991b1b', dot: '🔴' },
  medium: { bg: '#fef3c7', color: '#92400e', dot: '🟡' },
  low: { bg: '#dbeafe', color: '#1e40af', dot: '🔵' },
}

const ratingColor = (r: number) => r >= 4 ? '#16a34a' : r >= 3 ? '#d97706' : '#dc2626'
const ratingLabel = (r: number) => r >= 4 ? 'Generally Fair' : r >= 3 ? 'Mixed Reports' : 'Concerning'

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star
          key={n}
          size={12}
          fill={value >= n ? ratingColor(value) : 'none'}
          color={value >= n ? ratingColor(value) : '#ddd'}
        />
      ))}
      <span className="text-xs ml-1 font-semibold" style={{ color: ratingColor(value) }}>
        {value.toFixed(1)}
      </span>
    </div>
  )
}

export default function LabelReputationBoard() {
  const [labels, setLabels] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [notFound, setNotFound] = useState('')
  const [selectedLabel, setSelectedLabel] = useState<any>(null)
  const [showReport, setShowReport] = useState(false)
  const [reportForm, setReportForm] = useState({
    label_name: '', country: 'Uganda', issue: '', severity: 'high', details: '', reporter_market: 'Uganda',
  })
  const [submitting, setSubmitting] = useState(false)
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    axios.get('/api/labels').then(r => setLabels(r.data)).catch(() => {})
  }, [])

  const handleSearch = async () => {
    if (!search.trim()) return
    setSearching(true)
    try {
      const { data } = await axios.get(`/api/labels/search?q=${encodeURIComponent(search)}`)
      setSearchResults(data.results || data)
      if ((data.results || data).length === 0) {
        setNotFound(search.trim())
      } else {
        setNotFound('')
      }
    } catch {
      toast.error('Search failed')
    } finally {
      setSearching(false)
    }
  }

  const handleReport = async () => {
    if (!reportForm.label_name || !reportForm.issue) {
      toast.error('Label name and issue are required')
      return
    }
    setSubmitting(true)
    try {
      await axios.post('/api/labels/report', reportForm)
      toast.success('Report submitted — thank you for protecting fellow artists!')
      setShowReport(false)
      setReportForm({ label_name: '', country: 'Uganda', issue: '', severity: 'high', details: '', reporter_market: 'Uganda' })
      const { data } = await axios.get('/api/labels')
      setLabels(data)
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  const displayLabels = searchResults.length > 0 ? searchResults : labels

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div
        className="rounded-2xl p-5 flex items-start gap-4"
        style={{ background: 'var(--forest)', border: '1px solid rgba(255,255,255,.08)' }}
      >
        <div className="text-xl shrink-0">🔴</div>
        <div>
          <h3 className="font-semibold mb-1" style={{ color: '#f9f5ec' }}>
            Label Reputation Board
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(249,245,236,.55)' }}>
            Artists protecting artists. Search before you sign see what others have reported
            about labels across Uganda, Nigeria, Kenya, and South Africa.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#9b9b9b' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search a label name or country..."
            className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none"
            style={{ border: '1px solid var(--cream-dark)', background: '#fff', color: '#1c1c1c' }}
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={searching}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: 'var(--forest)', color: '#f9f5ec', opacity: searching ? 0.6 : 1 }}
        >
          Search
        </button>
        <button
          onClick={() => setShowReport(true)}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5"
          style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' }}
        >
          <Flag size={13} /> Report
        </button>
      </div>

      {/* Results clear */}
      {searchResults.length > 0 && (
        <button
          className="text-xs self-start"
          style={{ color: '#9b9b9b', textDecoration: 'underline' }}
          onClick={() => { setSearchResults([]); setSearch(''); setNotFound('') }}
        >
          ← Show all labels
        </button>
      )}

      {/* Label list */}
      <div className="flex flex-col gap-3">
        {displayLabels.length === 0 && (
          <div className="rounded-xl p-8 text-center" style={{ background: '#fff', border: '1px solid var(--cream-dark)' }}>
            {notFound ? (
              <>
                <p className="text-sm font-semibold mb-2" style={{ color: '#1c1c1c' }}>
                  No reports found for "{notFound}"
                </p>
                <p className="text-xs mb-4" style={{ color: '#9b9b9b' }}>
                  Be the first to report this label and protect other artists.
                </p>
                <button
                  onClick={() => {
                    setReportForm(p => ({ ...p, label_name: notFound }))
                    setShowReport(true)
                  }}
                  className="text-xs px-4 py-2 rounded-full font-semibold"
                  style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' }}
                >
                  Report "{notFound}" →
                </button>
              </>
            ) : (
              <p className="text-sm" style={{ color: '#9b9b9b' }}>
                {labels.length === 0
                  ? 'No labels reported yet. Search a label or be the first to submit a report.'
                  : 'No labels found.'}
              </p>
            )}
          </div>
        )}
        {displayLabels.map((label: any, i: number) => (
          <div
            key={i}
            className="rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-sm"
            style={{ border: '1px solid var(--cream-dark)', background: '#fff' }}
            onClick={() => setSelectedLabel(selectedLabel?.name === label.name ? null : label)}
          >
            <div className="px-4 py-3.5 flex items-center gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm" style={{ color: '#1c1c1c' }}>{label.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--cream-dark)', color: '#555' }}>
                    {label.country}
                  </span>
                  {label.high_severity_count > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#fee2e2', color: '#991b1b' }}>
                      {label.high_severity_count} high risk
                    </span>
                  )}
                </div>
                {label.latest_issue && (
                  <p className="text-xs mt-1 truncate" style={{ color: '#9b9b9b' }}>
                    Latest: {label.latest_issue}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1">
                <StarRating value={label.rating} />
                <span className="text-xs" style={{ color: '#9b9b9b' }}>
                  {label.report_count} report{label.report_count !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Expanded reports */}
            {selectedLabel?.name === label.name && label.reports && (
              <div style={{ borderTop: '1px solid var(--cream-dark)', background: '#fafaf8' }}>
                {label.reports.map((r: any, j: number) => {
                  const sev = SEVERITY_STYLE[r.severity as keyof typeof SEVERITY_STYLE] || SEVERITY_STYLE.low
                  return (
                    <div key={j} className="px-4 py-3 flex items-start gap-3" style={{ borderBottom: j < label.reports.length - 1 ? '1px solid var(--cream-dark)' : 'none' }}>
                      <span className="text-sm shrink-0 mt-0.5">{sev.dot}</span>
                      <div className="flex-1">
                        <p className="text-sm" style={{ color: '#1c1c1c' }}>{r.issue}</p>
                        {r.details && <p className="text-xs mt-0.5" style={{ color: '#9b9b9b' }}>{r.details}</p>}
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold uppercase" style={{ background: sev.bg, color: sev.color, letterSpacing: '0.04em' }}>
                            {r.severity}
                          </span>
                          <span className="text-xs" style={{ color: '#bbb' }}>{r.date}</span>
                          {r.verified && <span className="text-xs" style={{ color: '#16a34a' }}>✓ Verified</span>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Report modal */}
      {showReport && (
        <div
          className="rounded-2xl p-5"
          style={{ background: '#fff', border: '2px solid #fca5a5', marginTop: 4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-sm flex items-center gap-2" style={{ color: '#991b1b' }}>
              <AlertTriangle size={15} /> Report a Label
            </h4>
            <button onClick={() => setShowReport(false)} className="text-sm" style={{ color: '#9b9b9b' }}>✕</button>
          </div>

          <div className="flex flex-col gap-3">
            {[
              { key: 'label_name', label: 'Label Name *', type: 'text', placeholder: 'e.g. SoundWave Records' },
              { key: 'issue', label: 'What happened? *', type: 'text', placeholder: 'e.g. Royalty payments delayed by 8 months' },
              { key: 'details', label: 'Additional details', type: 'text', placeholder: 'Optional: more context' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="text-xs font-medium block mb-1" style={{ color: '#555' }}>{label}</label>
                <input
                  type={type}
                  value={(reportForm as any)[key]}
                  onChange={e => setReportForm(p => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ border: '1px solid var(--cream-dark)', background: '#fafaf8', color: '#1c1c1c' }}
                />
              </div>
            ))}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: '#555' }}>Country</label>
                <select
                  value={reportForm.country}
                  onChange={e => setReportForm(p => ({ ...p, country: e.target.value }))}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ border: '1px solid var(--cream-dark)', background: '#fafaf8', color: '#1c1c1c' }}
                >
                  {['Uganda', 'Nigeria', 'Kenya', 'South Africa', 'Other'].map(c => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: '#555' }}>Severity</label>
                <select
                  value={reportForm.severity}
                  onChange={e => setReportForm(p => ({ ...p, severity: e.target.value }))}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ border: '1px solid var(--cream-dark)', background: '#fafaf8', color: '#1c1c1c' }}
                >
                  <option value="high">High — Serious violation</option>
                  <option value="medium">Medium — Concerning</option>
                  <option value="low">Low — Minor issue</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleReport}
              disabled={submitting}
              className="py-2.5 rounded-xl text-sm font-semibold mt-1"
              style={{ background: submitting ? '#ddd' : '#dc2626', color: '#fff', cursor: submitting ? 'default' : 'pointer' }}
            >
              {submitting ? 'Submitting...' : 'Submit Report Anonymously'}
            </button>
          </div>
        </div>
      )}

      <p className="text-xs text-center" style={{ color: '#bbb' }}>
        All reports are anonymous. This board is community powered report responsibly.
      </p>
    </div>
  )
}
