from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.api.auth import CurrentUser
from app.api.deps import get_application_or_404, get_db, get_grant_or_404, get_project_or_404
from app.crud import application as crud
from app.models.application import Application, ApplicationStatus
from app.schemas.application import ApplicationAnswersUpdate, ApplicationCreate, ApplicationRead, ApplicationUpdate
from app.schemas.check import CheckResultRead

router = APIRouter(prefix="/applications", tags=["applications"])

def _owned(application_id: int, db: Session, user_id: int):
    application = get_application_or_404(db, application_id)
    if application.owner_id != user_id:
        raise HTTPException(status_code=404, detail="Заявка не найдена")
    return application

def _to_read(application) -> ApplicationRead:
    data = ApplicationRead.model_validate(application)
    latest = crud.latest_check(application)
    data.latest_check = CheckResultRead.model_validate(latest) if latest else None
    return data

@router.post("", response_model=ApplicationRead, status_code=status.HTTP_201_CREATED)
def create_application(data: ApplicationCreate, current_user: CurrentUser, db: Session = Depends(get_db)):
    get_grant_or_404(db, data.grant_id)
    project = get_project_or_404(db, data.project_id)
    if project.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Проект не найден")
    duplicate = db.query(Application).filter_by(project_id=data.project_id, grant_id=data.grant_id, owner_id=current_user.id).first()
    if duplicate:
        raise HTTPException(status_code=409, detail="Заявка этого проекта на выбранный конкурс уже существует")
    payload = data.model_copy(update={"owner_id": current_user.id})
    return _to_read(crud.create_application(db, payload))

@router.get("", response_model=list[ApplicationRead])
def read_applications(current_user: CurrentUser, owner_id: int | None = Query(default=None), db: Session = Depends(get_db)):
    if owner_id is not None and owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Заявки не найдены")
    return [_to_read(a) for a in crud.list_applications(db, owner_id=current_user.id)]

@router.get("/{application_id}", response_model=ApplicationRead)
def read_application(application_id: int, current_user: CurrentUser, db: Session = Depends(get_db)):
    return _to_read(_owned(application_id, db, current_user.id))

@router.patch("/{application_id}", response_model=ApplicationRead)
def patch_application(application_id: int, data: ApplicationUpdate, current_user: CurrentUser, db: Session = Depends(get_db)):
    application = _owned(application_id, db, current_user.id)
    if data.status is not None and data.status != ApplicationStatus.preparation:
        answers = {answer.section_id: (answer.content or "").strip() for answer in application.answers}
        missing = [section.title for section in application.grant.sections if not answers.get(section.id)]
        if missing:
            raise HTTPException(status_code=400, detail="Нельзя изменить статус: заполните обязательные разделы — " + ", ".join(missing))
    return _to_read(crud.update_application(db, application, data))

@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_application(application_id: int, current_user: CurrentUser, db: Session = Depends(get_db)):
    crud.delete_application(db, _owned(application_id, db, current_user.id))

@router.put("/{application_id}/answers", response_model=ApplicationRead)
def save_answers(application_id: int, data: ApplicationAnswersUpdate, current_user: CurrentUser, db: Session = Depends(get_db)):
    application = _owned(application_id, db, current_user.id)
    valid_section_ids = {s.id for s in application.grant.sections}
    unknown = set(data.content) - valid_section_ids
    if unknown:
        raise HTTPException(status_code=400, detail=f"Разделы с id {sorted(unknown)} не относятся к конкурсу этой заявки")
    return _to_read(crud.save_answers(db, application, data.content))

@router.post("/{application_id}/check", response_model=CheckResultRead)
def run_check(application_id: int, current_user: CurrentUser, db: Session = Depends(get_db)):
    application = _owned(application_id, db, current_user.id)
    if not application.grant.sections:
        raise HTTPException(status_code=400, detail="У конкурса не заданы разделы заявки")
    return crud.run_ai_check(db, application, application.grant)

@router.get("/{application_id}/check", response_model=CheckResultRead | None)
def read_latest_check(application_id: int, current_user: CurrentUser, db: Session = Depends(get_db)):
    return crud.latest_check(_owned(application_id, db, current_user.id))
