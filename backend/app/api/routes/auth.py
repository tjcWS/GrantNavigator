"""Регистрация, вход, ротация refresh, текущий пользователь и выход."""
from datetime import datetime, timezone
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session
from app.api.auth import CurrentUser
from app.core.database import get_db
from app.core.security import (create_access_token, create_refresh_token, hash_password, hash_refresh_token, refresh_expiry, verify_password, is_legacy_password_hash)
from app.crud.user import create_user, get_user_by_email_or_login
from app.models import RefreshSession, User
from app.schemas.user import UserCreate, UserRead

router = APIRouter(prefix="/auth", tags=["authentication"])
Db = Annotated[Session, Depends(get_db)]

class LoginPayload(BaseModel):
    login: str = Field(min_length=1, max_length=255)
    password: str = Field(min_length=1, max_length=128)
class RefreshPayload(BaseModel):
    refresh_token: str = Field(min_length=20)
class TokenPair(BaseModel):
    access_token: str
    token_type: str = "bearer"
    access_expires_at: datetime
    refresh_token: str
    refresh_expires_at: datetime
    user: UserRead


def issue_pair(db: Session, user: User) -> TokenPair:
    access, access_exp = create_access_token(user.id)
    refresh = create_refresh_token()
    refresh_exp = refresh_expiry()
    db.add(RefreshSession(user_id=user.id, token_hash=hash_refresh_token(refresh), expires_at=refresh_exp))
    db.commit()
    db.refresh(user)
    return TokenPair(access_token=access, access_expires_at=access_exp, refresh_token=refresh, refresh_expires_at=refresh_exp, user=user)

@router.post("/register", response_model=TokenPair, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Db):
    if get_user_by_email_or_login(db, str(payload.email), payload.login):
        raise HTTPException(status_code=409, detail="Пользователь с таким email или логином уже существует")
    user = create_user(db, payload)
    return issue_pair(db, user)

@router.post("/login", response_model=TokenPair)
def login(payload: LoginPayload, db: Db):
    value = payload.login.strip().lower()
    user = db.scalar(select(User).where(or_(func.lower(User.login) == value, func.lower(User.email) == value)))
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Неверный логин или пароль")
    if is_legacy_password_hash(user.hashed_password):
        user.hashed_password = hash_password(payload.password)
        db.commit()
    return issue_pair(db, user)

@router.post("/refresh", response_model=TokenPair)
def refresh(payload: RefreshPayload, db: Db):
    session = db.scalar(select(RefreshSession).where(RefreshSession.token_hash == hash_refresh_token(payload.refresh_token)).with_for_update())
    now = datetime.now(timezone.utc)
    if session is None or session.revoked_at is not None:
        raise HTTPException(status_code=401, detail="Refresh-токен недействителен или отозван")
    expires = session.expires_at
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    if expires <= now:
        session.revoked_at = now
        db.commit()
        raise HTTPException(status_code=401, detail="Срок действия refresh-токена истёк")
    user = db.get(User, session.user_id)
    if user is None:
        session.revoked_at = now
        db.commit()
        raise HTTPException(status_code=401, detail="Пользователь не найден")
    session.revoked_at = now
    db.flush()
    return issue_pair(db, user)

@router.post("/logout", status_code=204)
def logout(payload: RefreshPayload, db: Db, current_user: CurrentUser):
    session = db.scalar(select(RefreshSession).where(RefreshSession.token_hash == hash_refresh_token(payload.refresh_token)))
    if session and session.user_id == current_user.id and session.revoked_at is None:
        session.revoked_at = datetime.now(timezone.utc)
        db.commit()

@router.get("/me", response_model=UserRead)
def me(current_user: CurrentUser):
    return current_user
