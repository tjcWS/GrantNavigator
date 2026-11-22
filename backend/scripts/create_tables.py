"""Создаёт все таблицы в БД, на которую указывает DATABASE_URL.

Запуск:
    python -m scripts.create_tables
"""
from app.core.database import Base, engine
import app.models  # noqa: F401  — чтобы все модели зарегистрировались в Base.metadata

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    print("Таблицы созданы (или уже существовали).")
