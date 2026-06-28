from pydantic import BaseModel

from app.schemas.conta import ContaResponse
from app.schemas.meta import MetaResponse


class GastoCategoria(BaseModel):
    categoria_id: int
    nome: str
    cor: str | None
    total: float


class DashboardResponse(BaseModel):
    mes: str                                  # YYYY-MM do período consultado
    total_entradas: float
    total_saidas: float
    saldo_mes: float                          # entradas - saidas do mês
    saldos_por_conta: list[ContaResponse]     # saldo acumulado atual de cada conta
    gastos_por_categoria: list[GastoCategoria]
    meses_com_operacoes: list[str]            # para o seletor de mês no frontend
    metas: list[MetaResponse]
