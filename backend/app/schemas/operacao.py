from datetime import date, datetime
from pydantic import BaseModel, ConfigDict

from app.models.operacao import TipoOperacao
from app.schemas.categoria import CategoriaResponse


class OperacaoCreate(BaseModel):
    tipo: TipoOperacao
    valor: float
    descricao: str | None = None
    data: date
    conta_id: int
    categoria_ids: list[int]


class OperacaoUpdate(BaseModel):
    tipo: TipoOperacao | None = None
    valor: float | None = None
    descricao: str | None = None
    data: date | None = None
    conta_id: int | None = None
    # None = não alterar as categorias; lista vazia = remover todas
    categoria_ids: list[int] | None = None


class OperacaoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tipo: TipoOperacao
    valor: float
    descricao: str | None
    data: date
    conta_id: int
    criado_em: datetime
    # populado via property Operacao.categorias
    categorias: list[CategoriaResponse]
