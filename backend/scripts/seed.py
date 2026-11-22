"""Заполняет БД демонстрационными данными: направления, тестовый пользователь, конкурсы.

Запуск (после create_tables.py):
    python -m scripts.seed
"""
from datetime import date

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.direction import Direction
from app.models.grant import Grant, GrantSection
from app.models.user import ExperienceLevel, User

DIRECTIONS = [
    "Экология",
    "Образование",
    "Молодёжные инициативы",
    "Социальная поддержка",
    "Культура и искусство",
    "Наука и технологии",
]

DEFAULT_SECTIONS = [
    ("relevance", "Обоснование актуальности", "Опишите проблему и почему её нужно решать сейчас", 0),
    ("goals", "Цель и задачи", "Сформулируйте одну цель и 3–5 измеримых задач", 1),
    ("plan", "Календарный план", "Этапы проекта с датами и ответственными", 2),
    ("budget", "Бюджет проекта", "Основные статьи расходов с суммами", 3),
    ("results", "Ожидаемые результаты", "Количественные и качественные показатели", 4),
]


def seed() -> None:
    db = SessionLocal()
    try:
        directions = {}
        for name in DIRECTIONS:
            existing = db.query(Direction).filter_by(name=name).first()
            directions[name] = existing or Direction(name=name)
            if not existing:
                db.add(directions[name])
        db.commit()
        for d in directions.values():
            db.refresh(d)

        if not db.query(User).filter_by(login="anna_k").first():
            demo_user = User(
                first_name="Анна",
                last_name="Кузнецова",
                email="anna@example.com",
                login="anna_k",
                hashed_password=hash_password("password123"),
                activity_field="НКО и общественные организации",
                experience=ExperienceLevel.some,
                directions=[directions["Экология"], directions["Образование"]],
            )
            db.add(demo_user)

        if not db.query(Grant).filter_by(title="Зелёный вектор 2026").first():
            grant = Grant(
                title="Зелёный вектор 2026",
                organizer="Фонд экологических инициатив",
                short_description="Поддержка городских проектов по раздельному сбору отходов, озеленению и экопросвещению.",
                description=(
                    "Конкурс поддерживает проекты, которые улучшают состояние городской среды "
                    "и вовлекают жителей в заботу о природе."
                ),
                requirements=[
                    "Заявитель — НКО или инициативная группа от 3 человек",
                    "Срок реализации проекта — до 12 месяцев",
                ],
                criteria=["Актуальность и социальная значимость", "Измеримость результатов", "Реалистичность бюджета"],
                tags=["Экология", "Городская среда"],
                funding="до 1 500 000 ₽",
                deadline=date(2026, 12, 15),
                directions=[directions["Экология"]],
                sections=[GrantSection(code=c, title=t, hint=h, order_index=i) for c, t, h, i in DEFAULT_SECTIONS],
            )
            db.add(grant)

        if not db.query(Grant).filter_by(title="Цифровой класс").first():
            grant2 = Grant(
                title="Цифровой класс",
                organizer="Фонд развития образования",
                short_description="Гранты на образовательные платформы и инструменты цифрового обучения для школьников.",
                description="Конкурс направлен на создание и развитие цифровых образовательных решений.",
                requirements=["Заявитель — юридическое лицо или команда с юридическим партнёром"],
                criteria=["Образовательный эффект", "Масштабируемость", "Качество методики"],
                tags=["Образование", "EdTech"],
                funding="до 2 000 000 ₽",
                deadline=date(2027, 1, 20),
                directions=[directions["Образование"], directions["Наука и технологии"]],
                sections=[GrantSection(code=c, title=t, hint=h, order_index=i) for c, t, h, i in DEFAULT_SECTIONS],
            )
            db.add(grant2)

        db.commit()
        print("Демо-данные добавлены.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
