from datetime import datetime
from sqlalchemy import Boolean, DateTime, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class Meta(Base):
    __tablename__ = "metas"

    id: Mapped[int] = mapped_column(primary_key=True)
    descricao: Mapped[str] = mapped_column(String(255))
    valor_alvo: Mapped[float] = mapped_column(Numeric(12, 2))
    # valor_atual é atualizado manualmente pelo usuário — não é calculado automaticamente
    valor_atual: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    concluida: Mapped[bool] = mapped_column(Boolean, default=False)
    criado_em: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
