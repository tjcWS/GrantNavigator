from datetime import date, datetime

from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, JSON, String, Table, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

grant_directions = Table(
    "grant_directions",
    Base.metadata,
    Column("grant_id", Integer, ForeignKey("grants.id", ondelete="CASCADE"), primary_key=True),
    Column("direction_id", Integer, ForeignKey("directions.id", ondelete="CASCADE"), primary_key=True),
)


class Grant(Base):
    # Грантовый конкурс

    __tablename__ = "grants"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    organizer: Mapped[str] = mapped_column(String(300), nullable=False)
    short_description: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)

    # Списки строк - это не самостоятельные сущности, а атрибуты самого конкурса,
    # поэтому храним их как JSON-списо
    requirements: Mapped[list[str]] = mapped_column(JSON, default=list)
    criteria: Mapped[list[str]] = mapped_column(JSON, default=list)
    tags: Mapped[list[str]] = mapped_column(JSON, default=list)

    funding: Mapped[str] = mapped_column(String(100), nullable=False)
    deadline: Mapped[date] = mapped_column(Date, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    directions = relationship("Direction", secondary=grant_directions, lazy="selectin")
    sections = relationship(
        "GrantSection", back_populates="grant", cascade="all, delete-orphan", order_by="GrantSection.order_index"
    )
    applications = relationship("Application", back_populates="grant")


class GrantSection(Base):
    # Раздел заявки, обязательный для конкретного конкурса (например, «Бюджет проекта»)

    __tablename__ = "grant_sections"
    __table_args__ = (
        # На один конкурс не может быть двух разделов с одинаковым кодом
        UniqueConstraint("grant_id", "code", name="uq_grant_section_code"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    grant_id: Mapped[int] = mapped_column(ForeignKey("grants.id", ondelete="CASCADE"), nullable=False)
    code: Mapped[str] = mapped_column(String(50), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    hint: Mapped[str] = mapped_column(String(500), default="")
    order_index: Mapped[int] = mapped_column(Integer, default=0)

    grant = relationship("Grant", back_populates="sections")
