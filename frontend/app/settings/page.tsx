'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

type Theme = 'light' | 'dark'
type Tab = 'profile' | 'account' | 'notifications' | 'appearance'

const MARKETS = ['Uganda', 'Nigeria', 'Kenya', 'South Africa']
const GENRES  = ['Afrobeats', 'Afropop', 'RnB', 'Dancehall', 'Hip-hop', 'Amapiano', 'Bongo Flava', 'Gengetone', 'Gospel', 'Pop', 'Other']

const THEME_STYLES = `
  /* ── Light mode ── */
  [data-theme="light"] {
    --bg:            #FEFCF8;
    --card:          #ffffff;
    --nav:           #ffffff;
    --nav-border:    #eeeeee;
    --border:        #e8e0d0;
    --text:          #7A4F0A;
    --text-2:        #a07840;
    --text-3:        #c4a870;
    --accent:        #B87A14;
    --accent-hover:  #9e6a10;
    --danger:        #b91c1c;
    --success:       #15803d;
    --input-bg:      #FEFCF8;
    --hover:         #FEF3DC;
    --section-bg:    #FEF9F0;
    --avatar-bg:     #FEF3DC;
    --avatar-border: #B87A14;
    --nav-text:      #7A4F0A;
    --nav-muted:     #a07840;
    --badge-bg:      #FEF3DC;
    --badge-text:    #7A4F0A;
    --pill-sel-bg:   #B87A14;
    --pill-sel-text: #ffffff;
    --save-bg:       #B87A14;
    --save-text:     #ffffff;
    --save-hover:    #9e6a10;
  }

  /* ── Dark mode ── */
  [data-theme="dark"] {
    --bg:            #1a1108;
    --card:          #221608;
    --nav:           #1a1108;
    --nav-border:    #3a2808;
    --border:        #3a2808;
    --text:          #f5c96a;
    --text-2:        #c49a4a;
    --text-3:        #8a6a30;
    --accent:        #B87A14;
    --accent-hover:  #d08a18;
    --danger:        #f87171;
    --success:       #4ade80;
    --input-bg:      #1a1108;
    --hover:         #2e1e08;
    --section-bg:    #1a1108;
    --avatar-bg:     rgba(184,122,20,.18);
    --avatar-border: #B87A14;
    --nav-text:      #f5c96a;
    --nav-muted:     #8a6a30;
    --badge-bg:      rgba(254,243,220,.12);
    --badge-text:    #f5c96a;
    --pill-sel-bg:   #B87A14;
    --pill-sel-text: #ffffff;
    --save-bg:       #B87A14;
    --save-text:     #ffffff;
    --save-hover:    #d08a18;
  }

  * { box-sizing: border-box; transition: background-color 0.2s ease, border-color 0.2s ease, color 0.15s ease; }

  /* ── Inputs ── */
  .settings-input {
    width: 100%; padding: 10px 14px;
    border: 1.5px solid var(--border); border-radius: 9px; font-size: 14px;
    color: var(--text); background: var(--input-bg); outline: none;
    font-family: inherit;
  }
  .settings-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(184,122,20,.14);
  }
  .settings-input::placeholder { color: var(--text-3); }
  .settings-input:disabled { opacity: 0.45; cursor: not-allowed; }

  /* ── Sidebar tabs ── */
  .tab-btn {
    display: flex; align-items: center; gap: 10px; width: 100%;
    padding: 10px 13px; border: none; border-radius: 9px; cursor: pointer;
    font-size: 14px; font-family: inherit; text-align: left;
    font-weight: 500; letter-spacing: 0.01em;
  }
  .tab-btn.active  { background: #B87A14 !important; color: #ffffff !important; font-weight: 700; }
  .tab-btn:not(.active) { background: transparent; color: var(--text-2); }
  .tab-btn:not(.active):hover { background: var(--hover) !important; color: var(--text) !important; }

  /* ── Primary save button ── */
  .save-btn {
    padding: 10px 26px; border: none; border-radius: 9px;
    background: var(--save-bg); color: var(--save-text);
    font-size: 14px; font-weight: 700; cursor: pointer;
    font-family: inherit;
  }
  .save-btn:hover:not(:disabled) { background: var(--save-hover); }
  .save-btn:disabled { opacity: 0.45; cursor: not-allowed; }

  /* ── Danger button ── */
  .danger-btn {
    padding: 9px 20px; border: 1.5px solid var(--danger); border-radius: 9px;
    background: transparent; color: var(--danger); font-size: 13px; font-weight: 600;
    cursor: pointer; font-family: inherit;
  }
  .danger-btn:hover { background: rgba(185,28,28,.07); }

  /* ── Toggle switch ── */
  .toggle-switch { position: relative; width: 44px; height: 24px; display: inline-block; cursor: pointer; }
  .toggle-switch input { opacity: 0; width: 0; height: 0; }
  .toggle-slider {
    position: absolute; inset: 0; border-radius: 24px;
    background: var(--border); border: 1px solid rgba(0,0,0,.07);
  }
  .toggle-slider::before {
    content: ''; position: absolute; width: 18px; height: 18px; border-radius: 50%;
    background: #fff; left: 2px; top: 2px; transition: transform .18s;
    box-shadow: 0 1px 3px rgba(0,0,0,.22);
  }
  .toggle-switch input:checked + .toggle-slider { background: #B87A14; border-color: transparent; }
  .toggle-switch input:checked + .toggle-slider::before { transform: translateX(20px); }

  /* ── Pill selector buttons ── */
  .pill-btn {
    padding: 6px 14px; border-radius: 99px; font-size: 13px; cursor: pointer;
    font-family: inherit; font-weight: 500;
  }
  .pill-btn.selected {
    background: var(--pill-sel-bg); color: var(--pill-sel-text);
    border: 1.5px solid var(--pill-sel-bg);
  }
  .pill-btn:not(.selected) {
    background: transparent; color: var(--text-2);
    border: 1.5px solid var(--border);
  }
  .pill-btn:not(.selected):hover { border-color: var(--accent); color: var(--accent); background: var(--hover); }

  /* ── Appearance theme cards ── */
  .theme-card {
    padding: 18px; border-radius: 12px; cursor: pointer; text-align: left;
  }
  .theme-card.selected { box-shadow: 0 0 0 3px rgba(184,122,20,.22); }

  /* ── Field label ── */
  .field-label {
    font-size: 11.5px; font-weight: 700; color: var(--text-2);
    display: block; margin-bottom: 6px;
    text-transform: uppercase; letter-spacing: 0.55px;
  }
`

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="toggle-switch">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="toggle-slider" />
    </label>
  )
}

function SettingRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 0', borderBottom:'1px solid var(--border)', gap:16 }}>
      <div>
        <p style={{ fontSize:14, fontWeight:600, color:'var(--text)', margin:0 }}>{label}</p>
        {hint && <p style={{ fontSize:12, color:'var(--text-3)', margin:'2px 0 0' }}>{hint}</p>}
      </div>
      {children}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize:10.5, fontWeight:700, letterSpacing:1.6, textTransform:'uppercase', color:'#B87A14', margin:'0 0 14px' }}>
      {children}
    </p>
  )
}

function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <div style={{
      position:'fixed', bottom:24, right:24, zIndex:999,
      padding:'11px 18px', borderRadius:10,
      background: type === 'success' ? '#7A4F0A' : '#7f1d1d',
      color:'#fff', fontSize:13, fontWeight:600,
      boxShadow:'0 4px 18px rgba(0,0,0,.16)',
      display:'flex', alignItems:'center', gap:8,
    }}>
      {type === 'success' ? '✓' : '✕'} {msg}
    </div>
  )
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const [tab, setTab]       = useState<Tab>('profile')
  const [theme, setTheme]   = useState<Theme>('light')
  const [toast, setToast]   = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Profile
  const [name, setName]           = useState('')
  const [stageName, setStageName] = useState('')
  const [genre, setGenre]         = useState('')
  const [market, setMarket]       = useState('Uganda')
  const [phone, setPhone]         = useState('')

  // Account
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd]         = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')

  // Notifications
  const [notifAnalysis,  setNotifAnalysis]  = useState(true)
  const [notifTips,      setNotifTips]      = useState(true)
  const [notifLabelNews, setNotifLabelNews] = useState(false)
  const [notifMarketing, setNotifMarketing] = useState(false)
  const [notifLoading,   setNotifLoading]   = useState(false)

  useEffect(() => {
    const saved = (localStorage.getItem('fs-theme') as Theme) || 'light'
    setTheme(saved)
    document.documentElement.setAttribute('data-theme', saved)
  }, [])

  useEffect(() => {
    if (!session) return
    setName(session.user?.name || '')
    setMarket((session.user as any)?.market || 'Uganda')

    const token = (session as any)?.backendToken
    if (token) {
      axios.get('/backend/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => {
          setName(r.data.name || '')
          setMarket(r.data.market || 'Uganda')
          setPhone(r.data.phone || '')
        })
        .catch(() => {})
    }

    fetch('/api/artist/readiness')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.profile) {
          setStageName(data.profile.stageName || '')
          setGenre(data.profile.genre || '')
        }
      })
      .catch(() => {})
  }, [session?.user?.email])

  const [notifFetched, setNotifFetched] = useState(false)
  useEffect(() => {
    if (!session || notifFetched) return
    setNotifFetched(true)
    setNotifLoading(true)
    fetch('/api/notifications/preferences')
      .then(r => r.ok ? r.json() : null)
      .then(prefs => {
        if (!prefs) return
        setNotifAnalysis(prefs.analysis  ?? true)
        setNotifTips(     prefs.tips      ?? true)
        setNotifLabelNews(prefs.labelNews ?? false)
        setNotifMarketing(prefs.marketing ?? false)
      })
      .catch(() => {})
      .finally(() => setNotifLoading(false))
  }, [session, notifFetched])

  function showToast(msg: string, type: 'success' | 'error') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  function applyTheme(t: Theme) {
    setTheme(t)
    document.documentElement.setAttribute('data-theme', t)
    localStorage.setItem('fs-theme', t)
  }

  async function saveProfile() {
    setSaving(true)
    try {
      const token = (session as any)?.backendToken
      if (!token) { showToast('Not authenticated. Please log in again.', 'error'); return }

      await axios.put('/backend/auth/profile',
        { name: name.trim(), market, phone: phone.trim() },
        { headers: { Authorization: `Bearer ${token}` } },
      )

      const readiness = await fetch('/api/artist/readiness').then(r => r.ok ? r.json() : null)
      if (readiness) {
        await fetch('/api/artist/readiness', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...readiness,
            profile: { ...readiness.profile, stageName: stageName.trim(), genre },
          }),
        })
      }
      showToast('Profile saved!', 'success')
    } catch (err: any) {
      showToast(err?.response?.data?.detail || 'Could not save profile.', 'error')
    } finally { setSaving(false) }
  }

  async function savePassword() {
    if (!currentPwd)           { showToast('Enter your current password.', 'error'); return }
    if (newPwd.length < 8)     { showToast('New password must be at least 8 characters.', 'error'); return }
    if (newPwd !== confirmPwd) { showToast('Passwords do not match.', 'error'); return }

    setSaving(true)
    try {
      const token = (session as any)?.backendToken
      if (!token) { showToast('Not authenticated.', 'error'); return }
      await axios.put('/backend/auth/password',
        { current_password: currentPwd, new_password: newPwd },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('')
      showToast('Password updated!', 'success')
    } catch (err: any) {
      showToast(err?.response?.data?.detail || 'Incorrect current password.', 'error')
    } finally { setSaving(false) }
  }

  async function saveNotifications() {
    setSaving(true)
    try {
      const res = await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis:  notifAnalysis,
          tips:      notifTips,
          labelNews: notifLabelNews,
          marketing: notifMarketing,
        }),
      })
      if (!res.ok) throw new Error('Save failed')
      showToast('Notification preferences saved!', 'success')
    } catch {
      showToast('Could not save preferences.', 'error')
    } finally { setSaving(false) }
  }

  async function deleteAccount() {
    try {
      const token = (session as any)?.backendToken
      await axios.delete('/backend/auth/account', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      await signOut({ callbackUrl: '/' })
    } catch {
      showToast('Could not delete account. Contact support.', 'error')
    }
  }

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'profile',       label: 'Profile',       icon: '👤' },
    { id: 'account',       label: 'Account',       icon: '🔐' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'appearance',    label: 'Appearance',    icon: '🎨' },
  ]

  const isGoogleUser = (session?.user as any)?.provider === 'google'
  const userInitial  = (name || session?.user?.name || '?')[0].toUpperCase()

  return (
    <>
      <style suppressHydrationWarning>{THEME_STYLES}</style>
      <div style={{ minHeight:'100vh', background:'var(--bg)', fontFamily:'sans-serif' }}>

        {/* ── Nav ── */}
        <nav style={{
          background: 'var(--nav)',
          borderBottom: '1px solid var(--nav-border)',
          padding: '13px 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <button
              onClick={() => router.push('/dashboard')}
              style={{ background:'none', border:'none', cursor:'pointer', color:'var(--nav-muted)', fontSize:13, display:'flex', alignItems:'center', gap:6, padding:0 }}
            >
              ← Dashboard
            </button>
            <span style={{ color:'var(--border)' }}>·</span>
            <span style={{ fontSize:15, fontWeight:700, color:'var(--nav-text)' }}>Settings</span>
          </div>

          {/* Theme toggle in nav */}
          <button
            onClick={() => applyTheme(theme === 'light' ? 'dark' : 'light')}
            style={{
              background: 'var(--hover)',
              border: '1px solid var(--border)',
              borderRadius: 8, padding: '6px 13px',
              color: 'var(--text)', fontSize: 13, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </nav>

        <div style={{
          maxWidth: 860, margin: '0 auto', padding: '32px 20px',
          display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24, alignItems: 'start',
        }}>

          {/* ── Sidebar ── */}
          <div style={{
            background: 'var(--card)',
            borderRadius: 14, border: '1px solid var(--border)',
            padding: '10px', position: 'sticky', top: 24,
            boxShadow: '0 2px 12px rgba(184,122,20,.07)',
          }}>
            {/* Avatar + name */}
            <div style={{ textAlign:'center', padding:'16px 8px 20px' }}>
              <div style={{
                width: 54, height: 54, borderRadius: '50%',
                background: 'var(--avatar-bg)',
                border: '2px solid var(--avatar-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 10px', fontSize: 20, fontWeight: 700,
                color: '#B87A14',
              }}>
                {userInitial}
              </div>
              <p style={{ fontSize:13, fontWeight:700, color:'var(--text)', margin:'0 0 2px' }}>
                {name || session?.user?.name}
              </p>
              <p style={{ fontSize:11, color:'var(--text-3)', margin:0 }}>
                {session?.user?.email}
              </p>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`tab-btn${tab === t.id ? ' active' : ''}`}>
                  <span style={{ fontSize:15 }}>{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>

            <div style={{ borderTop:'1px solid var(--border)', marginTop:10, paddingTop:10 }}>
              <button
                onClick={() => signOut({ callbackUrl:'/' })}
                className="tab-btn"
                style={{ color:'var(--danger)' }}
              >
                <span style={{ fontSize:15 }}>🚪</span> Log out
              </button>
            </div>
          </div>

          {/* ── Content panel ── */}
          <div style={{
            background: 'var(--card)',
            borderRadius: 14, border: '1px solid var(--border)',
            padding: '28px 30px',
            boxShadow: '0 2px 12px rgba(184,122,20,.07)',
          }}>

            {/* ══ PROFILE ══ */}
            {tab === 'profile' && (
              <div>
                <SectionTitle>Profile information</SectionTitle>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
                  <div>
                    <label className="field-label">Full name</label>
                    <input className="settings-input" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
                  </div>
                  <div>
                    <label className="field-label">Stage name</label>
                    <input className="settings-input" value={stageName} onChange={e => setStageName(e.target.value)} placeholder="e.g. King Saha" />
                  </div>
                </div>

                <div style={{ marginBottom:20 }}>
                  <label className="field-label">Email</label>
                  <input className="settings-input" value={session?.user?.email || ''} disabled />
                  <p style={{ fontSize:11, color:'var(--text-3)', marginTop:4 }}>Email cannot be changed.</p>
                </div>

                <div style={{ marginBottom:20 }}>
                  <label className="field-label">Phone number</label>
                  <input className="settings-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+256 7XX XXX XXX" />
                  <p style={{ fontSize:11, color:'var(--text-3)', marginTop:4 }}>Changing your phone updates your market automatically.</p>
                </div>

                <div style={{ marginBottom:20 }}>
                  <label className="field-label">Primary genre</label>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginTop:2 }}>
                    {GENRES.map(g => (
                      <button key={g} onClick={() => setGenre(g)}
                        className={`pill-btn${genre === g ? ' selected' : ''}`}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom:28 }}>
                  <label className="field-label">Market</label>
                  <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginTop:2 }}>
                    {MARKETS.map(m => (
                      <button key={m} onClick={() => setMarket(m)}
                        className={`pill-btn${market === m ? ' selected' : ''}`}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <button className="save-btn" onClick={saveProfile} disabled={saving}>
                  {saving ? 'Saving…' : 'Save profile'}
                </button>
              </div>
            )}

            {/* ══ ACCOUNT ══ */}
            {tab === 'account' && (
              <div>
                <SectionTitle>Change password</SectionTitle>

                {isGoogleUser ? (
                  <div style={{
                    background: 'var(--section-bg)',
                    borderRadius: 10, border: '1px solid var(--border)',
                    padding: '15px 18px', marginBottom: 32,
                  }}>
                    <p style={{ fontSize:14, color:'var(--text-2)', margin:0, lineHeight:1.6 }}>
                      You signed in with Google. Password management is handled by your Google account.
                    </p>
                  </div>
                ) : (
                  <div style={{ marginBottom:32 }}>
                    <div style={{ display:'flex', flexDirection:'column', gap:14, marginBottom:20 }}>
                      {[
                        { label:'Current password',     val:currentPwd, set:setCurrentPwd, placeholder:'••••••••' },
                        { label:'New password',         val:newPwd,     set:setNewPwd,     placeholder:'At least 8 characters' },
                        { label:'Confirm new password', val:confirmPwd, set:setConfirmPwd, placeholder:'Repeat new password' },
                      ].map(f => (
                        <div key={f.label}>
                          <label className="field-label">{f.label}</label>
                          <input className="settings-input" type="password" value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.placeholder} />
                        </div>
                      ))}
                    </div>
                    <button className="save-btn" onClick={savePassword} disabled={saving}>
                      {saving ? 'Updating…' : 'Update password'}
                    </button>
                  </div>
                )}

                <div style={{ borderTop:'1px solid var(--border)', paddingTop:26 }}>
                  <SectionTitle>Danger zone</SectionTitle>
                  <div style={{
                    background: 'rgba(185,28,28,.04)',
                    borderRadius: 10, border: '1px solid rgba(185,28,28,.18)',
                    padding: '16px 18px',
                  }}>
                    <p style={{ fontSize:14, fontWeight:700, color:'var(--danger)', margin:'0 0 4px' }}>Delete account</p>
                    <p style={{ fontSize:13, color:'var(--text-2)', margin:'0 0 14px', lineHeight:1.6 }}>
                      This permanently deletes your account, all contract analyses, and your deal readiness data. This cannot be undone.
                    </p>
                    {!confirmDelete ? (
                      <button className="danger-btn" onClick={() => setConfirmDelete(true)}>Delete my account</button>
                    ) : (
                      <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
                        <p style={{ fontSize:13, color:'var(--danger)', margin:0, fontWeight:600 }}>Are you sure?</p>
                        <button className="danger-btn" onClick={deleteAccount}>Yes, delete everything</button>
                        <button onClick={() => setConfirmDelete(false)} style={{ background:'none', border:'none', fontSize:13, color:'var(--text-3)', cursor:'pointer' }}>Cancel</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ══ NOTIFICATIONS ══ */}
            {tab === 'notifications' && (
              <div>
                <SectionTitle>Email notifications</SectionTitle>

                {notifLoading ? (
                  <div style={{ display:'flex', alignItems:'center', gap:10, padding:'20px 0', color:'var(--text-3)', fontSize:13 }}>
                    <div style={{ width:15, height:15, border:'2px solid var(--border)', borderTopColor:'#B87A14', borderRadius:'50%', animation:'spin 0.75s linear infinite' }} />
                    Loading your preferences…
                    <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                  </div>
                ) : (
                  <div style={{ marginBottom:28 }}>
                    <SettingRow label="Analysis complete" hint="Email when your contract analysis is ready">
                      <Toggle checked={notifAnalysis} onChange={setNotifAnalysis} />
                    </SettingRow>
                    <SettingRow label="Weekly deal tips" hint="Contract negotiation tips every week">
                      <Toggle checked={notifTips} onChange={setNotifTips} />
                    </SettingRow>
                    <SettingRow label="Label news" hint="Updates when labels have new opportunities">
                      <Toggle checked={notifLabelNews} onChange={setNotifLabelNews} />
                    </SettingRow>
                    <SettingRow label="Product updates & marketing" hint="New FairSign features and promotions">
                      <Toggle checked={notifMarketing} onChange={setNotifMarketing} />
                    </SettingRow>
                  </div>
                )}

                <div style={{ display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
                  <button className="save-btn" onClick={saveNotifications} disabled={saving || notifLoading}>
                    {saving ? 'Saving…' : 'Save preferences'}
                  </button>
                  <p style={{ fontSize:12, color:'var(--text-3)', margin:0 }}>
                    Your preferences are saved per account and restored on every login.
                  </p>
                </div>
              </div>
            )}

            {/* ══ APPEARANCE ══ */}
            {tab === 'appearance' && (
              <div>
                <SectionTitle>Theme</SectionTitle>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:32 }}>
                  {(['light', 'dark'] as Theme[]).map(t => (
                    <button
                      key={t}
                      onClick={() => applyTheme(t)}
                      className={`theme-card${theme === t ? ' selected' : ''}`}
                      style={{
                        border: `2px solid ${theme === t ? '#B87A14' : '#e8e0d0'}`,
                        background: t === 'light' ? '#FEFCF8' : '#1a1108',
                      }}
                    >
                      {/* Mini mockup preview */}
                      <div style={{ marginBottom:12 }}>
                        <div style={{ height:7, borderRadius:3, background: t === 'light' ? '#B87A14' : '#3a2808', marginBottom:5, width:'52%' }} />
                        <div style={{ height:4, borderRadius:2, background: t === 'light' ? '#e8e0d0' : '#3a2808', marginBottom:4 }} />
                        <div style={{ height:4, borderRadius:2, background: t === 'light' ? '#e8e0d0' : '#3a2808', width:'72%' }} />
                        <div style={{ marginTop:9, height:22, borderRadius:6, background: t === 'light' ? '#fff' : '#221608', border:`1px solid ${t === 'light' ? '#e8e0d0' : '#3a2808'}` }} />
                      </div>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        <div>
                          <p style={{ fontSize:13, fontWeight:700, color: t === 'light' ? '#7A4F0A' : '#f5c96a', margin:'0 0 2px' }}>
                            {t === 'light' ? '☀️ Light' : '🌙 Dark'}
                          </p>
                          <p style={{ fontSize:11, color: t === 'light' ? '#a07840' : '#8a6a30', margin:0 }}>
                            {t === 'light' ? 'Classic clean look' : 'Easy on the eyes'}
                          </p>
                        </div>
                        {theme === t && (
                          <div style={{ width:20, height:20, borderRadius:'50%', background:'#B87A14', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'#fff', fontWeight:700 }}>✓</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <SectionTitle>Display</SectionTitle>
                <SettingRow label="Compact mode" hint="Reduce spacing and padding throughout the app">
                  <Toggle checked={false} onChange={() => {}} />
                </SettingRow>
                <SettingRow label="Reduce animations" hint="Disable transitions and motion effects">
                  <Toggle checked={false} onChange={() => {}} />
                </SettingRow>

                <div style={{ marginTop:22, padding:'13px 16px', background:'var(--section-bg)', borderRadius:10, border:'1px solid var(--border)' }}>
                  <p style={{ fontSize:12, color:'var(--text-3)', margin:0, lineHeight:1.6 }}>
                    Theme preference is saved to this browser and applies automatically on next login.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </>
  )
}
