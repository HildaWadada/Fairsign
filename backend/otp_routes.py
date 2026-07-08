"""
FairSign — OTP Routes
Handles sending and verifying one-time passcodes for Google sign-in.
Codes expire after 60 seconds.
"""

import os
import random
import string
import smtplib
import threading
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db, User

router = APIRouter()

# In-memory OTP store: { email: { code, expires_at } }
# For production, swap this for Redis
_otp_store: dict = {}
_lock = threading.Lock()


def _generate_code(length: int = 6) -> str:
    return "".join(random.choices(string.digits, k=length))


def _send_email(to_email: str, to_name: str, code: str):
    """Send OTP email via SMTP. Configure via environment variables."""
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASS")
    from_email = os.getenv("FROM_EMAIL", smtp_user)

    if not smtp_user or not smtp_pass:
        # In development, just print the code to the console
        print(f"\n🔐 OTP for {to_email}: {code}\n")
        return

    html_body = f"""
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
      <div style="background: #0a2316; padding: 20px 32px; border-radius: 12px 12px 0 0;">
        <span style="font-size: 22px; font-weight: 700; color: #f9f5ec;">FairSign</span>
        <span style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 20px;
                     background: #c9922a; color: #fff; margin-left: 8px;">BETA</span>
      </div>
      <div style="background: #fff; padding: 32px; border: 1px solid #ede8dc; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px; color: #0a2316; margin: 0 0 8px;">Hi {to_name},</p>
        <p style="font-size: 14px; color: #6b6b6b; margin: 0 0 28px; line-height: 1.6;">
          Here is your FairSign verification code. It expires in <strong>1 minute</strong>.
        </p>
        <div style="background: #f7f3eb; border-radius: 10px; padding: 24px; text-align: center; margin-bottom: 28px;">
          <span style="font-size: 40px; font-weight: 800; letter-spacing: 12px; color: #0a2316;">{code}</span>
        </div>
        <p style="font-size: 12px; color: #aaa; margin: 0; line-height: 1.6;">
          If you didn't request this, you can safely ignore this email.<br>
          Never share this code with anyone.
        </p>
      </div>
    </div>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"{code} is your FairSign verification code"
    msg["From"] = f"FairSign <{from_email}>"
    msg["To"] = to_email
    msg.attach(MIMEText(html_body, "html"))

    with smtplib.SMTP(smtp_host, smtp_port) as server:
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.sendmail(from_email, to_email, msg.as_string())


# ── Request models ─────────────────────────────────────────────────────────

class SendOTPRequest(BaseModel):
    email: str
    name: str
    google_id: str


class VerifyOTPRequest(BaseModel):
    email: str
    otp: str


# ── Routes ─────────────────────────────────────────────────────────────────

@router.post("/api/auth/send-otp")
async def send_otp(request: SendOTPRequest, db: Session = Depends(get_db)):
    """
    Generate a 6-digit OTP, store it for 60 seconds, and email it.
    Returns 409 if the email is already registered via email/password
    to prevent duplicate account creation through Google.
    """
    email = request.email.lower().strip()

    # ── Block duplicate accounts ───────────────────────────────────────────
    existing = db.query(User).filter(User.email == email).first()
    if existing and existing.provider == "email":
        raise HTTPException(
            status_code=409,
            detail="account_exists_email"
        )
    # If provider is already "google" that's fine — allow re-verification

    # ── Generate and store OTP ─────────────────────────────────────────────
    code = _generate_code()
    expires_at = datetime.utcnow() + timedelta(seconds=60)

    with _lock:
        _otp_store[email] = {
            "code": code,
            "expires_at": expires_at,
            "google_id": request.google_id,
            "name": request.name,
        }

    try:
        _send_email(email, request.name, code)
    except Exception as e:
        print(f"Email send failed: {e}")
        pass

    return {"message": "Verification code sent. Check your email."}


@router.post("/api/auth/verify-otp")
async def verify_otp(request: VerifyOTPRequest):
    """Verify the OTP. Raises 400 if invalid or expired."""
    email = request.email.lower()

    with _lock:
        record = _otp_store.get(email)

        if not record:
            raise HTTPException(status_code=400, detail="No verification code found for this email. Please try signing in again.")

        if datetime.utcnow() > record["expires_at"]:
            del _otp_store[email]
            raise HTTPException(status_code=400, detail="Verification code has expired. Please try signing in again.")

        if record["code"] != request.otp.strip():
            raise HTTPException(status_code=400, detail="Incorrect verification code. Please try again.")

        # Valid — clean up
        del _otp_store[email]

    return {"message": "Code verified successfully."}