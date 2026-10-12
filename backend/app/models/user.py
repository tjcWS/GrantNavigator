import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.direction import user_directions


class ExperienceLevel(str, enum.Enum):
    none = "none"
    some = "some"
    expert = "expert"


class User(Base):
    # Пользователь приложения

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    login: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    activity_field: Mapped[str | None] = mapped_column(String(200), nullable=True)
    experience: Mapped[ExperienceLevel] = mapped_column(
        Enum(ExperienceLevel, name="experience_level"), default=ExperienceLevel.none, nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    directions = relationship("Direction", secondary=user_directions, lazy="selectin")
    projects = relationship("Project", back_populates="owner", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="owner", cascade="all, delete-orphan")
