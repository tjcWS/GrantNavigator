# Импортируем все модели в одном месте, чтобы Base.metadata "видела" их все
# при создании таблиц (см. scripts/create_tables.py).
from app.core.database import Base
from app.models.user import User
from app.models.direction import Direction, user_directions
from app.models.grant import Grant, GrantSection, grant_directions
from app.models.project import Project
from app.models.application import Application, ApplicationAnswer, ApplicationStatus
from app.models.check import CheckResult, CheckIssue, CheckSeverity

__all__ = [
    "Base",
    "User",
    "Direction",
    "user_directions",
    "Grant",
    "GrantSection",
    "grant_directions",
    "Project",
    "Application",
    "ApplicationAnswer",
    "ApplicationStatus",
    "CheckResult",
    "CheckIssue",
    "CheckSeverity",
]
