import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ApplicationStatus(str, enum.Enum):
    preparation = "preparation"
    ready = "ready"
    submitted = "submitted"
    review = "review"
    result = "result"


class Application(Base):
    # Заявка: связывает конкретный проект с конкретным конкурсом.

    __tablename__ = "applications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    grant_id: Mapped[int] = mapped_column(ForeignKey("grants.id", ondelete="CASCADE"), nullable=False)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    title: Mapped[str] = mapped_column(String(300), nullable=False)
    status: Mapped[ApplicationStatus] = mapped_column(
        Enum(ApplicationStatus, name="application_status"), default=ApplicationStatus.preparation, nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    grant = relationship("Grant", back_populates="applications")
    project = relationship("Project", back_populates="applications")
    owner = relationship("User", back_populates="applications")
    answers = relationship("ApplicationAnswer", back_populates="application", cascade="all, delete-orphan")
    checks = relationship(
        "CheckResult", back_populates="application", cascade="all, delete-orphan", order_by="CheckResult.checked_at.desc()"
    )


class ApplicationAnswer(Base):
    # Текст, который пользователь вписал в один раздел заявки.

    __tablename__ = "application_answers"
    __table_args__ = (UniqueConstraint("application_id", "section_id", name="uq_answer_per_section"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    application_id: Mapped[int] = mapped_column(ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    section_id: Mapped[int] = mapped_column(ForeignKey("grant_sections.id", ondelete="CASCADE"), nullable=False)
    content: Mapped[str] = mapped_column(Text, default="")

    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    application = relationship("Application", back_populates="answers")
    section = relationship("GrantSection")
