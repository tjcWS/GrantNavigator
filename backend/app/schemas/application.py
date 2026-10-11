from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.application import ApplicationStatus
from app.schemas.check import CheckResultRead


class ApplicationAnswerRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    section_id: int
    content: str
    updated_at: datetime


class ApplicationAnswersUpdate(BaseModel):
    # Тело запроса для сохранения ответов: {id_раздела: текст}.

    content: dict[int, str] = Field(default_factory=dict)


class ApplicationBase(BaseModel):
    title: str = Field(min_length=1, max_length=300)


class ApplicationCreate(ApplicationBase):
    grant_id: int
    project_id: int
    owner_id: int


class ApplicationUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=300)
    status: ApplicationStatus | None = None


class ApplicationRead(ApplicationBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    grant_id: int
    project_id: int
    owner_id: int
    status: ApplicationStatus
    created_at: datetime
    updated_at: datetime
    answers: list[ApplicationAnswerRead] = Field(default_factory=list)
    latest_check: CheckResultRead | None = None
