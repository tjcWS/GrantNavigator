from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.api.auth import CurrentUser
from app.api.deps import get_db
from app.crud import user as crud
from app.schemas.user import UserRead, UserUpdate
from app.core.security import hash_password, verify_password

router = APIRouter(prefix="/users", tags=["users"])

class PasswordChange(BaseModel):
    old_password: str = Field(min_length=1, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)

@router.get("/me", response_model=UserRead)
def read_me(current_user: CurrentUser):
    return current_user

@router.patch("/me", response_model=UserRead)
def patch_me(data: UserUpdate, current_user: CurrentUser, db: Session = Depends(get_db)):
    return crud.update_user(db, current_user, data)

@router.patch("/me/password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(data: PasswordChange, current_user: CurrentUser, db: Session = Depends(get_db)):
    if not verify_password(data.old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Текущий пароль указан неверно")
    current_user.hashed_password = hash_password(data.new_password)
    db.commit()

# Старый адрес лабораторной №2 оставлен для обратной совместимости, но только для своего профиля.
@router.get("/{user_id}", response_model=UserRead)
def read_user(user_id: int, current_user: CurrentUser):
    if user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    return current_user

@router.patch("/{user_id}", response_model=UserRead)
def patch_user(user_id: int, data: UserUpdate, current_user: CurrentUser, db: Session = Depends(get_db)):
    if user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    return crud.update_user(db, current_user, data)
