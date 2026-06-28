from datetime import datetime
from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Categoria(Base):
    __tablename__ = "categorias"

    id: Mapped[int] = mapped_column(primary_key=True)
    nome: Mapped[str] = mapped_column(String(100))
    # cor em hex (#RRGGBB) — usada no frontend para colorir chips e gráficos
    cor: Mapped[str | None] = mapped_column(String(7), nullable=True)
    criado_em: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    operacao_categorias: Mapped[list["OperacaoCategoria"]] = relationship(
        back_populates="categoria"
    )
