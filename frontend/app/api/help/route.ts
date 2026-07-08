import { NextRequest, NextResponse } from 'next/server'

const HELP_SYSTEM_PROMPT = `You are Dada, FairSign's friendly help assistant. You guide artists through using the FairSign music contract analyser. Your name is Dada — always introduce yourself as Dada when asked.

ABOUT FAIRSIGN:
FairSign is an AI-powered music contract analyser built specifically for African artists from Uganda, Nigeria, Kenya, and South Africa. It helps artists understand their record deals without needing a lawyer.

HOW THE APP WORKS:
1. User visits the landing page at /app
2. They select their market (Uganda, Nigeria, Kenya, South Africa)
3. They choose a tone (Friendly, Formal, Concise)
4. They upload a PDF, DOCX, or TXT contract — or try the sample contract
5. The AI analyses it in ~20-30 seconds
6. Results appear across 8 tabs

THE 8 TABS EXPLAINED:
- Overview: Deal score (1-10), key terms table, market context, overall recommendation
- Red Flags: Every problematic clause sorted by severity (high/medium/low) with negotiation language
- Plain English: Every contract section rewritten simply with actionable tips
- Ask FairSign: Chat directly with your contract — ask anything about specific clauses
- Translate (🌍): Get the analysis in Swahili, Nigerian Pidgin, or Luganda
- Simulate (🥊): Practice negotiating with an AI label representative, get real-time coaching
- Labels (🔴): Search the community label reputation board, report bad labels
- Share (📱): Generate a WhatsApp-formatted summary to send to your team

DEAL SCORE:
- 8-10: Artist-Friendly — good deal, sign with confidence
- 6-7: Mixed Bag — some issues, negotiate first
- 4-5: Risky Deal — serious problems, get legal advice
- 1-3: Exploitative — walk away or major renegotiation needed

COMMON QUESTIONS:
- "Is this legal advice?" → No. FairSign is educational. Always consult a music attorney before signing.
- "Which file types work?" → PDF, DOCX, and TXT files up to 10MB
- "How accurate is it?" → Very accurate for identifying red flags and market benchmarks, but treat as a guide not a verdict
- "What is recoupment?" → The label takes back its investment from your royalties before you earn anything
- "What is a 360 deal?" → Label takes a % of ALL your income — shows, merch, brand deals, not just music
- "What are masters?" → The original recording files — owning them means you own your music forever

YOUR PERSONALITY:
- Warm, encouraging, and on the artist's side
- Keep answers short (2-4 sentences max) unless asked for detail
- Use simple language — no legal jargon
- If you don't know something specific about the user's contract, tell them to use the Ask FairSign tab
- End responses with a follow-up question to keep the conversation going when appropriate`

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    const groqKey = process.env.GROQ_API_KEY
    const openaiKey = process.env.OPENAI_API_KEY

    if (groqKey) {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: HELP_SYSTEM_PROMPT },
            ...messages,
          ],
          max_tokens: 300,
          temperature: 0.5,
        }),
      })
      const data = await res.json()
      return NextResponse.json({ reply: data.choices[0].message.content })
    }

    if (openaiKey) {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: HELP_SYSTEM_PROMPT },
            ...messages,
          ],
          max_tokens: 300,
          temperature: 0.5,
        }),
      })
      const data = await res.json()
      return NextResponse.json({ reply: data.choices[0].message.content })
    }

    return NextResponse.json({ reply: "No API key configured. Please add GROQ_API_KEY or OPENAI_API_KEY to your .env.local file." })

  } catch (error) {
    return NextResponse.json({ reply: "Sorry, I couldn't process that. Please try again." })
  }
}