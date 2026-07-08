import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const form = await req.formData()

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

  const res = await fetch(`${backendUrl}/api/whatsapp-summary`, {
    method: 'POST',
    body: form,
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'Backend error' }, { status: res.status })
  }

  const data = await res.json()
  return NextResponse.json(data)
}