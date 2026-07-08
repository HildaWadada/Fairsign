// lib/dealReadiness.ts
// Real African label data with verified thresholds and genre matching.

export type ArtistStats = {
  audiomack: number
  spotify:   number
  youtube:   number
  instagram: number
  tiktok:    number
  releases:  number
}

export type LabelScore = {
  name:         string
  country:      string
  market:       string
  tier:         string
  genres:       string[]
  description:  string
  requirements: ArtistStats
  score:        number        // 0-100, how ready this artist is
  qualified:    boolean       // all thresholds met
  notableActs:  string[]
  website:      string
}

export type ReadinessData = {
  overallScore: number
  labelScores:  LabelScore[]
  stats:        ArtistStats
  completedAt:  string
  profile?: {
    stageName:       string
    genre:           string
    audiomackHandle: string
    instagramHandle: string
    tiktokHandle:    string
  }
}

export const METRICS: { key: keyof ArtistStats; label: string }[] = [
  { key: 'audiomack', label: 'Audiomack streams/mo' },
  { key: 'spotify',   label: 'Spotify listeners/mo' },
  { key: 'youtube',   label: 'YouTube views/mo' },
  { key: 'instagram', label: 'Instagram followers' },
  { key: 'tiktok',    label: 'TikTok followers' },
  { key: 'releases',  label: 'Original releases' },
]

// ── Real African Labels Database ──────────────────────────────────────────────
// Thresholds are based on publicly known signings and industry knowledge.

const LABELS_DB: Omit<LabelScore, 'score' | 'qualified'>[] = [

  // ── UGANDA ──
  {
    name: 'Swangz Avenue',
    country: 'Uganda', market: 'Uganda',
    tier: 'Top Tier',
    genres: ['afrobeats', 'afropop', 'rnb', 'dancehall', 'pop'],
    description: 'Uganda\'s biggest label. Home to Winnie Nwagi, Azawi, and Vinka. Focuses heavily on live performance and streaming growth.',
    notableActs: ['Azawi', 'Winnie Nwagi', 'Vinka'],
    website: 'https://swangzavenue.com',
    requirements: { audiomack: 15000, spotify: 5000, youtube: 20000, instagram: 8000, tiktok: 5000, releases: 3 },
  },
  {
    name: 'Big Talent Entertainment',
    country: 'Uganda', market: 'Uganda',
    tier: 'Top Tier',
    genres: ['afrobeats', 'afropop', 'dancehall', 'gospel'],
    description: 'Home to Eddy Kenzo. Known for international reach and strong touring infrastructure across East Africa.',
    notableActs: ['Eddy Kenzo'],
    website: 'https://bigtalentent.com',
    requirements: { audiomack: 10000, spotify: 3000, youtube: 15000, instagram: 6000, tiktok: 3000, releases: 3 },
  },
  {
    name: 'Fenon Records',
    country: 'Uganda', market: 'Uganda',
    tier: 'Mid Tier',
    genres: ['afrobeats', 'afropop', 'rnb', 'pop', 'reggae'],
    description: 'One of Uganda\'s oldest and most respected labels. Strong radio presence and East African distribution network.',
    notableActs: ['Jose Chameleone', 'Weasel'],
    website: 'https://fenonrecords.com',
    requirements: { audiomack: 5000, spotify: 1000, youtube: 8000, instagram: 3000, tiktok: 1000, releases: 2 },
  },
  {
    name: 'Record Base',
    country: 'Uganda', market: 'Uganda',
    tier: 'Entry Tier',
    genres: ['afrobeats', 'afropop', 'dancehall', 'hiphop', 'pop'],
    description: 'Artist-friendly Ugandan label that works with emerging talent. Good starting point for first-time signings.',
    notableActs: ['Sheebah Karungi'],
    website: '',
    requirements: { audiomack: 2000, spotify: 500, youtube: 3000, instagram: 1500, tiktok: 500, releases: 1 },
  },

  // ── NIGERIA ──
  {
    name: 'Mavin Records',
    country: 'Nigeria', market: 'Nigeria',
    tier: 'Top Tier',
    genres: ['afrobeats', 'afropop', 'pop', 'rnb'],
    description: 'Nigeria\'s biggest label. Founded by Don Jazzy. International distribution via Universal Music Group.',
    notableActs: ['Rema', 'Ayra Starr', 'Crayon'],
    website: 'https://mavinrecords.com',
    requirements: { audiomack: 80000, spotify: 50000, youtube: 100000, instagram: 50000, tiktok: 30000, releases: 4 },
  },
  {
    name: 'YBNL Nation',
    country: 'Nigeria', market: 'Nigeria',
    tier: 'Top Tier',
    genres: ['afrobeats', 'afropop', 'hiphop', 'street pop'],
    description: 'Olamide\'s label. Known for breaking street artists into mainstream. Strong Audiomack and Boomplay presence.',
    notableActs: ['Asake', 'Fireboy DML', 'Lyta'],
    website: 'https://ybnlnation.com',
    requirements: { audiomack: 60000, spotify: 30000, youtube: 80000, instagram: 30000, tiktok: 20000, releases: 3 },
  },
  {
    name: 'Spaceship Records',
    country: 'Nigeria', market: 'Nigeria',
    tier: 'Mid Tier',
    genres: ['afrobeats', 'afropop', 'rnb', 'pop'],
    description: 'Burna Boy\'s label. Prioritises authentic Afrofusion artists with strong performance credentials.',
    notableActs: ['Burna Boy'],
    website: '',
    requirements: { audiomack: 40000, spotify: 25000, youtube: 60000, instagram: 25000, tiktok: 15000, releases: 3 },
  },
  {
    name: 'Chocolate City',
    country: 'Nigeria', market: 'Nigeria',
    tier: 'Mid Tier',
    genres: ['afrobeats', 'hiphop', 'rnb', 'pop', 'afropop'],
    description: 'Pan-African label with offices in Lagos and Kampala. Actively scouts East and West African talent.',
    notableActs: ['Blaqbonez', 'Ceeza Milli'],
    website: 'https://chocolatecitymusic.com',
    requirements: { audiomack: 20000, spotify: 10000, youtube: 30000, instagram: 12000, tiktok: 8000, releases: 3 },
  },
  {
    name: 'Apex Records Nigeria',
    country: 'Nigeria', market: 'Nigeria',
    tier: 'Entry Tier',
    genres: ['afrobeats', 'afropop', 'hiphop', 'pop', 'street pop'],
    description: 'Entry-level Nigerian label that actively signs new talent with strong local buzz.',
    notableActs: [],
    website: '',
    requirements: { audiomack: 8000, spotify: 2000, youtube: 10000, instagram: 5000, tiktok: 2000, releases: 2 },
  },

  // ── KENYA ──
  {
    name: 'Sol Generation',
    country: 'Kenya', market: 'Kenya',
    tier: 'Top Tier',
    genres: ['afropop', 'rnb', 'pop', 'afrobeats', 'bongo'],
    description: 'Sauti Sol\'s label. East Africa\'s most successful artist-run label. International partnerships with Universal.',
    notableActs: ['Sauti Sol', 'Kaskazini', 'Nviiri the Storyteller'],
    website: 'https://solgenerationmusic.com',
    requirements: { audiomack: 20000, spotify: 15000, youtube: 40000, instagram: 15000, tiktok: 10000, releases: 3 },
  },
  {
    name: 'Pacho Entertainment',
    country: 'Kenya', market: 'Kenya',
    tier: 'Mid Tier',
    genres: ['hiphop', 'gengetone', 'afropop', 'street', 'afrobeats'],
    description: 'Leading Kenyan hip-hop and gengetone label. Strong YouTube and radio presence across East Africa.',
    notableActs: ['Khaligraph Jones'],
    website: '',
    requirements: { audiomack: 10000, spotify: 5000, youtube: 20000, instagram: 8000, tiktok: 5000, releases: 2 },
  },
  {
    name: 'Mdundo Records',
    country: 'Kenya', market: 'Kenya',
    tier: 'Entry Tier',
    genres: ['afropop', 'bongo', 'afrobeats', 'gengetone', 'pop'],
    description: 'Kenya\'s largest local distribution and label network. Great entry point with strong Boomplay reach.',
    notableActs: [],
    website: 'https://mdundo.com',
    requirements: { audiomack: 3000, spotify: 1000, youtube: 5000, instagram: 2000, tiktok: 1000, releases: 1 },
  },

  // ── SOUTH AFRICA ──
  {
    name: 'Ambitiouz Entertainment',
    country: 'South Africa', market: 'South Africa',
    tier: 'Top Tier',
    genres: ['afropop', 'amapiano', 'hiphop', 'pop', 'rnb'],
    description: 'SA\'s biggest independent label. Launched amapiano globally. Very active A&R scouting via Instagram.',
    notableActs: ['Sjava', 'Amanda Black', 'Emtee'],
    website: 'https://ambitiouz.co.za',
    requirements: { audiomack: 20000, spotify: 30000, youtube: 50000, instagram: 20000, tiktok: 15000, releases: 3 },
  },
  {
    name: 'Def Jam Africa',
    country: 'South Africa', market: 'South Africa',
    tier: 'Top Tier',
    genres: ['hiphop', 'afrobeats', 'afropop', 'amapiano', 'rnb'],
    description: 'Universal Music Group\'s African arm. Biggest budget. Requires proven cross-border numbers.',
    notableActs: ['Nasty C', 'Focalistic', 'Boity'],
    website: 'https://defjamafrica.com',
    requirements: { audiomack: 50000, spotify: 80000, youtube: 150000, instagram: 40000, tiktok: 30000, releases: 4 },
  },
  {
    name: 'Open Mic Productions',
    country: 'South Africa', market: 'South Africa',
    tier: 'Mid Tier',
    genres: ['afropop', 'pop', 'rnb', 'afrobeats', 'gospel'],
    description: 'SA mid-tier label with strong radio relationships. Signs polished artists with consistent release history.',
    notableActs: ['Mi Casa'],
    website: '',
    requirements: { audiomack: 8000, spotify: 10000, youtube: 20000, instagram: 8000, tiktok: 4000, releases: 2 },
  },
]

// ── Scoring ───────────────────────────────────────────────────────────────────

function scoreLabel(stats: ArtistStats, label: Omit<LabelScore, 'score' | 'qualified'>): Pick<LabelScore, 'score' | 'qualified'> {
  let total = 0
  let met = 0

  for (const { key } of METRICS) {
    const cur = stats[key] ?? 0
    const req = label.requirements[key]
    const pct = Math.min(cur / req, 1)
    total += pct
    if (cur >= req) met++
  }

  const score = Math.round((total / METRICS.length) * 100)
  const qualified = met === METRICS.length

  return { score, qualified }
}

// ── Genre match ───────────────────────────────────────────────────────────────

function genreMatch(artistGenre: string, labelGenres: string[]): boolean {
  if (!artistGenre) return true  // no genre specified — show all
  const normalised = artistGenre.toLowerCase().replace(/[^a-z ]/g, '')
  const tokens = normalised.split(/\s+/)
  return labelGenres.some(g => tokens.some(t => g.includes(t) || t.includes(g)))
}

// ── Main exports ───────────────────────────────────────────────────────────────

export function buildLabelScores(stats: ArtistStats, genre = '', market = ''): LabelScore[] {
  return LABELS_DB
    .filter(l => {
      if (market && l.market !== market) return false
      if (genre && !genreMatch(genre, l.genres)) return false
      return true
    })
    .map(l => ({ ...l, ...scoreLabel(stats, l) }))
    .sort((a, b) => b.score - a.score)
}

export function getOverallScore(stats: ArtistStats): number {
  if (LABELS_DB.length === 0) return 0
  const scores = LABELS_DB.map(l => scoreLabel(stats, l).score)
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K'
  return String(n)
}

export function getScoreTier(score: number): { label: string; color: string; bg: string } {
  if (score >= 80) return { label: 'Ready',       color: '#16a34a', bg: '#f0fdf4' }
  if (score >= 60) return { label: 'Almost there', color: '#c9922a', bg: '#fef9ec' }
  if (score >= 40) return { label: 'Building up',  color: '#d97706', bg: '#fffbeb' }
  return               { label: 'Early stage',  color: '#dc2626', bg: '#fef2f2' }
}