import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

const BACKEND = process.env.BACKEND_URL || 'http://localhost:8000'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    const token = (session as any)?.backendToken
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    const sid = new URL(req.url).searchParams.get('session_id')
    if (!sid) return NextResponse.json({ error: 'session_id required' }, { status: 400 })
    const res = await fetch(`${BACKEND}/api/history/save?session_id=${sid}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    return NextResponse.json(await res.json(), { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Save failed' }, { status: 500 })
  }
}