"""Хеширование паролей и выпуск access/refresh-токенов."""
from datetime import datetime, timedelta, timezone
import hashlib
import secrets

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerificationError, InvalidHashError
try:
    from passlib.context import CryptContext
except ImportError:  # используется только для совместимости со старыми bcrypt-хешами
    CryptContext = None

from app.core.config import get_settings

_password_hasher = PasswordHasher()
_legacy_bcrypt = CryptContext(schemes=["bcrypt"], deprecated="auto") if CryptContext else None
ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    return _password_hasher.hash(password)


def verify_password(password: str, stored_hash: str) -> bool:
    # В исходной лабораторной №2 использовался bcrypt. Поддерживаем старые записи
    # и переводим их на Argon2id после успешной авторизации.
    if stored_hash.startswith(("$2a$", "$2b$", "$2y$")):
        if _legacy_bcrypt is None:
            return False
        try:
            return bool(_legacy_bcrypt.verify(password, stored_hash))
        except (ValueError, TypeError):
            return False
    try:
        return bool(_password_hasher.verify(stored_hash, password))
    except (VerificationError, InvalidHashError, ValueError, TypeError):
        return False


def is_legacy_password_hash(stored_hash: str) -> bool:
    return stored_hash.startswith(("$2a$", "$2b$", "$2y$"))


def create_access_token(user_id: int) -> tuple[str, datetime]:
    settings = get_settings()
    now = datetime.now(timezone.utc)
    expires = now + timedelta(minutes=settings.access_token_minutes)
    token = jwt.encode({"sub": str(user_id), "iat": now, "exp": expires, "type": "access"}, settings.jwt_secret, algorithm=ALGORITHM)
    return token, expires


def decode_access_token(token: str) -> int:
    settings = get_settings()
    payload = jwt.decode(token, settings.jwt_secret, algorithms=[ALGORITHM])
    if payload.get("type") != "access":
        raise jwt.InvalidTokenError("Invalid token type")
    return int(payload["sub"])


def create_refresh_token() -> str:
    return secrets.token_urlsafe(48)


def hash_refresh_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def refresh_expiry() -> datetime:
    return datetime.now(timezone.utc) + timedelta(days=get_settings().refresh_token_days)
