// FairSign — API Client
import axios from 'axios'
import { AnalysisResponse, Market, Personality } from '@/types'

const api = axios.create({ baseURL: '/api' })

export async function analyseContract(
  file: File,
  market: Market,
  personality: Personality
): Promise<AnalysisResponse> {
  const form = new FormData()
  form.append('file', file)
  form.append('market', market)
  form.append('personality', personality)
  const { data } = await api.post<AnalysisResponse>('/analyse', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function analyseText(
  text: string,
  market: Market,
  personality: Personality
): Promise<AnalysisResponse> {
  const form = new FormData()
  form.append('text', text)
  form.append('market', market)
  form.append('personality', personality)
  const { data } = await api.post<AnalysisResponse>('/analyse-text', form)
  return data
}

export async function sendChatMessage(
  sessionId: string,
  message: string,
  personality: Personality
): Promise<string> {
  const { data } = await api.post<{ reply: string }>('/chat', {
    session_id: sessionId,
    message,
    personality,
  })
  return data.reply
}

export async function submitFeedback(
  sessionId: string,
  rating: number,
  comment?: string
): Promise<void> {
  const form = new FormData()
  form.append('session_id', sessionId)
  form.append('rating', String(rating))
  if (comment) form.append('comment', comment)
  await api.post('/feedback', form)
}