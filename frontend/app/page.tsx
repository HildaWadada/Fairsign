'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function MarketingPage() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [faqOpen, setFaqOpen] = useState<number | null>(null)
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const FEATURES = [
    { icon: '🛡️', title: 'Red Flag Detector', desc: 'Spots perpetual master ownership, 360 deals, endless option periods before you sign.' },
    { icon: '⚖️', title: 'Deal Fairness Score', desc: 'Rates your deal 1–10 against real market benchmarks for Uganda, Nigeria, Kenya, and South Africa.' },
    { icon: '🌍', title: 'African Market Context', desc: 'Not generic advice. Benchmarks specific to UPRS, COSON, MCSK, and SAMRO standards.' },
    { icon: '💭', title: 'Ask Your Contract', desc: '"Do I own my masters?" or "Can I release independently?" chat with your document.' },
    { icon: '🤝', title: 'Negotiation Simulator', desc: 'Practice the actual negotiation with an AI label rep before you walk into the room.' },
    { icon: '🔤', title: 'Swahili · Pidgin · Luganda', desc: 'Understand your deal in the language you actually speak.' },
  ]

  const STEPS = [
    { n: '01', title: 'Upload your contract', desc: 'PDF, DOCX, or TXT. Takes 5 seconds.' },
    { n: '02', title: 'AI reads every clause', desc: 'Checks all terms against your local market standards.' },
    { n: '03', title: 'Get plain-language results', desc: 'Clear score, red flags, and actionable advice.' },
    { n: '04', title: 'Negotiate with confidence', desc: 'Practice, translate, share  all in one place.' },
  ]

  const FAQS = [
    { q: 'Is FairSign a replacement for a music lawyer?', a: 'No and we\'ll always say that. FairSign helps you understand your contract before you meet a lawyer, so you ask the right questions and don\'t get caught off guard. Think of it as preparation, not a substitute.' },
    { q: 'Which markets does FairSign cover?', a: 'Uganda, Nigeria, Kenya, and South Africa with benchmarks tied to UPRS, COSON, MCSK, and SAMRO respectively. More markets coming.' },
    { q: 'Is my contract data private?', a: 'Yes. Your uploaded contracts are never shared or used to train any model. They\'re processed and then discarded unless you explicitly save them to your history.' },
    { q: 'What file formats are supported?', a: 'PDF, DOCX, and TXT. If you have a scanned image contract, convert it to PDF first.' },
    { q: 'Does the free plan actually work?', a: 'Yes. The free tier gives you a real analysis deal score, top red flags, and a plain-English summary. Premium unlocks deeper breakdowns, negotiation tools, and history.' },
  ]

  const PLANS = [
    {
      key: 'free', label: 'Starter', price: 'Free', featured: false,
      desc: 'Understand your contract before signing',
      features: ['Upload & analyse contract', 'Basic deal score', 'Top 2–3 red flags', 'Plain English summary', 'WhatsApp sharing'],
      cta: 'Get started free',
    },
    {
      key: 'premium', label: 'Premium', price: billing === 'monthly' ? '$12/mo' : '$10/mo', featured: true,
      desc: 'Make smarter career decisions',
      features: ['Everything in Free', 'Full red flag analysis', 'Negotiation tips', 'Unlimited AI chat', 'Analysis history', 'Deal readiness score'],
      cta: 'Start Premium',
    },
    {
      key: 'pro', label: 'Pro', price: billing === 'monthly' ? '$29/mo' : '$23/mo', featured: false,
      desc: 'Turn FairSign into a career tool',
      features: ['Everything in Premium', 'Label matching', 'Promoter directory', 'Sponsorship pitch generator', 'Personalised AI insights'],
      cta: 'Go Pro',
    },
  ]

  return (
    <div style={{ background: '#f7f2e8', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: '#1a1108' }}>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .serif { font-family: 'Playfair Display', Georgia, serif; }
        .nav-link { font-size: 14px; color: #6b5a3e; text-decoration: none; cursor: pointer; background: none; border: none; font-family: inherit; transition: color .15s; }
        .nav-link:hover, .nav-link.active { color: #1a1108; font-weight: 600; }
        .btn-primary { display: inline-flex; align-items: center; gap: 10px; padding: 14px 28px; background: #b87d2a; color: #fff; border: none; border-radius: 100px; font-size: 15px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all .2s; text-decoration: none; }
        .btn-primary:hover { background: #a06a1f; transform: translateY(-1px); }
        .btn-ghost { display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; background: transparent; color: #1a1108; border: 1.5px solid rgba(26,17,8,.2); border-radius: 100px; font-size: 15px; font-weight: 500; cursor: pointer; font-family: inherit; transition: all .2s; text-decoration: none; }
        .btn-ghost:hover { border-color: rgba(26,17,8,.5); }
        .feature-card { background: #fff; border-radius: 20px; padding: 28px 24px; border: 1px solid rgba(184,125,42,.12); transition: all .2s; }
        .feature-card:hover { border-color: rgba(184,125,42,.35); transform: translateY(-3px); box-shadow: 0 12px 40px rgba(184,125,42,.08); }
        .plan-card { border-radius: 24px; padding: 32px 28px; display: flex; flex-direction: column; transition: transform .2s; }
        .plan-card:hover { transform: translateY(-4px); }
        .faq-btn { width: 100%; background: none; border: none; cursor: pointer; display: flex; align-items: center; justify-content: space-between; padding: 22px 0; text-align: left; gap: 16px; font-family: inherit; }
        .scroll-indicator { width: 44px; height: 44px; border-radius: 50%; background: #1a1108; display: flex; align-items: center; justify-content: center; cursor: pointer; border: none; margin: 0 auto; animation: bob 2s ease-in-out infinite; }
        @keyframes bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(6px)} }
        .check { width: 18px; height: 18px; border-radius: 50%; background: rgba(184,125,42,.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 10px; }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: scrolled ? 'rgba(247,242,232,.95)' : '#f7f2e8', backdropFilter: 'blur(8px)', borderBottom: scrolled ? '1px solid rgba(184,125,42,.15)' : '1px solid transparent', padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, transition: 'all .3s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#b87d2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#fff', fontFamily: "'Playfair Display', serif" }}>F</div>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#1a1108', letterSpacing: '-.01em' }}>FairSign</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <button className="nav-link" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>Contracts</button>
          <button className="nav-link" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>Pricing</button>
          <button className="nav-link" onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })}>FAQ</button>
          <button className="nav-link active" onClick={() => router.push('/login')}>Login</button>
        </div>

        <button className="btn-primary" onClick={() => router.push('/signup')} style={{ padding: '10px 22px', fontSize: 14 }}>
          Sign up
        </button>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight: '92vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '80px 24px 60px' }}>

        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 20px', borderRadius: 100, border: '1.5px solid rgba(184,125,42,.35)', marginBottom: 36, fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', color: '#8a5e1a', textTransform: 'uppercase' }}>
          For the love of African music
        </div>

        {/* Headline */}
        <h1 className="serif" style={{ fontSize: 'clamp(44px,7vw,88px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-.02em', color: '#1a1108', marginBottom: 8, maxWidth: 700 }}>
          Know Every Clause.
        </h1>
        <h1 className="serif" style={{ fontSize: 'clamp(44px,7vw,88px)', fontWeight: 700, fontStyle: 'italic', lineHeight: 1.05, letterSpacing: '-.02em', color: '#b87d2a', marginBottom: 32, maxWidth: 700 }}>
          Own Your Creativity.
        </h1>

        <p style={{ fontSize: 17, color: '#6b5a3e', maxWidth: 480, lineHeight: 1.75, marginBottom: 44 }}>
          Upload any music contract and get plain-language analysis, red flags, and a deal score built for African artists.
        </p>

        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 72 }}>
          <button className="btn-primary" onClick={() => router.push('/signup')}>
            Create free account
            <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>↓</span>
          </button>
          <button className="btn-ghost" onClick={() => router.push('/login')}>
            Log in
          </button>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div style={{ background: '#1a1108', padding: '32px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: '40px 64px', flexWrap: 'wrap' }}>
          {[{ n: '4', label: 'African markets' }, { n: '8', label: 'Analysis features' }, { n: '3', label: 'Local languages' }, { n: '10+', label: 'Red flag types detected' }].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div className="serif" style={{ fontSize: 36, fontWeight: 800, color: '#b87d2a', lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontSize: 13, color: 'rgba(247,242,232,.45)', marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features" style={{ maxWidth: 1040, margin: '0 auto', padding: '96px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#b87d2a', marginBottom: 14 }}>What FairSign does</p>
          <h2 className="serif" style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, color: '#1a1108', lineHeight: 1.15 }}>
            Everything you need.<br />Nothing you don't.
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {FEATURES.map(f => (
            <div key={f.title} className="feature-card">
              <div style={{ fontSize: 28, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a1108', marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: '#6b5a3e', lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: '#3b250e', padding: '96px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#b87d2a', marginBottom: 14 }}>How it works</p>
          <h2 className="serif" style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, color: '#f7f2e8', marginBottom: 60, lineHeight: 1.15 }}>
            Analysis in under 30 seconds.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 32 }}>
            {STEPS.map((s, i) => (
              <div key={s.n} style={{ textAlign: 'center' }}>
                <div className="serif" style={{ fontSize: 48, fontWeight: 800, color: 'rgba(184,125,42,.2)', lineHeight: 1, marginBottom: 16 }}>{s.n}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f7f2e8', marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: 'rgba(247,242,232,.45)', lineHeight: 1.65 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ maxWidth: 1000, margin: '0 auto', padding: '96px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#b87d2a', marginBottom: 14 }}>Pricing</p>
          <h2 className="serif" style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, color: '#1a1108', marginBottom: 24, lineHeight: 1.15 }}>Pick your plan</h2>

          <div style={{ display: 'inline-flex', borderRadius: 100, border: '1.5px solid rgba(184,125,42,.25)', overflow: 'hidden', background: '#fff' }}>
            {(['monthly', 'annual'] as const).map(b => (
              <button key={b} onClick={() => setBilling(b)} style={{ padding: '9px 22px', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: billing === b ? 700 : 400, background: billing === b ? '#1a1108' : 'transparent', color: billing === b ? '#f7f2e8' : '#6b5a3e', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit', transition: 'all .15s' }}>
                {b === 'monthly' ? 'Monthly' : 'Annual'}
                {b === 'annual' && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: '#b87d2a', color: '#fff' }}>−20%</span>}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {PLANS.map(plan => (
            <div key={plan.key} className="plan-card" style={{ background: plan.featured ? '#1a1108' : '#fff', border: plan.featured ? '2px solid #b87d2a' : '1px solid rgba(184,125,42,.15)', position: 'relative' }}>
              {plan.featured && (
                <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', fontSize: 11, fontWeight: 700, padding: '3px 14px', borderRadius: 20, background: '#b87d2a', color: '#fff', whiteSpace: 'nowrap' }}>
                  Most popular
                </div>
              )}
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: plan.featured ? '#b87d2a' : '#8a6a3a', marginBottom: 10 }}>{plan.label}</p>
              <div className="serif" style={{ fontSize: 36, fontWeight: 800, color: plan.featured ? '#f7f2e8' : '#1a1108', marginBottom: 8 }}>{plan.price}</div>
              <p style={{ fontSize: 13, color: plan.featured ? 'rgba(247,242,232,.5)' : '#8a6a3a', marginBottom: 24, lineHeight: 1.5 }}>{plan.desc}</p>

              <div style={{ borderTop: `1px solid ${plan.featured ? 'rgba(255,255,255,.08)' : 'rgba(184,125,42,.1)'}`, paddingTop: 20, marginBottom: 24, flex: 1 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                    <div className="check" style={{ background: plan.featured ? 'rgba(184,125,42,.2)' : 'rgba(184,125,42,.1)', color: '#b87d2a', marginTop: 1 }}>✓</div>
                    <span style={{ fontSize: 13, color: plan.featured ? 'rgba(247,242,232,.8)' : '#3d2e1a', lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => router.push(plan.key === 'free' ? '/signup' : `/signup?plan=${plan.key}`)}
                style={{ width: '100%', padding: '13px', borderRadius: 100, border: plan.featured ? 'none' : '1.5px solid rgba(184,125,42,.3)', background: plan.featured ? '#b87d2a' : 'transparent', color: plan.featured ? '#fff' : '#1a1108', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s' }}
              >
                {plan.cta} →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ background: '#1a1108', padding: '96px 24px' }}>
        <div style={{ maxWidth: 660, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#b87d2a', marginBottom: 14 }}>FAQ</p>
            <h2 className="serif" style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 800, color: '#f7f2e8', lineHeight: 1.15 }}>Common questions</h2>
          </div>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ borderBottom: '1px solid rgba(247,242,232,.08)' }}>
              <button className="faq-btn" onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#f7f2e8', lineHeight: 1.5 }}>{faq.q}</span>
                <span style={{ fontSize: 18, color: '#b87d2a', flexShrink: 0, transform: faqOpen === i ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>+</span>
              </button>
              {faqOpen === i && (
                <p style={{ fontSize: 14, color: 'rgba(247,242,232,.55)', lineHeight: 1.75, paddingBottom: 20 }}>{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: '96px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#b87d2a', marginBottom: 20 }}>Get started today</p>
        <h2 className="serif" style={{ fontSize: 'clamp(32px,5vw,64px)', fontWeight: 800, color: '#1a1108', marginBottom: 16, lineHeight: 1.1, maxWidth: 640, margin: '0 auto 20px' }}>
          Your contract is waiting.
        </h2>
        <p style={{ fontSize: 16, color: '#6b5a3e', maxWidth: 400, margin: '0 auto 40px', lineHeight: 1.7 }}>
          Sign up in 30 seconds. Upload your deal. Get answers.
        </p>
        <button className="btn-primary" onClick={() => router.push('/signup')} style={{ fontSize: 16, padding: '16px 40px' }}>
          Analyse your contract 
        </button>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#120d06', padding: '28px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: '#b87d2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff', fontFamily: "'Playfair Display', serif" }}>F</div>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(247,242,232,.4)' }}>FairSign</span>
        </div>
        <p style={{ fontSize: 11, color: 'rgba(247,242,232,.2)' }}>© 2026 FairSign · Always consult a qualified music attorney before signing.</p>
      </footer>
    </div>
  )
}
