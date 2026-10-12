from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.crud.direction import get_directions_by_ids
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate


def get_user(db: Session, user_id: int) -> User | None:
    return db.get(User, user_id)


def get_user_by_email_or_login(db: Session, email: str, login: str) -> User | None:
    return db.query(User).filter((User.email == email) | (User.login == login)).first()


def list_users(db: Session, skip: int = 0, limit: int = 100) -> list[User]:
    return db.query(User).order_by(User.id).offset(skip).limit(limit).all()


def create_user(db: Session, data: UserCreate) -> User:
    user = User(
        first_name=data.first_name,
        last_name=data.last_name,
        email=data.email,
        login=data.login,
        hashed_password=hash_password(data.password),
        activity_field=data.activity_field,
        experience=data.experience,
        directions=get_directions_by_ids(db, data.direction_ids),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user(db: Session, user: User, data: UserUpdate) -> User:
    payload = data.model_dump(exclude_unset=True)
    direction_ids = payload.pop("direction_ids", None)
    password = payload.pop("password", None)

    for field, value in payload.items():
        setattr(user, field, value)
    if password:
        user.hashed_password = hash_password(password)
    if direction_ids is not None:
        user.directions = get_directions_by_ids(db, direction_ids)

    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user: User) -> None:
    db.delete(user)
    db.commit()
