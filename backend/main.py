"""FairSign — FastAPI Backend"""

import os
import uuid
import json
import logging
import logging.config
from typing import Optional

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

load_dotenv()

# ── Structured logging ─────────────────────────────────────────────────────────
logging.config.dictConfig({
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "json": {
            "format": '{"time":"%(asctime)s","level":"%(levelname)s","logger":"%(name)s","msg":"%(message)s"}'
        }
    },
    "handlers": {
        "console": {"class": "logging.StreamHandler", "formatter": "json"}
    },
    "root": {"level": "INFO", "handlers": ["console"]},
})
log = logging.getLogger("fairsign.main")

from agent.graph import run_contract_analysis, run_chat_message
from agent.parser import extract_text_from_file, validate_contract_text
from features import router as features_router
from auth_routes import router as auth_router, get_current_user, get_optional_user
from database import get_db, create_tables, User, AnalysisHistory, SessionLocal
from otp_routes import router as otp_router

# ── Rate limiter ───────────────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="FairSign API", version="1.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

create_tables()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(otp_router)
app.include_router(features_router)
app.include_router(auth_router)

# In-memory session store (use Redis in production)
sessions: dict = {}


class ChatRequest(BaseModel):
    session_id: str
    message: str
    personality: Optional[str] = "friendly"


# ── Basic routes ───────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {"status": "FairSign API running", "version": "1.0.0"}


@app.get("/health")
async def health():
    groq_key   = os.getenv("GROQ_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")
    return {
        "status": "ok",
        "ai_provider": "groq" if groq_key else "openai" if openai_key else "none",
    }


# ── Contract analysis ──────────────────────────────────────────────────────────

@app.post("/api/analyse")
@limiter.limit("10/minute")
async def analyse_contract(
    request: Request,
    file: UploadFile = File(...),
    market: str = Form(default="Uganda"),
    personality: str = Form(default="friendly"),
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    valid_markets = ["Uganda", "Nigeria", "Kenya", "South Africa"]
    if market not in valid_markets:
        raise HTTPException(status_code=400, detail=f"Market must be one of: {valid_markets}")

    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 10MB.")

    try:
        contract_text = await extract_text_from_file(file.filename or "contract.txt", content)
        validate_contract_text(contract_text)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    user_context = ""
    if current_user:
        try:
            from chroma_store import get_user_context
            user_context = get_user_context(current_user.id)
        except Exception:
            pass
        market = current_user.market or market

    log.info("analyse_contract user=%s market=%s file=%s", getattr(current_user, "id", "anon"), market, file.filename)

    try:
        analysis = await run_contract_analysis(
            contract_text=contract_text,
            market=market,
            personality=personality,
            user_context=user_context,
        )
    except Exception as e:
        log.error("Analysis failed: %s", e)
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

    session_id = str(uuid.uuid4())
    sessions[session_id] = {
        "contract_text": contract_text,
        "market":        market,
        "analysis":      analysis,
        "personality":   personality,
        "filename":      file.filename or "contract",
        "user_id":       current_user.id if current_user else None,
    }

    # Auto-save to database so it appears on the dashboard
    if current_user:
        try:
            from datetime import datetime
            record = AnalysisHistory(
                id            = session_id,
                user_id       = current_user.id,
                filename      = file.filename or "contract",
                market        = market,
                deal_score    = int(analysis.get("dealScore", 0)),
                score_label   = analysis.get("scoreLabel", ""),
                summary       = analysis.get("summary", ""),
                analysis_json = json.dumps(analysis),
                created_at    = datetime.utcnow(),
            )
            db.add(record)
            db.commit()
            log.info("Auto-saved analysis %s for user %s", session_id, current_user.id)
        except Exception as e:
            log.error("Auto-save failed: %s", e)

    return {"session_id": session_id, "filename": file.filename, "market": market, "analysis": analysis}


@app.post("/api/analyse-text")
@limiter.limit("10/minute")
async def analyse_text(
    request: Request,
    text: str = Form(...),
    market: str = Form(default="Uganda"),
    personality: str = Form(default="friendly"),
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    try:
        validate_contract_text(text)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    user_context = ""
    if current_user:
        try:
            from chroma_store import get_user_context
            user_context = get_user_context(current_user.id)
        except Exception:
            pass
        market = current_user.market or market

    try:
        analysis = await run_contract_analysis(
            contract_text=text,
            market=market,
            personality=personality,
            user_context=user_context,
        )
    except Exception as e:
        log.error("analyse-text failed: %s", e)
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

    session_id = str(uuid.uuid4())
    sessions[session_id] = {
        "contract_text": text,
        "market":        market,
        "analysis":      analysis,
        "personality":   personality,
        "filename":      "pasted-contract",
        "user_id":       current_user.id if current_user else None,
    }

    if current_user:
        try:
            from datetime import datetime
            record = AnalysisHistory(
                id            = session_id,
                user_id       = current_user.id,
                filename      = "pasted-contract",
                market        = market,
                deal_score    = int(analysis.get("dealScore", 0)),
                score_label   = analysis.get("scoreLabel", ""),
                summary       = analysis.get("summary", ""),
                analysis_json = json.dumps(analysis),
                created_at    = datetime.utcnow(),
            )
            db.add(record)
            db.commit()
        except Exception as e:
            log.error("Auto-save failed: %s", e)

    return {"session_id": session_id, "filename": "pasted-contract", "market": market, "analysis": analysis}


# ── Chat (rate-limited) ────────────────────────────────────────────────────────

@app.post("/api/chat")
@limiter.limit("30/minute")
async def chat(request: Request, body: ChatRequest):
    session = sessions.get(body.session_id)

    if not session:
        try:
            db = SessionLocal()
            record = db.query(AnalysisHistory).filter(
                AnalysisHistory.id == body.session_id
            ).first()
            db.close()
            if record:
                session = {
                    "contract_text": "",
                    "market":        record.market,
                    "analysis":      json.loads(record.analysis_json),
                    "personality":   "formal",
                    "filename":      record.filename,
                }
        except Exception:
            pass

    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    analysis = session.get("analysis", {})
    analysis_summary = (
        f"Deal Score: {analysis.get('dealScore', 'N/A')}/10 ({analysis.get('scoreLabel', '')}). "
        f"{analysis.get('scoreReason', '')} "
        f"Red flags: {len(analysis.get('redFlags', []))}."
    )

    try:
        reply = await run_chat_message(
            user_message=body.message,
            contract_text=session["contract_text"],
            market=session["market"],
            thread_id=body.session_id,
            analysis_summary=analysis_summary,
            personality=body.personality or session.get("personality", "friendly"),
        )
    except Exception as e:
        log.error("Chat error: %s", e)
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")

    return {"reply": reply, "session_id": body.session_id}


@app.get("/api/session/{session_id}")
async def get_session(session_id: str):
    session = sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    return {"session_id": session_id, "filename": session.get("filename"), "market": session["market"], "analysis": session["analysis"]}


@app.post("/api/feedback")
@limiter.limit("20/minute")
async def submit_feedback(
    request: Request,
    session_id: str = Form(...),
    rating: int = Form(...),
    comment: Optional[str] = Form(default=None),
):
    if rating < 1 or rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5.")
    if session_id in sessions:
        sessions[session_id]["feedback"] = {"rating": rating, "comment": comment}
    log.info("Feedback session=%s rating=%d", session_id[:8], rating)
    return {"status": "Feedback received. Thank you!"}


# ── History (protected) ────────────────────────────────────────────────────────

@app.get("/api/history")
async def get_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    history = (
        db.query(AnalysisHistory)
        .filter(AnalysisHistory.user_id == current_user.id)
        .order_by(AnalysisHistory.created_at.desc())
        .limit(20)
        .all()
    )
    return [
        {
            "id":          h.id,
            "filename":    h.filename,
            "market":      h.market,
            "deal_score":  h.deal_score,
            "score_label": h.score_label,
            "summary":     h.summary,
            "created_at":  h.created_at.isoformat(),
        }
        for h in history
    ]


@app.post("/api/history/save")
async def save_history(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    # Don't duplicate if already auto-saved
    existing = db.query(AnalysisHistory).filter(AnalysisHistory.id == session_id).first()
    if existing:
        return {"message": "Already saved.", "id": existing.id}

    analysis = session["analysis"]
    from datetime import datetime
    record = AnalysisHistory(
        id            = str(uuid.uuid4()),
        user_id       = current_user.id,
        filename      = session.get("filename", "contract"),
        market        = session.get("market", "Uganda"),
        deal_score    = int(analysis.get("dealScore", 0)),
        score_label   = analysis.get("scoreLabel", ""),
        summary       = analysis.get("summary", ""),
        analysis_json = json.dumps(analysis),
        created_at    = datetime.utcnow(),
    )
    db.add(record)
    db.commit()

    try:
        from chroma_store import store_analysis
        store_analysis(current_user.id, record.id, analysis, session.get("market", "Uganda"))
    except Exception:
        pass

    return {"message": "Saved.", "id": record.id}


@app.get("/api/history/{analysis_id}")
async def get_history_detail(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    record = db.query(AnalysisHistory).filter(
        AnalysisHistory.id == analysis_id,
        AnalysisHistory.user_id == current_user.id,
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Not found.")
    return {
        "id":          record.id,
        "filename":    record.filename,
        "market":      record.market,
        "deal_score":  record.deal_score,
        "score_label": record.score_label,
        "analysis":    json.loads(record.analysis_json),
        "created_at":  record.created_at.isoformat(),
    }

@app.post("/api/whatsapp-summary")
async def whatsapp_summary(session_id: str = Form(...)):
    session = sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    analysis = session.get("analysis", {})
    market   = session.get("market", "Uganda")
    filename = session.get("filename", "contract")

    score       = analysis.get("dealScore", "N/A")
    score_label = analysis.get("scoreLabel", "")
    summary     = analysis.get("summary", "")
    red_flags   = analysis.get("redFlags", [])
    
    flag_lines = "\n".join(f"⚠️ {f}" for f in red_flags[:3]) if red_flags else "✅ No major red flags"

    text = (
        f"📄 *FairSign Contract Analysis*\n"
        f"📁 {filename} · {market}\n\n"
        f"🎯 *Deal Score: {score}/10 — {score_label}*\n\n"
        f"📝 *Summary:*\n{summary}\n\n"
        f"🚩 *Top Red Flags:*\n{flag_lines}\n\n"
        f"_Analysed by FairSign · fairsign.app_"
    )

    whatsapp_url = f"https://wa.me/?text={requests.utils.quote(text)}"
    return {"text": text, "whatsapp_url": whatsapp_url}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000)