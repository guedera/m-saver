from datetime import datetime
from pydantic import BaseModel, ConfigDict


class MetaCreate(BaseModel):
    descricao: str
    valor_alvo: float


class MetaUpdate(BaseModel):
    descricao: str | None = None
    valor_atual: float | None = None
    concluida: bool | None = None


class MetaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    descricao: str
    valor_alvo: float
    valor_atual: float
    concluida: bool
    criado_em: datetime
