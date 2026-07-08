import { NextResponse } from 'next/server'
import { auth } from '@/auth'

const BACKEND = process.env.BACKEND_URL || 'http://localhost:8000'

export async function GET() {
  try {
    const session = await auth()
    const token = (session as any)?.backendToken
    if (!token) return NextResponse.json([])
    const res = await fetch(`${BACKEND}/api/history`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return NextResponse.json([])
    return NextResponse.json(await res.json())
  } catch {
    return NextResponse.json([])
  }
}