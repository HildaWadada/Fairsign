import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

const BACKEND = process.env.BACKEND_URL || 'http://localhost:8000'

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    const token = (session as any)?.backendToken
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    const res = await fetch(`${BACKEND}/api/history/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(await res.json())
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}