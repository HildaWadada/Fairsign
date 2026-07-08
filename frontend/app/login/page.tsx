'use client'
import { useState, useEffect, Suspense } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import InstrumentCarousel from '@/components/InstrumentCarousel'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'authenticated') router.push('/dashboard')
  }, [status, router])

  const urlError = searchParams.get('error')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await signIn('credentials', { email, password, redirect: false })
      if (res?.error) setError('Invalid email or password.')
      else router.push('/dashboard')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') return null

  return (
    <>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=Inter:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; font-family: 'Inter', sans-serif; }

        /*
          Single gradient across the entire page — no border, no split.
          Left: rich warm brown/amber dark (#2C1A06)
          Centre blend: mid amber (#7A4F0A range)
          Right: cream (#FEFCF8)
        */
        .login-root {
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
        .login-left {
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        /* Carousel — masked so it dissolves into the gradient blend zone */
        .carousel-wrap {
          position: absolute;
          inset: 0;
          -webkit-mask-image: linear-gradient(to right, black 40%, transparent 88%);
          mask-image: linear-gradient(to right, black 40%, transparent 88%);
          opacity: 0.55;
        }

        /* Darkening vignette so left-side text stays crisp */
        .left-vignette {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(to right, rgba(30,18,6,0.70) 0%, rgba(30,18,6,0.20) 70%, transparent 100%),
            radial-gradient(ellipse at 20% 85%, rgba(30,18,6,0.50) 0%, transparent 60%);
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
          pointer-events: none;
        }
        .left-overlay a, .left-overlay button { pointer-events: all; }

        /* Logo */
        .logo-mark { display: inline-flex; align-items: center; gap: 10px; text-decoration: none; }
        .logo-box {
          width: 36px; height: 36px;
          background: #B87A14;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Playfair Display', serif;
          font-weight: 700; font-size: 18px; color: #FEFCF8;
          box-shadow: 0 2px 14px rgba(184,122,20,0.40);
        }
        .logo-text { font-weight: 700; font-size: 17px; color: #FEFCF8; letter-spacing: -0.01em; }

        /* Left headline */
        .left-headline { padding-bottom: 60px; }
        .left-eyebrow {
          font-size: 10.5px; font-weight: 700; letter-spacing: 0.14em;
          text-transform: uppercase; color: #FEF3DC; margin-bottom: 18px;
          opacity: 0.85;
        }
        .left-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(28px, 2.6vw, 40px);
          font-weight: 700; line-height: 1.14;
          color: #FEFCF8;
          margin-bottom: 16px;
          text-shadow: 0 2px 24px rgba(30,18,6,0.90);
        }
        .left-title em { font-style: italic; color: #FEF3DC; }
        .left-body {
          font-size: 14px; line-height: 1.68;
          color: rgba(254,252,248,0.60);
          max-width: 320px;
          text-shadow: 0 1px 16px rgba(30,18,6,0.85);
        }
        .left-stats { display: flex; gap: 28px; margin-top: 28px; }
        .stat-number {
          font-family: 'Playfair Display', serif;
          font-size: 24px; font-weight: 700;
          color: #FEF3DC; line-height: 1;
          text-shadow: 0 2px 12px rgba(30,18,6,0.80);
        }
        .stat-label { font-size: 11px; color: rgba(254,252,248,0.40); margin-top: 4px; }

        /* ── Right panel ── */
        .login-right {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 56px;
          position: relative;
        }

        /* Gentle cream wash so the form reads cleanly on the lighter side of gradient */
        .login-right::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to right,
            transparent 0%,
            rgba(254,252,248,0.30) 25%,
            rgba(254,252,248,0.65) 55%,
            rgba(254,252,248,0.88) 100%
          );
          pointer-events: none;
        }

        /* Form card */
        .login-card { width: 100%; max-width: 400px; position: relative; z-index: 1; }

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
          font-family: 'Playfair Display', serif;
          font-size: 26px; font-weight: 700;
          color: #1A1208; margin-bottom: 5px;
        }
        .card-sub { font-size: 13.5px; color: rgba(26,18,8,0.50); margin-bottom: 26px; }
        .card-sub a { color: #B87A14; text-decoration: none; font-weight: 600; }
        .card-sub a:hover { text-decoration: underline; }

        .error-banner {
          background: rgba(184,122,20,0.10);
          border: 1px solid rgba(184,122,20,0.28);
          border-radius: 8px; padding: 11px 14px;
          font-size: 13px; color: #7A4F0A; margin-bottom: 18px;
        }

        /* Google button */
        .btn-google {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px;
          padding: 12px 20px; border-radius: 10px;
          border: 1.5px solid rgba(26,18,8,0.13);
          background: rgba(255,255,255,0.80);
          color: #1A1208; font-size: 14px; font-weight: 500;
          cursor: pointer; transition: all 0.18s; font-family: 'Inter', sans-serif;
        }
        .btn-google:hover {
          border-color: #B87A14;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(184,122,20,0.10);
        }

        /* Divider */
        .divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; }
        .divider-line { flex: 1; height: 1px; background: rgba(26,18,8,0.09); }
        .divider-text {
          font-size: 11px; color: rgba(26,18,8,0.32);
          font-weight: 600; letter-spacing: 0.06em;
        }

        /* Fields */
        .field { margin-bottom: 14px; }
        .field label {
          display: block; font-size: 12.5px; font-weight: 600;
          color: rgba(26,18,8,0.58); margin-bottom: 5px;
        }
        .field input {
          width: 100%; padding: 11px 14px; border-radius: 9px;
          border: 1.5px solid rgba(26,18,8,0.12);
          background: rgba(255,255,255,0.72);
          color: #1A1208; font-size: 14px; font-family: 'Inter', sans-serif;
          outline: none; transition: all 0.18s;
        }
        .field input:focus {
          border-color: #B87A14;
          background: rgba(255,255,255,0.96);
          box-shadow: 0 0 0 3px rgba(184,122,20,0.09);
        }
        .field input::placeholder { color: rgba(26,18,8,0.26); }

        .forgot-row { display: flex; justify-content: flex-end; margin-top: -6px; margin-bottom: 18px; }
        .forgot-row a { font-size: 12.5px; color: #B87A14; text-decoration: none; font-weight: 600; }
        .forgot-row a:hover { text-decoration: underline; }

        /* Submit */
        .btn-submit {
          width: 100%; padding: 13px 20px; border-radius: 10px; border: none;
          background: #B87A14; color: #FEFCF8;
          font-size: 14px; font-weight: 700; cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: background 0.18s, box-shadow 0.18s;
          letter-spacing: 0.01em;
        }
        .btn-submit:hover:not(:disabled) {
          background: #9B6610;
          box-shadow: 0 4px 18px rgba(184,122,20,0.30);
        }
        .btn-submit:disabled { opacity: 0.50; cursor: not-allowed; }

        /* Mobile */
        @media (max-width: 768px) {
          .login-root { grid-template-columns: 1fr; background: #2C1A06; }
          .login-left { display: none; }
          .login-right { padding: 56px 24px 32px; align-items: flex-start; }
          .login-right::before { display: none; }
          .form-surface {
            background: rgba(254,252,248,0.07);
            border-color: rgba(254,252,248,0.12);
            backdrop-filter: none;
            box-shadow: none;
          }
          .card-heading { color: #FEFCF8; }
          .card-sub { color: rgba(254,252,248,0.45); }
          .btn-google {
            background: rgba(254,252,248,0.08);
            border-color: rgba(254,252,248,0.16);
            color: #FEFCF8;
          }
          .divider-line { background: rgba(254,252,248,0.10); }
          .divider-text { color: rgba(254,252,248,0.28); }
          .field label { color: rgba(254,252,248,0.55); }
          .field input {
            background: rgba(254,252,248,0.08);
            border-color: rgba(254,252,248,0.14);
            color: #FEFCF8;
          }
          .field input::placeholder { color: rgba(254,252,248,0.22); }
          .btn-submit { background: #B87A14; color: #FEFCF8; }
        }
      `}</style>

      <div className="login-root">

        {/* ── Left ── */}
        <div className="login-left">
          <div className="carousel-wrap">
            <InstrumentCarousel />
          </div>
          <div className="left-vignette" />
          <div className="left-overlay">
            <a href="/" className="logo-mark">
              <div className="logo-box">F</div>
              <span className="logo-text">FairSign</span>
            </a>
            <div className="left-headline">
              <p className="left-eyebrow">Protect your sound</p>
              <h1 className="left-title">
                Know every clause.<br />
                <em>Own your creativity.</em>
              </h1>
              <p className="left-body">
                Upload any music contract and FairSign breaks it down red flags, deal score, negotiation tips in plain language built for artists.
              </p>
              <div className="left-stats">
                <div>
                  <div className="stat-number">5+</div>
                  <div className="stat-label">Contracts analysed</div>
                </div>
                <div>
                  <div className="stat-number">70%</div>
                  <div className="stat-label">Red flags caught</div>
                </div>
                <div>
                  <div className="stat-number">4</div>
                  <div className="stat-label">African markets</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right ── */}
        <div className="login-right">
          <div className="login-card">
            <div className="form-surface">
              <h2 className="card-heading">Welcome back</h2>
              <p className="card-sub">No account yet? <a href="/signup">Sign up free</a></p>

              {urlError === 'AccountExistsWithEmail' && (
                <div className="error-banner">
                  An account with this email already exists. Please sign in with your email and password.
                </div>
              )}
              {error && <div className="error-banner">{error}</div>}

              <button
                className="btn-google"
                onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                type="button"
              >
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

              <form onSubmit={handleLogin}>
                <div className="field">
                  <label htmlFor="email">Email address</label>
                  <input
                    id="email" type="email" placeholder="you@example.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                    required autoComplete="email"
                  />
                </div>
                <div className="field">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password" type="password" placeholder="Your password"
                    value={password} onChange={e => setPassword(e.target.value)}
                    required autoComplete="current-password"
                  />
                </div>
                <div className="forgot-row">
                  <a href="/forgot-password">Forgot password?</a>
                </div>
                <button className="btn-submit" type="submit" disabled={loading}>
                  {loading ? 'Signing in…' : 'Sign in'}
                </button>
              </form>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>
}
