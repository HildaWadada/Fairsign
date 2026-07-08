import { NextRequest, NextResponse } from 'next/server'

// Proxy to backend so we don't expose BACKEND_URL to the client
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const res = await fetch(`${process.env.BACKEND_URL}/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Failed to send code.' }, { status: 500 })
  }
}