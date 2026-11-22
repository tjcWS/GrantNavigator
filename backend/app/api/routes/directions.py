from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.crud import direction as crud
from app.schemas.direction import DirectionRead

router = APIRouter(prefix="/directions", tags=["directions"])


@router.get("", response_model=list[DirectionRead])
def read_directions(db: Session = Depends(get_db)):
    return crud.list_directions(db)
