from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.user import ExperienceLevel
from app.schemas.direction import DirectionRead


class UserBase(BaseModel):
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    login: str = Field(min_length=3, max_length=100)
    activity_field: str | None = Field(default=None, max_length=200)
    experience: ExperienceLevel = ExperienceLevel.none
    direction_ids: list[int] = Field(default_factory=list)


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)


class UserUpdate(BaseModel):
    first_name: str | None = Field(default=None, min_length=1, max_length=100)
    last_name: str | None = Field(default=None, min_length=1, max_length=100)
    email: EmailStr | None = None
    login: str | None = Field(default=None, min_length=3, max_length=100)
    activity_field: str | None = Field(default=None, max_length=200)
    experience: ExperienceLevel | None = None
    direction_ids: list[int] | None = None
    password: str | None = Field(default=None, min_length=8, max_length=128)


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    first_name: str
    last_name: str
    email: EmailStr
    login: str
    activity_field: str | None
    experience: ExperienceLevel
    directions: list[DirectionRead] = Field(default_factory=list)
    created_at: datetime
