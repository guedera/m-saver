from datetime import date, datetime
import enum

from sqlalchemy import Date, DateTime, Enum, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class TipoOperacao(str, enum.Enum):
    gasto = "gasto"
    recebimento = "recebimento"


class Operacao(Base):
    __tablename__ = "operacoes"

    id: Mapped[int] = mapped_column(primary_key=True)
    tipo: Mapped[TipoOperacao] = mapped_column(Enum(TipoOperacao))
    valor: Mapped[float] = mapped_column(Numeric(12, 2))
    descricao: Mapped[str | None] = mapped_column(String(255), nullable=True)
    # data da operação separada de criado_em para suportar lançamentos retroativos
    data: Mapped[date] = mapped_column(Date)
    conta_id: Mapped[int] = mapped_column(ForeignKey("contas.id"))
    criado_em: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    conta: Mapped["Conta"] = relationship(back_populates="operacoes")
    # cascade delete-orphan: ao deletar uma operação, suas associações de categoria somem junto
    operacao_categorias: Mapped[list["OperacaoCategoria"]] = relationship(
        back_populates="operacao", cascade="all, delete-orphan"
    )

    @property
    def categorias(self) -> list["Categoria"]:
        """Atalho usado pelo schema de resposta para serializar as categorias diretamente."""
        return [oc.categoria for oc in self.operacao_categorias]


class OperacaoCategoria(Base):
    """Tabela de junção N:N entre Operacao e Categoria."""

    __tablename__ = "operacao_categorias"

    # Chave primária composta — impede duplicatas da mesma associação
    operacao_id: Mapped[int] = mapped_column(ForeignKey("operacoes.id"), primary_key=True)
    categoria_id: Mapped[int] = mapped_column(ForeignKey("categorias.id"), primary_key=True)

    operacao: Mapped["Operacao"] = relationship(back_populates="operacao_categorias")
    categoria: Mapped["Categoria"] = relationship(back_populates="operacao_categorias")
