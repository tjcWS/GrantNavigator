from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError

from app.api.routes import applications, directions, grants, projects, users
from app.core.config import get_settings

settings = get_settings()

app = FastAPI(title=settings.app_name, debug=settings.debug)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(IntegrityError)
def handle_integrity_error(request, exc: IntegrityError):
    # Срабатывает, например, при попытке создать второго пользователя с тем же email
    return JSONResponse(status_code=409, content={"detail": "Нарушено ограничение целостности данных (возможно, значение уже занято)"})


@app.exception_handler(RequestValidationError)
def handle_validation_error(request, exc: RequestValidationError):
    # Делаем сообщение об ошибке валидации чуть понятнее стандартного
    return JSONResponse(status_code=422, content={"detail": "Некорректные данные запроса", "errors": exc.errors()})


app.include_router(directions.router)
app.include_router(users.router)
app.include_router(grants.router)
app.include_router(projects.router)
app.include_router(applications.router)


@app.get("/health", tags=["service"])
def health_check():
    return {"status": "ok", "app": settings.app_name}
