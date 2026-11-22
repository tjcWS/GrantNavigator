from sqlalchemy import Column, ForeignKey, Integer, String, Table

from app.core.database import Base

# Связь "многие ко многим" между пользователями и направлениями грантов.
# Своего класса не требует, это просто таблица-посредник с двумя внешними ключами.
user_directions = Table(
    "user_directions",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("direction_id", Integer, ForeignKey("directions.id", ondelete="CASCADE"), primary_key=True),
)


class Direction(Base):
    # Справочник направлений грантов (Экология, Образование и т.д.)

    __tablename__ = "directions"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True, nullable=False)
