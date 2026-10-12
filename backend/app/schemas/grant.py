from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.direction import DirectionRead


class GrantSectionBase(BaseModel):
    code: str = Field(min_length=1, max_length=50)
    title: str = Field(min_length=1, max_length=200)
    hint: str = Field(default="", max_length=500)
    order_index: int = 0


class GrantSectionCreate(GrantSectionBase):
    pass


class GrantSectionRead(GrantSectionBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


class GrantBase(BaseModel):
    title: str = Field(min_length=1, max_length=300)
    organizer: str = Field(min_length=1, max_length=300)
    short_description: str = Field(min_length=1, max_length=500)
    description: str = Field(min_length=1)
    requirements: list[str] = Field(default_factory=list)
    criteria: list[str] = Field(default_factory=list)
    tags: list[str] = Field(default_factory=list)
    funding: str = Field(min_length=1, max_length=100)
    deadline: date
    direction_ids: list[int] = Field(default_factory=list)


class GrantCreate(GrantBase):
    # Разделы заявки задаются сразу при создании конкурса
    sections: list[GrantSectionCreate] = Field(default_factory=list)


class GrantUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=300)
    organizer: str | None = Field(default=None, min_length=1, max_length=300)
    short_description: str | None = Field(default=None, min_length=1, max_length=500)
    description: str | None = Field(default=None, min_length=1)
    requirements: list[str] | None = None
    criteria: list[str] | None = None
    tags: list[str] | None = None
    funding: str | None = Field(default=None, min_length=1, max_length=100)
    deadline: date | None = None
    direction_ids: list[int] | None = None


class GrantRead(GrantBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    directions: list[DirectionRead] = Field(default_factory=list)
    sections: list[GrantSectionRead] = Field(default_factory=list)


class GrantListItem(BaseModel):
    # Облегчённая версия конкурса для списка/каталога, без описания и разделов.

    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    organizer: str
    short_description: str
    funding: str
    deadline: date
    tags: list[str]
    directions: list[DirectionRead] = Field(default_factory=list)
