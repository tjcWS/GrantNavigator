from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_project_or_404
from app.crud import project as crud
from app.schemas.project import ProjectCreate, ProjectRead, ProjectUpdate

router = APIRouter(prefix="/projects", tags=["projects"])


@router.post("", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
def create_project(data: ProjectCreate, db: Session = Depends(get_db)):
    return crud.create_project(db, data)


@router.get("", response_model=list[ProjectRead])
def read_projects(owner_id: int | None = Query(default=None), db: Session = Depends(get_db)):
    return crud.list_projects(db, owner_id=owner_id)


@router.get("/{project_id}", response_model=ProjectRead)
def read_project(project_id: int, db: Session = Depends(get_db)):
    return get_project_or_404(db, project_id)


@router.patch("/{project_id}", response_model=ProjectRead)
def patch_project(project_id: int, data: ProjectUpdate, db: Session = Depends(get_db)):
    project = get_project_or_404(db, project_id)
    return crud.update_project(db, project, data)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_project(project_id: int, db: Session = Depends(get_db)):
    project = get_project_or_404(db, project_id)
    crud.delete_project(db, project)
