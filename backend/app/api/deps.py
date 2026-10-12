from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db  # re-export, чтобы роуты импортировали всё из одного места
from app.models.application import Application
from app.models.grant import Grant
from app.models.project import Project
from app.models.user import User

__all__ = ["get_db", "get_user_or_404", "get_grant_or_404", "get_project_or_404", "get_application_or_404"]


def get_user_or_404(db: Session, user_id: int) -> User:
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден")
    return user


def get_grant_or_404(db: Session, grant_id: int) -> Grant:
    grant = db.get(Grant, grant_id)
    if grant is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Конкурс не найден")
    return grant


def get_project_or_404(db: Session, project_id: int) -> Project:
    project = db.get(Project, project_id)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Проект не найден")
    return project


def get_application_or_404(db: Session, application_id: int) -> Application:
    application = db.get(Application, application_id)
    if application is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Заявка не найдена")
    return application
