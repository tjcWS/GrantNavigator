from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.crud.direction import get_directions_by_ids
from app.models.grant import Grant, GrantSection
from app.schemas.grant import GrantCreate, GrantUpdate


def get_grant(db: Session, grant_id: int) -> Grant | None:
    return db.get(Grant, grant_id)


def list_grants(db: Session, search: str | None = None, direction_id: int | None = None) -> list[Grant]:
    query = db.query(Grant)
    if search:
        like = f"%{search}%"
        query = query.filter(or_(Grant.title.ilike(like), Grant.organizer.ilike(like), Grant.short_description.ilike(like)))
    if direction_id:
        query = query.filter(Grant.directions.any(id=direction_id))
    return query.order_by(Grant.deadline).all()


def create_grant(db: Session, data: GrantCreate) -> Grant:
    grant = Grant(
        title=data.title,
        organizer=data.organizer,
        short_description=data.short_description,
        description=data.description,
        requirements=data.requirements,
        criteria=data.criteria,
        tags=data.tags,
        funding=data.funding,
        deadline=data.deadline,
        directions=get_directions_by_ids(db, data.direction_ids),
        sections=[
            GrantSection(code=s.code, title=s.title, hint=s.hint, order_index=s.order_index) for s in data.sections
        ],
    )
    db.add(grant)
    db.commit()
    db.refresh(grant)
    return grant


def update_grant(db: Session, grant: Grant, data: GrantUpdate) -> Grant:
    payload = data.model_dump(exclude_unset=True)
    direction_ids = payload.pop("direction_ids", None)

    for field, value in payload.items():
        setattr(grant, field, value)
    if direction_ids is not None:
        grant.directions = get_directions_by_ids(db, direction_ids)

    db.commit()
    db.refresh(grant)
    return grant


def delete_grant(db: Session, grant: Grant) -> None:
    db.delete(grant)
    db.commit()
