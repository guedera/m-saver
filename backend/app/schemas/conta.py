from datetime import datetime
from pydantic import BaseModel, ConfigDict


class ContaCreate(BaseModel):
    nome: str
    # saldo_inicial no create para deixar claro que é o valor de abertura da conta
    saldo_inicial: float = 0


class ContaUpdate(BaseModel):
    # saldo atualizado manualmente pelo usuário (ex: corrigir divergência com extrato)
    saldo_atual: float


class ContaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nome: str
    saldo_atual: float
    criado_em: datetime
