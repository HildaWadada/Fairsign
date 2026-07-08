"""
FairSign — Unique Features Module
4 features no competitor has:
1. Swahili / Pidgin translation
2. Label Reputation Board
3. WhatsApp share formatter
4. Negotiation Simulator
"""

import json
import os
import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException, Form
from pydantic import BaseModel
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage


def get_llm(temperature: float = 0.3):
    groq_key = os.getenv("GROQ_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")
    if groq_key:
        from langchain_groq import ChatGroq
        return ChatGroq(model="llama-3.3-70b-versatile", temperature=temperature, api_key=groq_key)
    elif openai_key:
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(model="gpt-4o", temperature=temperature, api_key=openai_key)
    else:
        raise ValueError("No API key found. Add GROQ_API_KEY or OPENAI_API_KEY to your .env file.")

router = APIRouter()

# ── In-memory label reputation store (use DB in production) ──────────────
label_reputation_db: dict = {}

# ── Negotiation session store ─────────────────────────────────────────────
negotiation_sessions: dict = {}


# ══════════════════════════════════════════════════════════
# FEATURE 1: LANGUAGE TRANSLATION
# ══════════════════════════════════════════════════════════

LANGUAGE_PROMPTS = {
    "swahili": {
        "name": "Swahili",
        "flag": "🇰🇪🇹🇿🇺🇬",
        "system": """Wewe ni FairSign, mshauri wa mikataba ya muziki kwa wasanii wa Afrika Mashariki.
Tafsiri maelezo haya ya mkataba kwa Kiswahili safi, rahisi kuelewa.
Tumia lugha ya kawaida ya mazungumzo. Epuka maneno magumu ya kisheria.
Eleza kama unavyomweleza rafiki yako ambaye hajui sheria.
Jibu kwa Kiswahili PEKE YAKE.""",
    },
    "pidgin": {
        "name": "Nigerian Pidgin",
        "flag": "🇳🇬",
        "system": """You be FairSign, na music contract advisor for African artists.
Translate dis contract analysis into Nigerian Pidgin English wey everybody go understand.
Use everyday Pidgin wey people dey speak for street.
Make am simple and direct. Talk like you dey explain to your paddy.
Respond in Pidgin ONLY.""",
    },
    "luganda": {
        "name": "Luganda",
        "flag": "🇺🇬",
        "system": """Oli FairSign, omutabazi w'amasezerano g'omuziki mu Afrika.
Tereeza ebirowoozo bino ku masezerano mu Luganda olusimbu.
Kozesa ennimi ey'oluganda lwa bulijjo. Werokera ng'otereeza munno.
Ddamu mu Luganda BUKAFU.""",
    },
}


class TranslateRequest(BaseModel):
    session_id: str
    language: str  # swahili | pidgin | luganda
    content_type: str  # summary | redflags | advice


@router.post("/api/translate")
async def translate_analysis(request: TranslateRequest):
    """Translate contract analysis into Swahili, Pidgin, or Luganda."""
    import main as main_module
    session = main_module.sessions.get(request.session_id)

    # If not in active sessions, try loading from database history
    if not session:
        try:
            from database import SessionLocal, AnalysisHistory
            import json as _json
            db = SessionLocal()
            record = db.query(AnalysisHistory).filter(
                AnalysisHistory.id == request.session_id
            ).first()
            db.close()
            if record:
                session = {
                    "analysis": _json.loads(record.analysis_json),
                    "market": record.market,
                    "filename": record.filename,
                }
        except Exception:
            pass

    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    lang_config = LANGUAGE_PROMPTS.get(request.language)
    if not lang_config:
        raise HTTPException(status_code=400, detail="Language must be: swahili, pidgin, or luganda")

    analysis = session["analysis"]

    # Build content to translate based on type
    if request.content_type == "summary":
        content = f"""
Deal Score: {analysis['dealScore']}/10 — {analysis['scoreLabel']}
{analysis['scoreReason']}

Summary: {analysis['summary']}

Overall Advice: {analysis['overallAdvice']}
"""
    elif request.content_type == "redflags":
        flags = analysis.get("redFlags", [])
        content = "\n\n".join([
            f"Issue: {f['clause']} [{f['severity'].upper()}]\n{f['explanation']}\nNegotiate for: {f['suggestion']}"
            for f in flags
        ])
    else:
        content = analysis.get("overallAdvice", "") + "\n\n" + analysis.get("marketContext", "")

    llm = get_llm(temperature=0.3)
    response = llm.invoke([
        SystemMessage(content=lang_config["system"]),
        HumanMessage(content=f"Translate this contract analysis:\n\n{content}"),
    ])

    return {
        "language": lang_config["name"],
        "flag": lang_config["flag"],
        "translation": response.content,
        "content_type": request.content_type,
    }


# ══════════════════════════════════════════════════════════
# FEATURE 2: LABEL REPUTATION BOARD
# ══════════════════════════════════════════════════════════

class LabelReport(BaseModel):
    label_name: str
    country: str
    issue: str
    severity: str  # high | medium | low
    details: Optional[str] = None
    reporter_market: str


@router.get("/api/labels")
async def get_all_labels():
    """Get all labels in the reputation board."""
    result = []
    for name, data in label_reputation_db.items():
        result.append({
            "name": name,
            "country": data["country"],
            "rating": data["rating"],
            "report_count": data["report_count"],
            "high_severity_count": sum(1 for r in data["reports"] if r["severity"] == "high"),
            "latest_issue": data["reports"][0]["issue"] if data["reports"] else None,
        })
    return sorted(result, key=lambda x: x["rating"])


@router.get("/api/labels/search")
async def search_labels(q: str):
    """Search for a label by name."""
    q_lower = q.lower().strip()
    results = []
    for name, data in label_reputation_db.items():
        if q_lower in name.lower() or q_lower in data["country"].lower():
            results.append({
                "name": name,
                "country": data["country"],
                "rating": data["rating"],
                "report_count": data["report_count"],
                "reports": data["reports"],
            })
    return {"results": results, "query": q, "found": len(results) > 0}


@router.post("/api/labels/report")
async def report_label(report: LabelReport):
    """Submit a report about a label."""
    label_name = report.label_name.strip()
    if not label_name:
        raise HTTPException(status_code=400, detail="Label name is required.")

    if label_name not in label_reputation_db:
        label_reputation_db[label_name] = {
            "country": report.country,
            "reports": [],
            "rating": 3.0,
            "report_count": 0,
        }

    severity_penalty = {"high": 0.4, "medium": 0.2, "low": 0.1}.get(report.severity, 0.1)
    current = label_reputation_db[label_name]
    current["reports"].insert(0, {
        "issue": report.issue,
        "severity": report.severity,
        "verified": False,
        "date": datetime.now().strftime("%Y-%m"),
        "details": report.details,
    })
    current["report_count"] += 1
    current["rating"] = max(1.0, current["rating"] - severity_penalty)

    return {"status": "Report submitted. Thank you for protecting fellow artists.", "label": label_name}


# ══════════════════════════════════════════════════════════
# FEATURE 3: WHATSAPP SHARE FORMATTER
# ══════════════════════════════════════════════════════════

@router.post("/api/whatsapp-summary")
async def get_whatsapp_summary(session_id: str = Form(...)):
    import main as main_module
    import json as _json
    session = main_module.sessions.get(session_id)
    if not session:
        try:
            from database import SessionLocal, AnalysisHistory
            db = SessionLocal()
            record = db.query(AnalysisHistory).filter(AnalysisHistory.id == session_id).first()
            db.close()
            if record:
                session = {"analysis": _json.loads(record.analysis_json), "market": record.market, "filename": record.filename}
        except Exception:
            pass
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    analysis = session["analysis"]
    market = session["market"]
    filename = session.get("filename", "my contract")

    score = analysis["dealScore"]
    score_emoji = "✅" if score >= 7 else "⚠️" if score >= 5 else "🚨"
    flag_emojis = {"Uganda": "🇺🇬", "Nigeria": "🇳🇬", "Kenya": "🇰🇪", "South Africa": "🇿🇦"}

    high_flags = [f for f in analysis.get("redFlags", []) if f["severity"] == "high"]
    med_flags = [f for f in analysis.get("redFlags", []) if f["severity"] == "medium"]

    lines = [
        f"*FairSign Contract Analysis* {flag_emojis.get(market, '🌍')}",
        f"File: _{filename}_",
        "",
        f"*DEAL SCORE: {score}/10 {score_emoji}*",
        f"_{analysis['scoreLabel']}_ — {analysis['scoreReason']}",
        "",
        f"*Summary:*",
        analysis["summary"],
        "",
    ]

    if high_flags:
        lines.append(f"*🚨 HIGH RISK Issues ({len(high_flags)}):*")
        for f in high_flags[:3]:
            lines.append(f"• {f['clause']}: {f['explanation'][:100]}...")
        lines.append("")

    if med_flags:
        lines.append(f"*⚠️ Moderate Issues ({len(med_flags)}):*")
        for f in med_flags[:2]:
            lines.append(f"• {f['clause']}")
        lines.append("")

    lines += [
        f"*Advice:* {analysis['overallAdvice']}",
        "",
        "---",
        "_Analysed by FairSign — Music Contract Analyser for African Artists_",
        "_⚠️ Not legal advice. Consult a qualified music attorney._",
    ]

    whatsapp_text = "\n".join(lines)
    encoded = whatsapp_text.replace(" ", "%20").replace("\n", "%0A").replace("*", "%2A").replace("_", "%5F")
    whatsapp_url = f"https://wa.me/?text={encoded}"

    return {
        "text": whatsapp_text,
        "whatsapp_url": whatsapp_url,
        "char_count": len(whatsapp_text),
    }


# ══════════════════════════════════════════════════════════
# FEATURE 4: NEGOTIATION SIMULATOR (LangGraph)
# ══════════════════════════════════════════════════════════

LABEL_PERSONA_PROMPT = """You are a music label A&R representative in a contract negotiation with an emerging artist.
Your job is to represent the label's interests — push back on the artist's requests, but stay realistic.

LABEL STRATEGY:
- Start firm but reasonable. Don't immediately cave.
- Use common label arguments: "This is industry standard", "We take all the risk", "Bigger labels won't offer this"
- Concede small points to seem fair (e.g. reduce 360% slightly, offer slightly better royalty)
- Never give away masters easily — this is your biggest point of resistance
- Stay in character. You are professional but firm.
- After 4-5 exchanges, you can start to show "flexibility" on 1-2 points

CONTRACT CONTEXT:
{contract_summary}

MARKET: {market}

Keep responses to 3-5 sentences. Be conversational but professional.
"""

COACH_PROMPT = """You are FairSign's negotiation coach, giving real-time advice to an African artist in a contract negotiation.
After each label response, give the artist:
1. A quick assessment of what the label just offered
2. The ideal counter-move
3. One specific piece of negotiation language they can use

Keep it short — 3 bullet points max. Be direct and actionable.

CONTRACT CONTEXT: {contract_summary}
MARKET: {market}
"""


class NegotiateRequest(BaseModel):
    session_id: str
    message: str
    neg_session_id: Optional[str] = None


class NegotiateStartRequest(BaseModel):
    session_id: str
    focus_clause: Optional[str] = "royalties"


@router.post("/api/negotiate/start")
async def start_negotiation(request: NegotiateStartRequest):
    import main as main_module
    import json as _json
    session = main_module.sessions.get(request.session_id)
    if not session:
        try:
            from database import SessionLocal, AnalysisHistory
            db = SessionLocal()
            record = db.query(AnalysisHistory).filter(AnalysisHistory.id == request.session_id).first()
            db.close()
            if record:
                session = {"analysis": _json.loads(record.analysis_json), "market": record.market, "filename": record.filename}
        except Exception:
            pass
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    analysis = session["analysis"]
    market = session["market"]

    contract_summary = (
        f"Deal Score: {analysis['dealScore']}/10. "
        f"Key issues: {', '.join([f['clause'] for f in analysis.get('redFlags', [])[:4]])}. "
        f"Royalty: {next((t['contractSays'] for t in analysis.get('keyTerms', []) if 'royalt' in t['term'].lower()), 'not specified')}. "
        f"Masters: {next((t['contractSays'] for t in analysis.get('keyTerms', []) if 'master' in t['term'].lower()), 'label owns')}"
    )

    neg_session_id = str(uuid.uuid4())
    negotiation_sessions[neg_session_id] = {
        "contract_session_id": request.session_id,
        "market": market,
        "contract_summary": contract_summary,
        "messages": [],
        "turns": 0,
        "focus_clause": request.focus_clause,
    }

    # Generate opening label message
    llm = get_llm(temperature=0.6)
    system = LABEL_PERSONA_PROMPT.format(contract_summary=contract_summary, market=market)
    opening = llm.invoke([
        SystemMessage(content=system),
        HumanMessage(content=f"Start the negotiation. The artist wants to discuss: {request.focus_clause}. Open the conversation as the label rep."),
    ])

    negotiation_sessions[neg_session_id]["messages"].append({
        "role": "label",
        "content": opening.content,
    })

    return {
        "neg_session_id": neg_session_id,
        "label_message": opening.content,
        "focus_clause": request.focus_clause,
    }


@router.post("/api/negotiate/message")
async def send_negotiation_message(request: NegotiateRequest):
    """Send a message in the negotiation simulator."""
    neg_session = negotiation_sessions.get(request.neg_session_id)
    if not neg_session:
        raise HTTPException(status_code=404, detail="Negotiation session not found. Please start a new negotiation.")

    llm = get_llm(temperature=0.6)
    market = neg_session["market"]
    contract_summary = neg_session["contract_summary"]

    # Add artist message
    neg_session["messages"].append({"role": "artist", "content": request.message})
    neg_session["turns"] += 1

    # Build conversation history for label
    label_system = LABEL_PERSONA_PROMPT.format(contract_summary=contract_summary, market=market)
    history = [SystemMessage(content=label_system)]
    for msg in neg_session["messages"]:
        if msg["role"] == "label":
            history.append(AIMessage(content=msg["content"]))
        else:
            history.append(HumanMessage(content=msg["content"]))

    # Label response
    label_response = llm.invoke(history)

    # Coach feedback
    coach_llm = get_llm(temperature=0.3)
    coach_system = COACH_PROMPT.format(contract_summary=contract_summary, market=market)
    coach_response = coach_llm.invoke([
        SystemMessage(content=coach_system),
        HumanMessage(content=f"Artist said: '{request.message}'\nLabel responded: '{label_response.content}'\n\nGive the artist quick coaching advice."),
    ])

    neg_session["messages"].append({"role": "label", "content": label_response.content})

    # Score the negotiation after 3+ turns
    score = None
    if neg_session["turns"] >= 3:
        score_prompt = f"""Rate how well the artist is negotiating based on this conversation so far.
Give a score 1-10 and one sentence of feedback.
Return JSON only: {{"score": 7, "feedback": "..."}}

Conversation: {json.dumps(neg_session['messages'][-6:])}"""
        try:
            score_response = llm.invoke([HumanMessage(content=score_prompt)])
            score_data = json.loads(score_response.content)
            score = score_data
        except Exception:
            pass

    return {
        "label_message": label_response.content,
        "coach_tip": coach_response.content,
        "turn": neg_session["turns"],
        "score": score,
    }