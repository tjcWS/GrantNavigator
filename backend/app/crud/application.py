from sqlalchemy.orm import Session

from app.models.application import Application, ApplicationAnswer
from app.models.check import CheckIssue, CheckResult, CheckSeverity
from app.models.grant import Grant
from app.schemas.application import ApplicationCreate, ApplicationUpdate


def get_application(db: Session, application_id: int) -> Application | None:
    return db.get(Application, application_id)


def list_applications(db: Session, owner_id: int | None = None) -> list[Application]:
    query = db.query(Application)
    if owner_id is not None:
        query = query.filter(Application.owner_id == owner_id)
    return query.order_by(Application.updated_at.desc()).all()


def create_application(db: Session, data: ApplicationCreate) -> Application:
    application = Application(**data.model_dump())
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


def update_application(db: Session, application: Application, data: ApplicationUpdate) -> Application:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(application, field, value)
    db.commit()
    db.refresh(application)
    return application


def delete_application(db: Session, application: Application) -> None:
    db.delete(application)
    db.commit()


def save_answers(db: Session, application: Application, content: dict[int, str]) -> Application:
    # Сохраняет ответы по разделам: обновляет существующие и создаёт недостающие
    existing = {a.section_id: a for a in application.answers}
    for section_id, text in content.items():
        if section_id in existing:
            existing[section_id].content = text
        else:
            db.add(ApplicationAnswer(application_id=application.id, section_id=section_id, content=text))
    db.commit()
    db.refresh(application)
    return application


def latest_check(application: Application) -> CheckResult | None:
    return application.checks[0] if application.checks else None


def run_ai_check(db: Session, application: Application, grant: Grant) -> CheckResult:
    # Демонстрационная ИИ-проверка: пустой раздел: ошибка, короткий (<200 симв.): предупреждение
    answers_by_section = {a.section_id: a.content for a in application.answers}
    issues: list[CheckIssue] = []
    points = 0.0

    for section in grant.sections:
        text = (answers_by_section.get(section.id) or "").strip()
        if len(text) == 0:
            severity = CheckSeverity.error
            message = "Раздел не заполнен. Он обязателен по требованиям конкурса."
        elif len(text) < 200:
            severity = CheckSeverity.warning
            message = f"Раздел раскрыт слишком кратко ({len(text)} симв.). Добавьте цифры, сроки и примеры."
            points += 0.5
        else:
            severity = CheckSeverity.ok
            message = "Раздел заполнен достаточно подробно."
            points += 1

        issues.append(CheckIssue(section_title=section.title, severity=severity, message=message))

    score = round((points / len(grant.sections)) * 100) if grant.sections else 0

    recommendations = [
        f"Заполните раздел «{issue.section_title}»." if issue.severity == CheckSeverity.error
        else f"Дополните раздел «{issue.section_title}» конкретными фактами."
        for issue in issues
        if issue.severity != CheckSeverity.ok
    ]
    if grant.criteria:
        recommendations.append(f"Проверьте, что заявка отвечает критерию конкурса: «{grant.criteria[0]}».")

    result = CheckResult(application_id=application.id, score=score, recommendations=recommendations, issues=issues)
    db.add(result)
    db.commit()
    db.refresh(result)
    return result
