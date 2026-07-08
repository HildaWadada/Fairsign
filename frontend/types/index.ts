// FairSign — Shared TypeScript Types

export type Market = 'Uganda' | 'Nigeria' | 'Kenya' | 'South Africa'
export type Personality = 'friendly' | 'formal' | 'concise'
export type Severity = 'high' | 'medium' | 'low'
export type TermStatus = 'good' | 'fair' | 'concerning' | 'bad'
export type ScoreLabel = 'Artist-Friendly' | 'Mixed Bag' | 'Risky Deal' | 'Exploitative'

export interface KeyTerm {
  term: string
  contractSays: string
  benchmark: string
  status: TermStatus
}

export interface RedFlag {
  clause: string
  severity: Severity
  explanation: string
  africanContext: string
  suggestion: string
  templateLanguage?: string
}

export interface PlainEnglishSection {
  section: string
  simplified: string
  tip: string
}

export interface ContractAnalysis {
  dealScore: number
  scoreLabel: ScoreLabel
  scoreReason: string
  summary: string
  marketContext: string
  keyTerms: KeyTerm[]
  redFlags: RedFlag[]
  plainEnglish: PlainEnglishSection[]
  positives: string[]
  overallAdvice: string
}

export interface AnalysisResponse {
  session_id: string
  filename: string
  market: Market
  analysis: ContractAnalysis
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface SessionData {
  sessionId: string
  filename: string
  market: Market
  analysis: ContractAnalysis
  personality: Personality
}