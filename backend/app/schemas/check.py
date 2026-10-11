from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.check import CheckSeverity


class CheckIssueRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    section_title: str
    severity: CheckSeverity
    message: str


class CheckResultRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    score: int = Field(ge=0, le=100)
    recommendations: list[str]
    checked_at: datetime
    issues: list[CheckIssueRead] = Field(default_factory=list)
