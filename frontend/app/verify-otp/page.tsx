// frontend/app/verify-otp/page.tsx  (key logic — merge into your existing UI)
//
// The flow is now:
//  1. User signs in with Google → Auth.js sends OTP, sets isNewUser=true in session
//  2. This page reads googleId + email from the session (not URL params)
//  3. On submit, calls signIn("google-otp", { email, otp, google_id, name })
//  4. That verifies OTP + registers user on backend → sets backendToken in session

"use client"

import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function VerifyOTPPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // If the user already has a backendToken, they're fully signed in — redirect
  useEffect(() => {
    if (status === "authenticated" && (session as any)?.backendToken) {
      router.replace("/dashboard")
    }
  }, [status, session, router])

  // Get google info from session (set in jwt callback)
  const email      = session?.user?.email      || ""
  const googleId   = (session as any)?.googleId  || ""
  const name       = (session as any)?.pendingName || session?.user?.name || ""

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await signIn("google-otp", {
      redirect:  false,
      email,
      otp,
      google_id: googleId,
      name,
    })

    setLoading(false)

    if (result?.ok) {
      router.replace("/dashboard")
    } else {
      setError("Incorrect or expired code. Please try again.")
    }
  }

  async function handleResend() {
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/api/auth/resend-otp`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email, name }),
    })
  }

  // While loading session, show nothing (or a spinner)
  if (status === "loading") return null

  return (
    // Your existing JSX — wire up:
    //   <form onSubmit={handleSubmit}>
    //     <input value={otp} onChange={e => setOtp(e.target.value)} />
    //     {error && <p>{error}</p>}
    //     <button type="submit" disabled={loading}>Verify</button>
    //     <button type="button" onClick={handleResend}>Resend code</button>
    //   </form>
    <div>Replace this with your existing verify-otp UI, wired to handleSubmit above.</div>
  )
}
