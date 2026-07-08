// app/api/artist/readiness/route.ts
// Stores readiness data in-memory per user (survives page refreshes,
// resets on server restart). Replace the Map with a real DB when ready.

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { ReadinessData } from '@/lib/dealReadiness'

// Server-side store — persists across requests within the same process.
// Key: userId (or email), Value: full ReadinessData payload
const store = new Map<string, ReadinessData & { profile?: any }>()

function getUserId(session: any): string {
  return session?.user?.id ?? session?.user?.email ?? 'anonymous'
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const body = await req.json()
    const { stats, overallScore, labelScores, completedAt, profile } = body

    if (!stats) {
      return NextResponse.json({ error: 'Missing stats' }, { status: 400 })
    }

    const userId = getUserId(session)

    // Save everything — not just the score
    const data = { stats, overallScore, labelScores, completedAt, profile }
    store.set(userId, data)

    console.log('[readiness] saved for', userId, { overallScore, labelCount: labelScores?.length })

    return NextResponse.json({ success: true, overallScore })
  } catch (err) {
    console.error('[readiness] POST error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function GET(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const userId = getUserId(session)
    const data = store.get(userId) ?? null

    console.log('[readiness] GET for', userId, data ? `score=${data.overallScore}` : 'no data')

    return NextResponse.json(data)
  } catch (err) {
    console.error('[readiness] GET error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}