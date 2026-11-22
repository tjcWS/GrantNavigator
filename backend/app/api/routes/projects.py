from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.api.auth import CurrentUser
from app.api.deps import get_db, get_project_or_404
from app.crud import project as crud
from app.schemas.project import ProjectCreate, ProjectRead, ProjectUpdate

router = APIRouter(prefix="/projects", tags=["projects"])

@router.post("", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
def create_project(data: ProjectCreate, current_user: CurrentUser, db: Session = Depends(get_db)):
    return crud.create_project(db, data.model_copy(update={"owner_id": current_user.id}))

@router.get("", response_model=list[ProjectRead])
def read_projects(current_user: CurrentUser, owner_id: int | None = Query(default=None), db: Session = Depends(get_db)):
    if owner_id is not None and owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Проекты не найдены")
    return crud.list_projects(db, owner_id=current_user.id)

@router.get("/{project_id}", response_model=ProjectRead)
def read_project(project_id: int, current_user: CurrentUser, db: Session = Depends(get_db)):
    project = get_project_or_404(db, project_id)
    if project.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Проект не найден")
    return project

@router.patch("/{project_id}", response_model=ProjectRead)
def patch_project(project_id: int, data: ProjectUpdate, current_user: CurrentUser, db: Session = Depends(get_db)):
    project = get_project_or_404(db, project_id)
    if project.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Проект не найден")
    return crud.update_project(db, project, data)

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_project(project_id: int, current_user: CurrentUser, db: Session = Depends(get_db)):
    project = get_project_or_404(db, project_id)
    if project.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Проект не найден")
    crud.delete_project(db, project)
