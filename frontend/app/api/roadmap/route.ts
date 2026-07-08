// app/api/roadmap/route.ts
// Generates artist roadmap server-side using Groq (or OpenAI as fallback).
// Must be server-side — direct browser calls to Groq/OpenAI are CORS blocked.

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

interface GapItem {
  metric:   string
  current:  number
  required: number
}

interface RoadmapRequest {
  labelName:    string
  labelCountry: string
  labelScore:   number
  genre:        string
  market:       string
  gaps:         GapItem[]
}

interface RoadmapStep {
  title:       string
  description: string
  timeframe:   string
  metric:      string
}

const FALLBACK: RoadmapStep[] = [
  {
    title:       'Push on Audiomack daily',
    description: 'Share your Audiomack link in WhatsApp music groups and ask DJs to playlist your track.',
    timeframe:   '2–4 weeks',
    metric:      'Audiomack monthly streams',
  },
  {
    title:       'Post 4 Reels per week',
    description: 'Behind-the-scenes, lyrics clips, studio footage with East Africa hashtags. Engage comments within the first hour.',
    timeframe:   '4–6 weeks',
    metric:      'Instagram followers',
  },
  {
    title:       'Release a new single + video',
    description: 'One polished single with a low-budget video boosts all your metrics simultaneously.',
    timeframe:   '6–8 weeks',
    metric:      'Original releases',
  },
  {
    title:       'Get on Boomplay',
    description: 'Use DistroKid or TuneCore to distribute. Ask fans to stream and share your YouTube video.',
    timeframe:   '1–2 weeks',
    metric:      'YouTube monthly views',
  },
]

// ── Calls Groq first, OpenAI as fallback ─────────────────────────────────────
async function callAI(prompt: string): Promise<string> {
  const groqKey   = process.env.GROQ_API_KEY
  const openaiKey = process.env.OPENAI_API_KEY

  if (groqKey) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model:       'llama-3.3-70b-versatile',
        temperature: 0.4,
        max_tokens:  800,
        messages:    [{ role: 'user', content: prompt }],
      }),
    })
    if (!res.ok) throw new Error(`Groq ${res.status}`)
    const json = await res.json()
    return json.choices?.[0]?.message?.content ?? ''
  }

  if (openaiKey) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model:       'gpt-4o-mini',
        temperature: 0.4,
        max_tokens:  800,
        messages:    [{ role: 'user', content: prompt }],
      }),
    })
    if (!res.ok) throw new Error(`OpenAI ${res.status}`)
    const json = await res.json()
    return json.choices?.[0]?.message?.content ?? ''
  }

  throw new Error('No AI key configured — add GROQ_API_KEY or OPENAI_API_KEY to .env.local')
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  let body: RoadmapRequest
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ steps: FALLBACK })
  }

  const { labelName, labelCountry, labelScore, genre, market, gaps } = body

  if (!gaps || gaps.length === 0) {
    return NextResponse.json({ steps: FALLBACK })
  }

  const gapText = gaps
    .map(g => `- ${g.metric}: currently ${g.current.toLocaleString()}, needs ${g.required.toLocaleString()}`)
    .join('\n')

  const prompt = `You are a music industry advisor for African artists using FairSign.

Artist genre: ${genre || 'Afrobeats'}. Market: ${market || 'Uganda'}.
Target label: "${labelName}" (${labelCountry}). Readiness: ${labelScore}%.

Metric gaps to close:
${gapText}

Write exactly 4 specific, actionable steps to close these gaps. Reference Audiomack, Boomplay, local radio, and East/West African music industry context. Order by quickest wins first.

Respond ONLY with a JSON array, no markdown, no preamble:
[{"title":"...","description":"...","timeframe":"...","metric":"..."}]`

  try {
    const text  = await callAI(prompt)
    // Strip markdown fences if model adds them despite instructions
    const clean = text.trim().replace(/^```json\s*/,'').replace(/\s*```$/,'')
    const steps: RoadmapStep[] = JSON.parse(clean)
    return NextResponse.json({ steps })
  } catch (err) {
    console.error('[roadmap] generation failed, using fallback:', err)
    // Always return fallback so the UI never shows an empty roadmap
    return NextResponse.json({ steps: FALLBACK })
  }
}