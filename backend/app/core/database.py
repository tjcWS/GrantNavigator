from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import get_settings

settings = get_settings()

# pool_pre_ping проверяет соединение перед использованием — полезно,
# если PostgreSQL перезапускался, а приложение продолжает работать
engine = create_engine(settings.database_url, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    # Базовый класс для всех моделей SQLAlchemy
    pass


def get_db():
    # FastAPI-зависимость: даёт сессию БД на один запрос и закрывает её после
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
