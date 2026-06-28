from datetime import datetime
from sqlalchemy import Numeric, String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Conta(Base):
    __tablename__ = "contas"

    id: Mapped[int] = mapped_column(primary_key=True)
    nome: Mapped[str] = mapped_column(String(100))
    # Numeric(12, 2) evita erros de ponto flutuante em valores monetários
    saldo_atual: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    criado_em: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Lazy loading padrão — operações só são carregadas quando acessadas
    operacoes: Mapped[list["Operacao"]] = relationship(back_populates="conta", cascade="all, delete-orphan")
