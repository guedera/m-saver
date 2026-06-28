import enum
from datetime import datetime
from sqlalchemy import Enum, String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class TipoCategoria(str, enum.Enum):
    gasto = "gasto"
    recebimento = "recebimento"


class Categoria(Base):
    __tablename__ = "categorias"

    id: Mapped[int] = mapped_column(primary_key=True)
    nome: Mapped[str] = mapped_column(String(100))
    # cor em hex (#RRGGBB) — usada no frontend para colorir chips e gráficos
    cor: Mapped[str | None] = mapped_column(String(7), nullable=True)
    tipo: Mapped[TipoCategoria] = mapped_column(Enum(TipoCategoria), default=TipoCategoria.gasto)
    criado_em: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    operacao_categorias: Mapped[list["OperacaoCategoria"]] = relationship(
        back_populates="categoria", cascade="all, delete-orphan"
    )
