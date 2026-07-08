/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // ── Contract analysis ────────────────────────────────────────────────────
      { source: '/api/analyse',      destination: 'http://localhost:8000/api/analyse' },
      { source: '/api/analyse-text', destination: 'http://localhost:8000/api/analyse-text' },

      // ── Chat & session ───────────────────────────────────────────────────────
      { source: '/api/chat',              destination: 'http://localhost:8000/api/chat' },
      { source: '/api/session/:path*',    destination: 'http://localhost:8000/api/session/:path*' },

      // ── History ──────────────────────────────────────────────────────────────
      // Most specific first to avoid Next.js route conflicts
      { source: '/api/history/save',   destination: 'http://localhost:8000/api/history/save' },
      { source: '/api/history/:path*', destination: 'http://localhost:8000/api/history/:path*' },
      { source: '/api/history',        destination: 'http://localhost:8000/api/history' },

      // ── Backend auth ─────────────────────────────────────────────────────────
      // /api/auth/* is reserved by NextAuth — use /backend/auth/* prefix instead
      { source: '/backend/auth/google',          destination: 'http://localhost:8000/api/auth/google' },
      { source: '/backend/auth/login',           destination: 'http://localhost:8000/api/auth/login' },
      { source: '/backend/auth/signup',          destination: 'http://localhost:8000/api/auth/signup' },
      { source: '/backend/auth/send-otp',        destination: 'http://localhost:8000/api/auth/send-otp' },
      { source: '/backend/auth/verify-otp',      destination: 'http://localhost:8000/api/auth/verify-otp' },
      { source: '/backend/auth/resend-otp',      destination: 'http://localhost:8000/api/auth/resend-otp' },
      { source: '/backend/auth/change-password', destination: 'http://localhost:8000/api/auth/change-password' },

      // ── Settings endpoints ───────────────────────────────────────────────────
      { source: '/backend/auth/me',       destination: 'http://localhost:8000/api/auth/me' },
      { source: '/backend/auth/profile',  destination: 'http://localhost:8000/api/auth/profile' },
      { source: '/backend/auth/password', destination: 'http://localhost:8000/api/auth/password' },
      { source: '/backend/auth/account',  destination: 'http://localhost:8000/api/auth/account' },

      // ── Misc ─────────────────────────────────────────────────────────────────
      { source: '/api/feedback',              destination: 'http://localhost:8000/api/feedback' },
      { source: '/api/translate/:path*',      destination: 'http://localhost:8000/api/translate/:path*' },
      { source: '/api/negotiate/:path*',      destination: 'http://localhost:8000/api/negotiate/:path*' },
      { source: '/api/labels/:path*',         destination: 'http://localhost:8000/api/labels/:path*' },
      { source: '/api/whatsapp/:path*',       destination: 'http://localhost:8000/api/whatsapp/:path*' },
      { source: '/api/notifications/:path*',  destination: 'http://localhost:8000/api/notifications/:path*' },
    ]
  },
}

module.exports = nextConfig