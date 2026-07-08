'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import InstrumentCarousel from '@/components/InstrumentCarousel'

const PHONE_MARKETS = [
  { code: '+256', flag: '🇺🇬', label: 'Uganda',       market: 'Uganda',       digits: 9  },
  { code: '+234', flag: '🇳🇬', label: 'Nigeria',      market: 'Nigeria',      digits: 10 },
  { code: '+254', flag: '🇰🇪', label: 'Kenya',        market: 'Kenya',        digits: 9  },
  { code: '+27',  flag: '🇿🇦', label: 'South Africa', market: 'South Africa', digits: 9  },
]

export default function SignupPage() {
  const router = useRouter()
  const [name,            setName]            = useState('')
  const [email,           setEmail]           = useState('')
  const [password,        setPassword]        = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [selectedMarket,  setSelectedMarket]  = useState(PHONE_MARKETS[0])
  const [phoneLocal,      setPhoneLocal]      = useState('')
  const [loading,         setLoading]         = useState(false)
  const [error,           setError]           = useState('')
  const [dropdownOpen,    setDropdownOpen]    = useState(false)

  const handleGoogle = () => signIn('google', { callbackUrl: '/dashboard' })

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) { setError('Passwords do not match.'); return }
    if (phoneLocal.length !== selectedMarket.digits) {
      setError(`Enter a valid ${selectedMarket.digits}-digit number for ${selectedMarket.label}.`); return
    }
    setLoading(true)
    try {
      const phone = `${selectedMarket.code}${phoneLocal}`
      await axios.post('http://localhost:8000/api/auth/signup', { name, email, password, phone, market: selectedMarket.market })
      const res = await signIn('credentials', { email, password, redirect: false })
      if (res?.error) { setError('Account created but sign-in failed. Please log in.'); router.push('/login') }
      else router.push('/onboarding')
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Something went wrong. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=Inter:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; font-family: 'Inter', sans-serif; }

        /*
          Single seamless gradient — no border, no split line.
          Deep warm brown (left) → amber gold (centre) → cream (right)
        */
        .signup-root {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: linear-gradient(
            105deg,
            #1E1206 0%,
            #2C1A06 18%,
            #4A2E0A 34%,
            #7A4F0A 46%,
            #B87A14 54%,
            #D4A054 62%,
            #EDD8A8 72%,
            #F5EDD6 82%,
            #FEFCF8 100%
          );
        }

        /* ── Left panel ── */
        .signup-left {
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        /* Carousel — dissolves before the blend centre */
        .carousel-wrap {
          position: absolute;
          inset: 0;
          -webkit-mask-image: linear-gradient(to right, black 40%, transparent 88%);
          mask-image: linear-gradient(to right, black 40%, transparent 88%);
          opacity: 0.52;
        }

        /* Warm dark vignette so text stays readable */
        .left-vignette {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(to right, rgba(30,18,6,0.72) 0%, rgba(30,18,6,0.22) 70%, transparent 100%),
            radial-gradient(ellipse at 18% 90%, rgba(30,18,6,0.50) 0%, transparent 58%),
            radial-gradient(ellipse at 10% 10%, rgba(30,18,6,0.32) 0%, transparent 52%);
          pointer-events: none;
          z-index: 1;
        }

        .left-overlay {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px 52px;
          height: 100%;
        }

        /* Logo */
        .logo-mark { display: inline-flex; align-items: center; gap: 10px; text-decoration: none; }
        .logo-box {
          width: 36px; height: 36px; background: #B87A14; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Playfair Display', serif; font-weight: 700; font-size: 18px; color: #FEFCF8;
          box-shadow: 0 2px 14px rgba(184,122,20,0.40); flex-shrink: 0;
        }
        .logo-text { font-weight: 700; font-size: 17px; color: #FEFCF8; letter-spacing: -0.01em; }

        /* Left body */
        .left-body-wrap {
          flex: 1; display: flex; flex-direction: column; justify-content: center; padding-bottom: 28px;
        }
        .left-eyebrow {
          font-size: 10.5px; font-weight: 700; letter-spacing: 0.14em;
          text-transform: uppercase; color: #FEF3DC; margin-bottom: 18px; opacity: 0.85;
        }
        .left-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(28px, 2.6vw, 40px);
          font-weight: 700; line-height: 1.14; color: #FEFCF8; margin-bottom: 16px;
          text-shadow: 0 2px 26px rgba(30,18,6,0.92);
        }
        .left-title em { font-style: italic; color: #FEF3DC; }
        .left-desc {
          font-size: 14px; line-height: 1.68; color: rgba(254,252,248,0.58);
          max-width: 320px; margin-bottom: 32px;
          text-shadow: 0 1px 16px rgba(30,18,6,0.88);
        }

        /* Benefits */
        .benefits-list { list-style: none; display: flex; flex-direction: column; gap: 13px; }
        .benefits-list li {
          display: flex; align-items: flex-start; gap: 12px;
          font-size: 13.5px; color: rgba(254,252,248,0.62); line-height: 1.5;
          text-shadow: 0 1px 12px rgba(30,18,6,0.80);
        }
        .benefit-dot {
          width: 20px; height: 20px; border-radius: 50%;
          background: rgba(184,122,20,0.20); border: 1px solid rgba(184,122,20,0.40);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; margin-top: 1px;
        }
        .benefit-dot svg { display: block; }

        /* ── Right panel ── */
        .signup-right {
          display: flex; align-items: center; justify-content: center;
          padding: 48px 56px; overflow-y: auto; position: relative;
        }

        /* Cream wash on right so form is legible */
        .signup-right::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(
            to right,
            transparent 0%,
            rgba(254,252,248,0.28) 22%,
            rgba(254,252,248,0.62) 52%,
            rgba(254,252,248,0.86) 100%
          );
          pointer-events: none;
        }

        .signup-card {
          width: 100%; max-width: 420px;
          position: relative; z-index: 1;
        }

        /* Frosted glass form surface */
        .form-surface {
          background: rgba(254,252,248,0.80);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(254,252,248,0.55);
          border-radius: 20px;
          padding: 32px 28px;
          box-shadow:
            0 4px 40px rgba(122,79,10,0.10),
            0 1px 0 rgba(255,255,255,0.70) inset;
        }

        .card-heading {
          font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 700;
          color: #1A1208; margin-bottom: 5px;
        }
        .card-sub { font-size: 13.5px; color: rgba(26,18,8,0.50); margin-bottom: 24px; }
        .card-sub a { color: #B87A14; text-decoration: none; font-weight: 600; }
        .card-sub a:hover { text-decoration: underline; }

        .error-banner {
          background: rgba(184,122,20,0.10); border: 1px solid rgba(184,122,20,0.28);
          border-radius: 8px; padding: 11px 14px; font-size: 13px;
          color: #7A4F0A; margin-bottom: 18px;
        }

        /* Google */
        .btn-google {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px;
          padding: 12px 20px; border-radius: 10px; border: 1.5px solid rgba(26,18,8,0.13);
          background: rgba(255,255,255,0.82); color: #1A1208; font-size: 14px; font-weight: 500;
          cursor: pointer; transition: all 0.18s; font-family: 'Inter', sans-serif;
        }
        .btn-google:hover { border-color: #B87A14; background: #fff; box-shadow: 0 0 0 3px rgba(184,122,20,0.10); }

        .divider { display: flex; align-items: center; gap: 12px; margin: 18px 0; }
        .divider-line { flex: 1; height: 1px; background: rgba(26,18,8,0.09); }
        .divider-text { font-size: 11px; color: rgba(26,18,8,0.32); font-weight: 600; letter-spacing: 0.06em; }

        /* Fields */
        .field { margin-bottom: 13px; }
        .field label {
          display: block; font-size: 12.5px; font-weight: 600;
          color: rgba(26,18,8,0.58); margin-bottom: 5px;
        }
        .field input {
          width: 100%; padding: 11px 14px; border-radius: 9px;
          border: 1.5px solid rgba(26,18,8,0.12); background: rgba(255,255,255,0.72);
          color: #1A1208; font-size: 14px; font-family: 'Inter', sans-serif;
          outline: none; transition: all 0.18s;
        }
        .field input:focus {
          border-color: #B87A14; background: rgba(255,255,255,0.96);
          box-shadow: 0 0 0 3px rgba(184,122,20,0.09);
        }
        .field input::placeholder { color: rgba(26,18,8,0.26); }

        /* Phone */
        .phone-row { display: flex; gap: 8px; }
        .phone-dropdown-wrap { position: relative; }
        .phone-dropdown-btn {
          display: flex; align-items: center; gap: 6px; padding: 11px 12px;
          border-radius: 9px; border: 1.5px solid rgba(26,18,8,0.12);
          background: rgba(255,255,255,0.72); color: #1A1208; font-size: 14px;
          font-family: 'Inter', sans-serif; cursor: pointer; white-space: nowrap; transition: all 0.18s;
        }
        .phone-dropdown-btn:hover { border-color: #B87A14; }
        .phone-dropdown-menu {
          position: absolute; top: calc(100% + 4px); left: 0;
          background: #fff; border: 1.5px solid rgba(26,18,8,0.12); border-radius: 10px;
          overflow: hidden; z-index: 50; min-width: 200px;
          box-shadow: 0 8px 24px rgba(122,79,10,0.14);
        }
        .phone-option {
          display: flex; align-items: center; gap: 10px; padding: 11px 14px;
          font-size: 14px; color: #1A1208; cursor: pointer; transition: background 0.15s;
        }
        .phone-option:hover  { background: #FEF3DC; }
        .phone-option.active { background: #FEF3DC; font-weight: 600; }
        .phone-input-field {
          flex: 1; padding: 11px 14px; border-radius: 9px;
          border: 1.5px solid rgba(26,18,8,0.12); background: rgba(255,255,255,0.72);
          color: #1A1208; font-size: 14px; font-family: 'Inter', sans-serif;
          outline: none; transition: all 0.18s;
        }
        .phone-input-field:focus {
          border-color: #B87A14; background: rgba(255,255,255,0.96);
          box-shadow: 0 0 0 3px rgba(184,122,20,0.09);
        }
        .phone-input-field::placeholder { color: rgba(26,18,8,0.26); }

        .market-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 10px; border-radius: 20px; background: #FEF3DC;
          border: 1px solid rgba(184,122,20,0.28); font-size: 12px;
          font-weight: 600; color: #7A4F0A; margin-top: 8px;
        }

        /* Submit */
        .btn-submit {
          width: 100%; padding: 13px 20px; border-radius: 10px; border: none;
          background: #B87A14; color: #FEFCF8; font-size: 14px; font-weight: 700;
          cursor: pointer; font-family: 'Inter', sans-serif;
          transition: background 0.18s, box-shadow 0.18s; letter-spacing: 0.01em; margin-top: 6px;
        }
        .btn-submit:hover:not(:disabled) { background: #9B6610; box-shadow: 0 4px 18px rgba(184,122,20,0.30); }
        .btn-submit:disabled { opacity: 0.50; cursor: not-allowed; }

        .terms-note { font-size: 12px; color: rgba(26,18,8,0.38); text-align: center; margin-top: 14px; line-height: 1.5; }
        .terms-note a { color: #B87A14; text-decoration: none; }
        .terms-note a:hover { text-decoration: underline; }

        /* Mobile */
        @media (max-width: 768px) {
          .signup-root { grid-template-columns: 1fr; background: #2C1A06; }
          .signup-left { display: none; }
          .signup-right { padding: 56px 24px 32px; align-items: flex-start; }
          .signup-right::before { display: none; }
          .form-surface {
            background: rgba(254,252,248,0.07); border-color: rgba(254,252,248,0.12);
            backdrop-filter: none; box-shadow: none;
          }
          .card-heading { color: #FEFCF8; }
          .card-sub { color: rgba(254,252,248,0.45); }
          .btn-google { background: rgba(254,252,248,0.08); border-color: rgba(254,252,248,0.16); color: #FEFCF8; }
          .divider-line { background: rgba(254,252,248,0.10); }
          .divider-text { color: rgba(254,252,248,0.28); }
          .field label { color: rgba(254,252,248,0.55); }
          .field input { background: rgba(254,252,248,0.08); border-color: rgba(254,252,248,0.14); color: #FEFCF8; }
          .field input::placeholder { color: rgba(254,252,248,0.22); }
          .phone-dropdown-btn { background: rgba(254,252,248,0.08); border-color: rgba(254,252,248,0.14); color: #FEFCF8; }
          .phone-dropdown-menu { background: #3A2008; border-color: rgba(254,252,248,0.14); }
          .phone-option { color: #FEFCF8; }
          .phone-option:hover, .phone-option.active { background: rgba(184,122,20,0.20); }
          .phone-input-field { background: rgba(254,252,248,0.08); border-color: rgba(254,252,248,0.14); color: #FEFCF8; }
          .phone-input-field::placeholder { color: rgba(254,252,248,0.22); }
          .btn-submit { background: #B87A14; color: #FEFCF8; }
          .error-banner { background: rgba(184,122,20,0.15); color: #FEF3DC; border-color: rgba(184,122,20,0.30); }
          .terms-note { color: rgba(254,252,248,0.32); }
        }
      `}</style>

      <div className="signup-root">

        {/* ── Left: carousel + content ── */}
        <div className="signup-left">
          <div className="carousel-wrap">
            <InstrumentCarousel />
          </div>
          <div className="left-vignette" />
          <div className="left-overlay">
            <a href="/" className="logo-mark">
              <div className="logo-box">F</div>
              <span className="logo-text">FairSign</span>
            </a>

            <div className="left-body-wrap">
              <p className="left-eyebrow">Join FairSign</p>
              <h1 className="left-title">
                Your contract,<br />
                <em>your terms.</em>
              </h1>
              <p className="left-desc">
                Built for African artists who want to understand what they're signing before they sign it.
              </p>
              <ul className="benefits-list">
                {[
                  'Instant contract analysis with plain-language breakdowns',
                  'Deal score that tells you how fair the offer really is',
                  'Negotiation tips tailored to your market',
                  'Label matching based on your sound and numbers',
                ].map((benefit, i) => (
                  <li key={i}>
                    <span className="benefit-dot">
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4l2.5 2.5L9 1" stroke="#B87A14" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ── Right: form ── */}
        <div className="signup-right">
          <div className="signup-card">
            <div className="form-surface">
              <h2 className="card-heading">Create your account</h2>
              <p className="card-sub">Already have one? <a href="/login">Sign in</a></p>

              {error && <div className="error-banner">{error}</div>}

              <button className="btn-google" onClick={handleGoogle} type="button">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                  <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <div className="divider">
                <div className="divider-line" />
                <span className="divider-text">OR</span>
                <div className="divider-line" />
              </div>

              <form onSubmit={handleSignup}>
                <div className="field">
                  <label htmlFor="name">Full name</label>
                  <input id="name" type="text" placeholder="Your name or stage name"
                    value={name} onChange={e => setName(e.target.value)} required autoComplete="name" />
                </div>

                <div className="field">
                  <label htmlFor="email">Email address</label>
                  <input id="email" type="email" placeholder="you@example.com"
                    value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
                </div>

                <div className="field">
                  <label>Phone number</label>
                  <div className="phone-row">
                    <div className="phone-dropdown-wrap">
                      <button type="button" className="phone-dropdown-btn" onClick={() => setDropdownOpen(o => !o)}>
                        <span>{selectedMarket.flag}</span>
                        <span>{selectedMarket.code}</span>
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      {dropdownOpen && (
                        <div className="phone-dropdown-menu">
                          {PHONE_MARKETS.map(m => (
                            <div key={m.code}
                              className={`phone-option ${m.code === selectedMarket.code ? 'active' : ''}`}
                              onClick={() => { setSelectedMarket(m); setDropdownOpen(false); setPhoneLocal('') }}>
                              <span>{m.flag}</span>
                              <span>{m.label}</span>
                              <span style={{ color: 'rgba(26,18,8,0.38)', marginLeft: 'auto', fontSize: 12 }}>{m.code}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <input
                      className="phone-input-field"
                      type="tel"
                      placeholder={`${'0'.repeat(selectedMarket.digits)} digits`}
                      value={phoneLocal}
                      onChange={e => setPhoneLocal(e.target.value.replace(/\D/g, '').slice(0, selectedMarket.digits))}
                      required
                    />
                  </div>
                  {phoneLocal.length === selectedMarket.digits && (
                    <div className="market-badge">
                      {selectedMarket.flag} Market set to {selectedMarket.market}
                    </div>
                  )}
                </div>

                <div className="field">
                  <label htmlFor="password">Password</label>
                  <input id="password" type="password" placeholder="At least 8 characters"
                    value={password} onChange={e => setPassword(e.target.value)}
                    required minLength={8} autoComplete="new-password" />
                </div>

                <div className="field">
                  <label htmlFor="confirm-password">Confirm password</label>
                  <input id="confirm-password" type="password" placeholder="Same password again"
                    value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    required autoComplete="new-password" />
                </div>

                <button className="btn-submit" type="submit" disabled={loading}>
                  {loading ? 'Creating account…' : 'Create account'}
                </button>

                <p className="terms-note">
                  By signing up you agree to our{' '}
                  <a href="/terms">Terms of Service</a> and{' '}
                  <a href="/privacy">Privacy Policy</a>.
                </p>
              </form>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}
