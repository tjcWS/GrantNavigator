from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_grant_or_404
from app.crud import grant as crud
from app.schemas.grant import GrantCreate, GrantListItem, GrantRead, GrantUpdate

router = APIRouter(prefix="/grants", tags=["grants"])


@router.post("", response_model=GrantRead, status_code=status.HTTP_201_CREATED)
def create_grant(data: GrantCreate, db: Session = Depends(get_db)):
    return crud.create_grant(db, data)


@router.get("", response_model=list[GrantListItem])
def read_grants(
    search: str | None = Query(default=None, description="Поиск по названию, организатору, описанию"),
    direction_id: int | None = Query(default=None, description="Фильтр по направлению"),
    db: Session = Depends(get_db),
):
    return crud.list_grants(db, search=search, direction_id=direction_id)


@router.get("/{grant_id}", response_model=GrantRead)
def read_grant(grant_id: int, db: Session = Depends(get_db)):
    return get_grant_or_404(db, grant_id)


@router.patch("/{grant_id}", response_model=GrantRead)
def patch_grant(grant_id: int, data: GrantUpdate, db: Session = Depends(get_db)):
    grant = get_grant_or_404(db, grant_id)
    return crud.update_grant(db, grant, data)


@router.delete("/{grant_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_grant(grant_id: int, db: Session = Depends(get_db)):
    grant = get_grant_or_404(db, grant_id)
    crud.delete_grant(db, grant)
