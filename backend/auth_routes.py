"""
FairSign — Auth Routes
"""

import os
import uuid
import random
import string
import smtplib
import logging
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from passlib.context import CryptContext
try:
    from jose import jwt, JWTError
except ImportError:
    import jwt

from database import get_db, User
from sqlalchemy.orm import Session

log = logging.getLogger("fairsign.auth")

router = APIRouter(prefix="/api/auth", tags=["auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

try:
    SECRET_KEY = os.environ["JWT_SECRET"]
except KeyError:
    raise RuntimeError(
        "JWT_SECRET environment variable is not set. "
        "Add it to your .env file before starting the server."
    )

ALGORITHM = "HS256"

# In-memory OTP store { email: { code, expires_at } }
otp_store: dict = {}

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


# ── Auth dependencies ──────────────────────────────────────────────────────────

def get_optional_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """Returns the current user if a valid JWT is present, otherwise None."""
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            return None
        return db.query(User).filter(User.id == user_id).first()
    except Exception:
        return None


def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Returns the current user or raises 401."""
    if not token:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated. Please log in.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload.")
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User account not found.")
    return user


# ── Helpers ────────────────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.utcnow() + timedelta(days=7),
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token if isinstance(token, str) else token.decode("utf-8")


def market_from_phone(phone: str) -> str:
    if phone.startswith("+256"): return "Uganda"
    if phone.startswith("+234"): return "Nigeria"
    if phone.startswith("+254"): return "Kenya"
    if phone.startswith("+27"):  return "South Africa"
    return "Uganda"


def send_otp_email(to_email: str, name: str, code: str):
    smtp_host  = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port  = int(os.getenv("SMTP_PORT", 587))
    smtp_user  = os.getenv("SMTP_USER", "")
    smtp_pass  = os.getenv("SMTP_PASS", "")
    from_email = os.getenv("FROM_EMAIL", smtp_user)

    if not smtp_user:
        log.info("OTP for %s: %s (dev mode — no SMTP configured)", to_email, code)
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Your FairSign verification code"
    msg["From"]    = f"FairSign <{from_email}>"
    msg["To"]      = to_email

    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;
                background:#0a2316;color:#f9f5ec;border-radius:12px;">
      <h2 style="color:#c9922a;margin-top:0;">FairSign</h2>
      <p>Hi {name or 'there'},</p>
      <p>Your verification code is:</p>
      <div style="font-size:40px;font-weight:800;letter-spacing:12px;
                  color:#c9922a;margin:24px 0;">{code}</div>
      <p style="color:rgba(249,245,236,.6);font-size:13px;">
        Expires in <strong style="color:#f9f5ec;">1 minute</strong>.
        If you didn't request this, ignore this email.
      </p>
    </div>
    """
    msg.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.sendmail(from_email, to_email, msg.as_string())
        log.info("OTP email sent to %s", to_email)
    except Exception as e:
        log.error("Email send failed for %s: %s", to_email, e)
        log.info("OTP for %s: %s", to_email, code)


# ── Pydantic schemas ───────────────────────────────────────────────────────────

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str
    phone: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class GoogleAuthRequest(BaseModel):
    google_id: str
    email: str
    name: Optional[str] = None

class SendOTPRequest(BaseModel):
    email: str
    name: Optional[str] = None

class VerifyOTPRequest(BaseModel):
    email: str
    code: str
    google_id: Optional[str] = None

class UpdateProfileRequest(BaseModel):
    name:   Optional[str] = None
    market: Optional[str] = None
    phone:  Optional[str] = None

class UpdatePasswordRequest(BaseModel):
    current_password: str
    new_password: str


# ── Auth routes ────────────────────────────────────────────────────────────────

@router.post("/signup")
def signup(body: SignupRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        id            = str(uuid.uuid4()),
        name          = body.name,
        email         = body.email,
        password_hash = hash_password(body.password),
        market        = market_from_phone(body.phone) if body.phone else "Uganda",
        provider      = "email",
        created_at    = datetime.utcnow(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    log.info("New email signup: %s", user.email)
    token = create_token(user.id, user.email)
    return {"token": token, "user": {"id": user.id, "name": user.name, "email": user.email, "market": user.market}}


@router.post("/login")
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="No account found with that email")
    if user.provider == "google" or not user.password_hash:
        raise HTTPException(status_code=401, detail="This account uses Google sign-in. Please use 'Continue with Google'.")
    if not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect password")
    log.info("Login: %s", user.email)
    token = create_token(user.id, user.email)
    return {"token": token, "user": {"id": user.id, "name": user.name, "email": user.email, "market": user.market}}


@router.post("/google")
def google_auth(body: GoogleAuthRequest, db: Session = Depends(get_db)):
    existing_email_user = db.query(User).filter(
        User.email == body.email, User.provider == "email"
    ).first()
    if existing_email_user:
        raise HTTPException(status_code=409, detail="An account with this email already exists. Please sign in with your password.")

    existing_google_user = db.query(User).filter(User.google_id == body.google_id).first()
    if existing_google_user:
        log.info("Google returning user: %s", body.email)
        token = create_token(existing_google_user.id, existing_google_user.email)
        return {
            "is_new_user": False,
            "token": token,
            "user": {"id": existing_google_user.id, "name": existing_google_user.name, "email": existing_google_user.email, "market": existing_google_user.market},
        }

    log.info("Google new user: %s", body.email)
    new_user = User(
        id         = str(uuid.uuid4()),
        name       = body.name or body.email.split("@")[0],
        email      = body.email,
        google_id  = body.google_id,
        provider   = "google",
        market     = "Uganda",
        created_at = datetime.utcnow(),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    token = create_token(new_user.id, new_user.email)
    return {
        "is_new_user": True,
        "token": token,
        "user": {"id": new_user.id, "name": new_user.name, "email": new_user.email, "market": new_user.market},
    }


# ── Settings routes ────────────────────────────────────────────────────────────

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    """Return the current user's profile."""
    return {
        "id":       current_user.id,
        "name":     current_user.name,
        "email":    current_user.email,
        "market":   current_user.market,
        "provider": current_user.provider,
        # Return phone if your User model has it, otherwise omit
        "phone":    getattr(current_user, "phone", None) or "",
    }


@router.put("/profile")
def update_profile(
    body: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update name, market, and phone. Market is also auto-derived from phone."""
    if body.name is not None:
        current_user.name = body.name.strip()

    if body.phone is not None:
        phone = body.phone.strip()
        # Store phone if the column exists on the model
        if hasattr(current_user, "phone"):
            current_user.phone = phone
        # Auto-derive market from phone country code
        if phone:
            current_user.market = market_from_phone(phone)

    # Allow explicit market override (if no phone given, or phone didn't match)
    if body.market is not None and body.market in ["Uganda", "Nigeria", "Kenya", "South Africa"]:
        current_user.market = body.market

    db.commit()
    db.refresh(current_user)
    log.info("Profile updated for %s", current_user.email)
    return {
        "message": "Profile updated successfully",
        "user": {
            "id":     current_user.id,
            "name":   current_user.name,
            "email":  current_user.email,
            "market": current_user.market,
            "phone":  getattr(current_user, "phone", None) or "",
        },
    }


@router.put("/password")
def update_password(
    body: UpdatePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Change password for email-based accounts."""
    if current_user.provider == "google":
        raise HTTPException(
            status_code=400,
            detail="This account uses Google sign-in. Password changes are managed through Google.",
        )
    if not current_user.password_hash:
        raise HTTPException(status_code=400, detail="No password set on this account.")
    if not verify_password(body.current_password, current_user.password_hash):
        raise HTTPException(status_code=401, detail="Current password is incorrect.")
    if len(body.new_password) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters.")

    current_user.password_hash = hash_password(body.new_password)
    db.commit()
    log.info("Password changed for %s", current_user.email)
    return {"message": "Password updated successfully"}


@router.delete("/account")
def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Permanently delete the user's account and all their data."""
    from database import AnalysisHistory

    # Delete analysis history first (FK constraint)
    db.query(AnalysisHistory).filter(
        AnalysisHistory.user_id == current_user.id
    ).delete(synchronize_session=False)

    # Delete the user
    db.delete(current_user)
    db.commit()
    log.info("Account deleted: %s", current_user.email)
    return {"message": "Account deleted successfully"}


# ── OTP routes ─────────────────────────────────────────────────────────────────

@router.post("/send-otp")
def send_otp(body: SendOTPRequest):
    code = "".join(random.choices(string.digits, k=6))
    otp_store[body.email] = {"code": code, "expires_at": datetime.utcnow() + timedelta(minutes=1)}
    send_otp_email(body.email, body.name or "", code)
    return {"message": "Verification code sent. Check your email."}


@router.post("/verify-otp")
def verify_otp(body: VerifyOTPRequest, db: Session = Depends(get_db)):
    record = otp_store.get(body.email)
    if not record:
        log.warning("verify-otp: no record for %s", body.email)
        raise HTTPException(status_code=400, detail="Code not found or already used. Click 'Resend code' to get a new one.")
    if datetime.utcnow() > record["expires_at"]:
        otp_store.pop(body.email, None)
        raise HTTPException(status_code=400, detail="Code expired. Click Resend to get a fresh code.")
    if body.code.strip().replace(" ", "") != record["code"].strip():
        log.warning("verify-otp: wrong code for %s", body.email)
        raise HTTPException(status_code=400, detail="Incorrect code. Check your email and try again.")

    otp_store.pop(body.email, None)
    user = db.query(User).filter(User.email == body.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found. Please sign up again.")
    if hasattr(user, "email_verified"):
        user.email_verified = True
        db.commit()

    log.info("OTP verified for %s", body.email)
    token = create_token(user.id, user.email)
    return {"message": "Verified successfully", "token": token, "user": {"id": user.id, "name": user.name, "email": user.email, "market": user.market}}


@router.post("/resend-otp")
def resend_otp(body: SendOTPRequest):
    code = "".join(random.choices(string.digits, k=6))
    otp_store[body.email] = {"code": code, "expires_at": datetime.utcnow() + timedelta(minutes=1)}
    send_otp_email(body.email, body.name or "", code)
    return {"message": "New verification code sent."}


# ── Legacy route kept for backwards compat ─────────────────────────────────────
@router.post("/change-password")
def change_password(body: dict, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.get("email")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not verify_password(body.get("old_password", ""), user.password_hash):
        raise HTTPException(status_code=401, detail="Current password is incorrect")
    user.password_hash = hash_password(body.get("new_password", ""))
    db.commit()
    return {"message": "Password updated successfully"}