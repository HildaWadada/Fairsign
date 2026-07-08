// app/api/notifications/preferences/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

export interface NotifPrefs {
  analysis:  boolean
  tips:      boolean
  labelNews: boolean
  marketing: boolean
}

// In-memory store (same pattern as readiness route).
// Replace with Prisma/DB when ready.
const store = new Map<string, NotifPrefs>()

const DEFAULT: NotifPrefs = {
  analysis:  true,
  tips:      true,
  labelNews: false,
  marketing: false,
}

function userId(session: any): string {
  return session?.user?.id ?? session?.user?.email ?? 'anon'
}

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const prefs = store.get(userId(session)) ?? DEFAULT
  return NextResponse.json(prefs)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const body = await req.json() as Partial<NotifPrefs>

  const prefs: NotifPrefs = {
    analysis:  body.analysis  ?? true,
    tips:      body.tips      ?? true,
    labelNews: body.labelNews ?? false,
    marketing: body.marketing ?? false,
  }

  store.set(userId(session), prefs)
  return NextResponse.json({ success: true, prefs })
}