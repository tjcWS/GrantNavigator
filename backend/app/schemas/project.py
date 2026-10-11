from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ProjectBase(BaseModel):
    title: str = Field(min_length=1, max_length=300)
    short_description: str = Field(default="", max_length=500)
    full_description: str = Field(default="")
    goals: str = Field(default="")
    tasks: str = Field(default="")
    audience: str = Field(default="")
    results: str = Field(default="")


class ProjectCreate(ProjectBase):
    owner_id: int


class ProjectUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=300)
    short_description: str | None = Field(default=None, max_length=500)
    full_description: str | None = None
    goals: str | None = None
    tasks: str | None = None
    audience: str | None = None
    results: str | None = None


class ProjectRead(ProjectBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime
