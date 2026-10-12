from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_application_or_404, get_db, get_grant_or_404, get_project_or_404, get_user_or_404
from app.crud import application as crud
from app.schemas.application import (
    ApplicationAnswersUpdate,
    ApplicationCreate,
    ApplicationRead,
    ApplicationUpdate,
)
from app.schemas.check import CheckResultRead

router = APIRouter(prefix="/applications", tags=["applications"])


def _to_read(application) -> ApplicationRead:
    # latest_check не является полем модели, поэтому собираем ответ вручную,
    # чтобы в него попал самый свежий результат проверки (или None, если её ещё не было)
    data = ApplicationRead.model_validate(application)
    latest = crud.latest_check(application)
    data.latest_check = CheckResultRead.model_validate(latest) if latest else None
    return data


@router.post("", response_model=ApplicationRead, status_code=status.HTTP_201_CREATED)
def create_application(data: ApplicationCreate, db: Session = Depends(get_db)):
    get_grant_or_404(db, data.grant_id)
    get_project_or_404(db, data.project_id)
    get_user_or_404(db, data.owner_id)
    application = crud.create_application(db, data)
    return _to_read(application)


@router.get("", response_model=list[ApplicationRead])
def read_applications(owner_id: int | None = Query(default=None), db: Session = Depends(get_db)):
    return [_to_read(a) for a in crud.list_applications(db, owner_id=owner_id)]


@router.get("/{application_id}", response_model=ApplicationRead)
def read_application(application_id: int, db: Session = Depends(get_db)):
    return _to_read(get_application_or_404(db, application_id))


@router.patch("/{application_id}", response_model=ApplicationRead)
def patch_application(application_id: int, data: ApplicationUpdate, db: Session = Depends(get_db)):
    application = get_application_or_404(db, application_id)
    return _to_read(crud.update_application(db, application, data))


@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_application(application_id: int, db: Session = Depends(get_db)):
    application = get_application_or_404(db, application_id)
    crud.delete_application(db, application)


@router.put("/{application_id}/answers", response_model=ApplicationRead)
def save_answers(application_id: int, data: ApplicationAnswersUpdate, db: Session = Depends(get_db)):
    application = get_application_or_404(db, application_id)
    valid_section_ids = {s.id for s in application.grant.sections}
    unknown = set(data.content) - valid_section_ids
    if unknown:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Разделы с id {sorted(unknown)} не относятся к конкурсу этой заявки",
        )
    application = crud.save_answers(db, application, data.content)
    return _to_read(application)


@router.post("/{application_id}/check", response_model=CheckResultRead)
def run_check(application_id: int, db: Session = Depends(get_db)):
    application = get_application_or_404(db, application_id)
    if not application.grant.sections:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="У конкурса не заданы разделы заявки")
    return crud.run_ai_check(db, application, application.grant)


@router.get("/{application_id}/check", response_model=CheckResultRead | None)
def read_latest_check(application_id: int, db: Session = Depends(get_db)):
    application = get_application_or_404(db, application_id)
    return crud.latest_check(application)
