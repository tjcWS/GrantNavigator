from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_user_or_404
from app.crud import user as crud
from app.schemas.user import UserCreate, UserRead, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.post("", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(data: UserCreate, db: Session = Depends(get_db)):
    if crud.get_user_by_email_or_login(db, data.email, data.login):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Пользователь с таким email или логином уже существует")
    return crud.create_user(db, data)


@router.get("", response_model=list[UserRead])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.list_users(db, skip, limit)


@router.get("/{user_id}", response_model=UserRead)
def read_user(user_id: int, db: Session = Depends(get_db)):
    return get_user_or_404(db, user_id)


@router.patch("/{user_id}", response_model=UserRead)
def patch_user(user_id: int, data: UserUpdate, db: Session = Depends(get_db)):
    user = get_user_or_404(db, user_id)
    return crud.update_user(db, user, data)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_user(user_id: int, db: Session = Depends(get_db)):
    user = get_user_or_404(db, user_id)
    crud.delete_user(db, user)
