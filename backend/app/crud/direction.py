from sqlalchemy.orm import Session

from app.models.direction import Direction


def list_directions(db: Session) -> list[Direction]:
    return db.query(Direction).order_by(Direction.name).all()


def get_directions_by_ids(db: Session, ids: list[int]) -> list[Direction]:
    if not ids:
        return []
    return db.query(Direction).filter(Direction.id.in_(ids)).all()
