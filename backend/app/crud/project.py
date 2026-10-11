from sqlalchemy.orm import Session

from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate


def get_project(db: Session, project_id: int) -> Project | None:
    return db.get(Project, project_id)


def list_projects(db: Session, owner_id: int | None = None) -> list[Project]:
    query = db.query(Project)
    if owner_id is not None:
        query = query.filter(Project.owner_id == owner_id)
    return query.order_by(Project.updated_at.desc()).all()


def create_project(db: Session, data: ProjectCreate) -> Project:
    project = Project(**data.model_dump())
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


def update_project(db: Session, project: Project, data: ProjectUpdate) -> Project:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(project, field, value)
    db.commit()
    db.refresh(project)
    return project


def delete_project(db: Session, project: Project) -> None:
    db.delete(project)
    db.commit()
