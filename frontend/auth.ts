import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"

// Server-side — call backend directly, no proxy needed
const BACKEND = process.env.BACKEND_URL || "http://localhost:8000"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    // ── Standard email/password login ─────────────────────────────────────────
    Credentials({
      id: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await fetch(`${BACKEND}/api/auth/login`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({
              email:    credentials.email,
              password: credentials.password,
            }),
          })
          if (!res.ok) return null
          const data = await res.json()
          return {
            id:     data.user.id,
            name:   data.user.name,
            email:  data.user.email,
            market: data.user.market,
            token:  data.token,
          }
        } catch {
          return null
        }
      },
    }),

    // ── Google OAuth ───────────────────────────────────────────────────────────
    Google({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // ── OTP verification — called after user submits the 6-digit code ─────────
    Credentials({
      id: "google-otp",
      credentials: {
        email:     { label: "Email",     type: "email" },
        otp:       { label: "OTP",       type: "text" },
        google_id: { label: "Google ID", type: "text" },
        name:      { label: "Name",      type: "text" },
      },
      async authorize(credentials) {
        try {
          // 1. Verify OTP code
          const verifyRes = await fetch(`${BACKEND}/api/auth/verify-otp`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({
              email: credentials.email,
              code:  credentials.otp,
            }),
          })
          if (!verifyRes.ok) return null

          // 2. Register / fetch user on backend
          const googleRes = await fetch(`${BACKEND}/api/auth/google`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({
              google_id: credentials.google_id,
              email:     credentials.email,
              name:      credentials.name,
            }),
          })
          if (!googleRes.ok) return null

          const data = await googleRes.json()
          return {
            id:     data.user.id,
            name:   data.user.name,
            email:  data.user.email,
            market: data.user.market,
            token:  data.token,
          }
        } catch {
          return null
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ account }) {
      return !!(
        account?.provider === "google" ||
        account?.provider === "credentials" ||
        account?.provider === "google-otp"
      )
    },

    async jwt({ token, user, account }) {
      // Credentials / google-otp: user object comes from authorize()
      if (user && (account?.provider === "credentials" || account?.provider === "google-otp")) {
        token.id           = user.id
        token.market       = (user as any).market || "Uganda"
        token.backendToken = (user as any).token
        token.isNewUser    = false
        return token
      }

      // Google OAuth — call backend to register or fetch existing user
      if (account?.provider === "google" && user) {
        try {
          const res = await fetch(`${BACKEND}/api/auth/google`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({
              google_id: account.providerAccountId,
              email:     user.email,
              name:      user.name,
            }),
          })

          if (res.ok) {
            const data = await res.json()

            if (data.is_new_user) {
              // New user — send OTP, frontend will redirect to /verify-otp
              await fetch(`${BACKEND}/api/auth/send-otp`, {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ email: user.email, name: user.name }),
              })
              token.isNewUser    = true
              token.googleId     = account.providerAccountId
              token.pendingName  = user.name
              token.backendToken = undefined
            } else {
              // Returning user — store token immediately, no OTP needed
              token.id           = data.user.id
              token.market       = data.user.market || "Uganda"
              token.backendToken = data.token
              token.isNewUser    = false
              token.googleId     = undefined
            }
          }
        } catch (e) {
          console.error("[auth] JWT Google error:", e)
        }
      }

      return token
    },

    async session({ session, token }) {
      session.user.id                      = token.id as string
      ;(session.user  as any).market       = token.market
      ;(session       as any).backendToken = token.backendToken
      ;(session       as any).isNewUser    = token.isNewUser
      ;(session       as any).googleId     = token.googleId
      ;(session       as any).pendingName  = token.pendingName
      return session
    },
  },

  pages: { signIn: "/login", error: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
})