'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const CheckIcon = ({ color }: { color: string }) => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
    <circle cx="7.5" cy="7.5" r="7" stroke={color} strokeWidth="1" />
    <path d="M4.5 7.5l2 2 4-4" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const PLANS = [
  {
    key: 'free',
    label: 'Free',
    name: 'Starter',
    positioning: '"Understand your contract before signing"',
    monthlyPrice: 0,
    annualPrice: 0,
    featured: false,
    accentColor: 'rgba(249,245,236,.35)',
    checkColor: 'rgba(249,245,236,.45)',
    ctaLabel: 'Get started free →',
    sections: [
      {
        heading: 'Contract analysis',
        features: [
          'Upload & analyse contract',
          'Basic deal score (number only)',
          'Top 2–3 red flags',
          'Basic plain-English summary',
          'WhatsApp sharing',
          'AI chat (3–5 questions per analysis)',
        ],
      },
      {
        heading: 'Limits',
        features: ['1–2 analyses per day', 'File size limit applies'],
        muted: true,
      },
    ],
  },
  {
    key: 'premium',
    label: 'Premium',
    name: 'Serious Artist',
    positioning: '"Make smarter career decisions, avoid bad deals"',
    monthlyPrice: 12,
    annualPrice: 10,
    featured: true,
    accentColor: '#c9922a',
    checkColor: '#c9922a',
    ctaLabel: 'Upgrade to Premium →',
    sections: [
      {
        heading: 'Everything in Free, plus',
        features: [
          'Full red flag analysis (all clause types)',
          'Detailed deal score breakdown',
          'Full negotiation tips',
          'Unlimited AI chat',
          'Analysis history (saved contracts)',
          'Personalized, plain-language tone',
        ],
      },
      {
        heading: 'Career tools',
        features: [
          'Deal readiness score',
          'Basic promotion guide',
          'Basic label matching (limited results)',
        ],
      },
    ],
  },
  {
    key: 'pro',
    label: 'Pro',
    name: 'Career Builder',
    positioning: '"Turn FairSign into a full career tool"',
    monthlyPrice: 29,
    annualPrice: 23,
    featured: false,
    accentColor: '#4a9e72',
    checkColor: '#4a9e72',
    ctaLabel: 'Go Pro →',
    sections: [
      {
        heading: 'Everything in Premium, plus',
        features: [
          'Advanced label matching (high accuracy)',
          'Full promoter & venue directory',
          'Sponsorship pitch generator',
          'Full promotion toolkit (playlists, blogs, radio)',
          'Priority processing (faster analysis)',
        ],
      },
      {
        heading: 'Advanced AI (powered by ChromaDB)',
        features: [
          'Personalized insights based on your history',
          '"Based on your past deals…" AI',
          'Smarter negotiation strategies',
        ],
      },
      {
        heading: 'Coming soon',
        features: [
          'Direct label & promoter connections',
          'Collaboration matching',
          'Analytics dashboard',
        ],
        muted: true,
      },
    ],
  },
]

export default function PricingSection() {
  const router = useRouter()
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')

  const formatPrice = (plan: typeof PLANS[0]) => {
    const price = billing === 'monthly' ? plan.monthlyPrice : plan.annualPrice
    if (price === 0) return 'Free'
    return `$${price}/mo`
  }

  return (
    <div style={{ background: '#f7f3eb', padding: '80px 24px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#c9922a', marginBottom: 12 }}>
          Pricing
        </p>
        <h2 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 800, color: '#0a2316', margin: '0 0 12px' }}>
          Pick your plan
        </h2>
        <p style={{ fontSize: 16, color: '#6b6b6b', maxWidth: 460, margin: '0 auto 28px', lineHeight: 1.7 }}>
          Protect your music career — from your first contract to your biggest deal.
        </p>

        {/* Billing toggle */}
        <div style={{ display: 'inline-flex', borderRadius: 10, border: '1px solid #ddd8cc', overflow: 'hidden', background: '#fff' }}>
          {(['monthly', 'annual'] as const).map(b => (
            <button
              key={b}
              onClick={() => setBilling(b)}
              style={{
                padding: '8px 20px',
                fontSize: 13,
                fontWeight: billing === b ? 700 : 400,
                border: 'none',
                cursor: 'pointer',
                background: billing === b ? '#0a2316' : 'transparent',
                color: billing === b ? '#f9f5ec' : '#6b6b6b',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              {b === 'monthly' ? 'Monthly' : 'Annual'}
              {b === 'annual' && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: '#c9922a', color: '#fff', letterSpacing: 0.5 }}>
                  −20%
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, maxWidth: 960, margin: '0 auto 28px' }}>
        {PLANS.map(plan => (
          <div
            key={plan.key}
            style={{
              background: plan.featured ? '#0a2316' : '#fff',
              borderRadius: 16,
              border: plan.featured ? '2px solid #c9922a' : '1px solid #ede8dc',
              padding: '28px 24px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}
          >
            {plan.featured && (
              <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)' }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 14px', borderRadius: 20, background: '#c9922a', color: '#fff', whiteSpace: 'nowrap', letterSpacing: 0.5 }}>
                  Most popular
                </span>
              </div>
            )}

            {/* Plan header */}
            <div style={{ marginBottom: 20 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                background: plan.featured ? 'rgba(201,146,42,.15)' : plan.key === 'pro' ? 'rgba(74,158,114,.1)' : 'rgba(10,35,22,.06)',
                color: plan.featured ? '#c9922a' : plan.key === 'pro' ? '#4a9e72' : '#6b6b6b',
                letterSpacing: 0.5,
              }}>
                {plan.label}
              </span>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: plan.featured ? '#f9f5ec' : '#0a2316', margin: '12px 0 4px' }}>
                {plan.name}
              </h3>
              <p style={{ fontSize: 12, color: plan.featured ? 'rgba(249,245,236,.5)' : '#8a8a8a', margin: '0 0 16px', lineHeight: 1.5 }}>
                {plan.positioning}
              </p>
              <p style={{ fontSize: 30, fontWeight: 800, color: plan.featured ? '#f9f5ec' : '#0a2316', margin: 0 }}>
                {formatPrice(plan)}
                {plan.monthlyPrice > 0 && billing === 'annual' && (
                  <span style={{ fontSize: 12, fontWeight: 400, color: plan.featured ? 'rgba(249,245,236,.4)' : '#8a8a8a', marginLeft: 6 }}>
                    billed annually
                  </span>
                )}
              </p>
            </div>

            <div style={{ borderTop: `1px solid ${plan.featured ? 'rgba(255,255,255,.08)' : '#ede8dc'}`, marginBottom: 20 }} />

            {/* Feature sections */}
            <div style={{ flex: 1 }}>
              {plan.sections.map(section => (
                <div key={section.heading} style={{ marginBottom: 18 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: plan.featured ? 'rgba(249,245,236,.3)' : '#aaa', margin: '0 0 10px' }}>
                    {section.heading}
                  </p>
                  {section.features.map(feat => (
                    <div key={feat} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginBottom: 8 }}>
                      <CheckIcon color={section.muted ? (plan.featured ? 'rgba(249,245,236,.2)' : '#ccc') : plan.checkColor} />
                      <span style={{
                        fontSize: 13,
                        lineHeight: 1.5,
                        color: section.muted
                          ? (plan.featured ? 'rgba(249,245,236,.3)' : '#bbb')
                          : (plan.featured ? 'rgba(249,245,236,.85)' : '#3a3a3a'),
                      }}>
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={() => router.push(plan.key === 'free' ? '/signup' : '/signup?plan=' + plan.key)}
              style={{
                marginTop: 8,
                padding: '13px 0',
                borderRadius: 10,
                border: plan.featured ? 'none' : '1px solid #ddd8cc',
                background: plan.featured ? '#c9922a' : plan.key === 'pro' ? '#0a2316' : 'transparent',
                color: plan.featured || plan.key === 'pro' ? '#fff' : '#0a2316',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                width: '100%',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              {plan.ctaLabel}
            </button>
          </div>
        ))}
      </div>

      {/* Footnote */}
      <p style={{ textAlign: 'center', fontSize: 12, color: '#aaa', marginTop: 8 }}>
        All plans include WhatsApp sharing. Annual billing is charged as a single yearly payment.
      </p>
    </div>
  )
}
