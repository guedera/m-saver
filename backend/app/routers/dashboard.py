from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import extract, func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Categoria, Conta, Meta, Operacao, OperacaoCategoria
from app.models.operacao import TipoOperacao
from app.schemas.dashboard import DashboardResponse, GastoCategoria

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/", response_model=DashboardResponse)
def get_dashboard(
    mes: str = Query(
        default=None,
        description="Mês no formato YYYY-MM. Padrão: mês atual.",
    ),
    db: Session = Depends(get_db),
):
    if mes is None:
        mes = date.today().strftime("%Y-%m")

    try:
        year, month = mes.split("-")
        year, month = int(year), int(month)
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de mês inválido. Use YYYY-MM")

    filtro_mes = [
        extract("year", Operacao.data) == year,
        extract("month", Operacao.data) == month,
    ]

    # totais do mês — coalesce evita None quando não há operações no período
    total_entradas = db.query(
        func.coalesce(func.sum(Operacao.valor), 0)
    ).filter(Operacao.tipo == TipoOperacao.recebimento, *filtro_mes).scalar()

    total_saidas = db.query(
        func.coalesce(func.sum(Operacao.valor), 0)
    ).filter(Operacao.tipo == TipoOperacao.gasto, *filtro_mes).scalar()

    # saldo acumulado atual de cada conta (não limitado ao mês)
    contas = db.query(Conta).order_by(Conta.nome).all()

    # gastos agrupados por categoria — apenas gastos, não recebimentos
    gastos_rows = (
        db.query(
            Categoria.id.label("categoria_id"),
            Categoria.nome,
            Categoria.cor,
            func.sum(Operacao.valor).label("total"),
        )
        .join(OperacaoCategoria, OperacaoCategoria.categoria_id == Categoria.id)
        .join(Operacao, Operacao.id == OperacaoCategoria.operacao_id)
        .filter(Operacao.tipo == TipoOperacao.gasto, *filtro_mes)
        .group_by(Categoria.id, Categoria.nome, Categoria.cor)
        .order_by(func.sum(Operacao.valor).desc())
        .all()
    )

    gastos_por_categoria = [
        GastoCategoria(
            categoria_id=row.categoria_id,
            nome=row.nome,
            cor=row.cor,
            total=float(row.total),
        )
        for row in gastos_rows
    ]

    # meses que têm ao menos uma operação — para o seletor ← → do frontend
    meses_rows = (
        db.query(
            extract("year", Operacao.data).label("y"),
            extract("month", Operacao.data).label("m"),
        )
        .distinct()
        .order_by("y", "m")
        .all()
    )
    meses_com_operacoes = [
        f"{int(row.y):04d}-{int(row.m):02d}" for row in meses_rows
    ]

    metas = db.query(Meta).order_by(Meta.criado_em).all()

    return DashboardResponse(
        mes=f"{year:04d}-{month:02d}",
        total_entradas=float(total_entradas),
        total_saidas=float(total_saidas),
        saldo_mes=float(total_entradas) - float(total_saidas),
        saldos_por_conta=contas,
        gastos_por_categoria=gastos_por_categoria,
        meses_com_operacoes=meses_com_operacoes,
        metas=metas,
    )
