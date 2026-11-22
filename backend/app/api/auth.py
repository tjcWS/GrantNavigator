"""Проверка access JWT и получение текущего пользователя."""
from typing import Annotated
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User

bearer = HTTPBearer(auto_error=False)

def get_current_user(credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)], db: Session = Depends(get_db)) -> User:
    unauthorized = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Требуется авторизация", headers={"WWW-Authenticate": "Bearer"})
    if credentials is None:
        raise unauthorized
    try:
        user_id = decode_access_token(credentials.credentials)
    except (jwt.InvalidTokenError, ValueError, KeyError, TypeError):
        raise unauthorized
    user = db.get(User, user_id)
    if user is None:
        raise unauthorized
    return user

CurrentUser = Annotated[User, Depends(get_current_user)]
