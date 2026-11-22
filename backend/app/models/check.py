import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, JSON, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class CheckSeverity(str, enum.Enum):
    error = "error"
    warning = "warning"
    ok = "ok"


class CheckResult(Base):
    # Результат одного запуска ИИ-проверки заявки. История проверок хранится (не затирается)

    __tablename__ = "check_results"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    application_id: Mapped[int] = mapped_column(ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False)
    recommendations: Mapped[list[str]] = mapped_column(JSON, default=list)
    checked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    application = relationship("Application", back_populates="checks")
    issues = relationship("CheckIssue", back_populates="check_result", cascade="all, delete-orphan")


class CheckIssue(Base):
    # Одна строка результата проверки: что не так с конкретным разделом заявки.

    __tablename__ = "check_issues"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    check_result_id: Mapped[int] = mapped_column(ForeignKey("check_results.id", ondelete="CASCADE"), nullable=False)
    section_title: Mapped[str] = mapped_column(String(200), nullable=False)
    severity: Mapped[CheckSeverity] = mapped_column(Enum(CheckSeverity, name="check_severity"), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)

    check_result = relationship("CheckResult", back_populates="issues")
