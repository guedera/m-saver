from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import extract
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.models import Categoria, Conta, Operacao, OperacaoCategoria
from app.schemas.operacao import OperacaoCreate, OperacaoResponse, OperacaoUpdate
from app.services.operacoes import aplicar_operacao, reverter_operacao

router = APIRouter(prefix="/operacoes", tags=["operacoes"])


def _carregar_operacao(db: Session, operacao_id: int) -> Operacao:
    """Busca operação com categorias já carregadas (evita N+1 no acesso à property)."""
    operacao = (
        db.query(Operacao)
        .options(
            selectinload(Operacao.operacao_categorias).selectinload(
                OperacaoCategoria.categoria
            )
        )
        .filter(Operacao.id == operacao_id)
        .first()
    )
    if not operacao:
        raise HTTPException(status_code=404, detail="Operação não encontrada")
    return operacao


@router.get("/", response_model=list[OperacaoResponse])
def listar_operacoes(
    mes: str | None = Query(None, description="Filtro por mês no formato YYYY-MM"),
    conta_id: int | None = Query(None),
    categoria_id: int | None = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Operacao).options(
        selectinload(Operacao.operacao_categorias).selectinload(OperacaoCategoria.categoria)
    )

    if mes:
        try:
            year, month = mes.split("-")
            query = query.filter(
                extract("year", Operacao.data) == int(year),
                extract("month", Operacao.data) == int(month),
            )
        except ValueError:
            raise HTTPException(status_code=400, detail="Formato de mês inválido. Use YYYY-MM")

    if conta_id:
        query = query.filter(Operacao.conta_id == conta_id)

    if categoria_id:
        # join para filtrar operações que contenham a categoria pedida
        query = query.join(Operacao.operacao_categorias).filter(
            OperacaoCategoria.categoria_id == categoria_id
        )

    return query.order_by(Operacao.data.desc()).all()


@router.post("/", response_model=OperacaoResponse, status_code=status.HTTP_201_CREATED)
def criar_operacao(payload: OperacaoCreate, db: Session = Depends(get_db)):
    conta = db.get(Conta, payload.conta_id)
    if not conta:
        raise HTTPException(status_code=404, detail="Conta não encontrada")

    categorias = db.query(Categoria).filter(Categoria.id.in_(payload.categoria_ids)).all()
    if len(categorias) != len(payload.categoria_ids):
        raise HTTPException(status_code=404, detail="Uma ou mais categorias não encontradas")

    operacao = Operacao(
        tipo=payload.tipo,
        valor=payload.valor,
        descricao=payload.descricao,
        data=payload.data,
        conta_id=payload.conta_id,
    )
    operacao.operacao_categorias = [
        OperacaoCategoria(categoria=cat) for cat in categorias
    ]

    aplicar_operacao(conta, payload.tipo, payload.valor)

    db.add(operacao)
    db.commit()
    db.refresh(operacao)
    return _carregar_operacao(db, operacao.id)


@router.patch("/{operacao_id}", response_model=OperacaoResponse)
def atualizar_operacao(
    operacao_id: int, payload: OperacaoUpdate, db: Session = Depends(get_db)
):
    operacao = _carregar_operacao(db, operacao_id)

    # resolve conta de destino (pode ser a mesma ou uma nova)
    conta_antiga = db.get(Conta, operacao.conta_id)
    conta_nova = (
        db.get(Conta, payload.conta_id) if payload.conta_id else conta_antiga
    )
    if payload.conta_id and not conta_nova:
        raise HTTPException(status_code=404, detail="Conta não encontrada")

    # reverte o efeito da operação original no saldo da conta antiga
    reverter_operacao(conta_antiga, operacao.tipo, float(operacao.valor))

    # aplica os novos valores
    if payload.tipo is not None:
        operacao.tipo = payload.tipo
    if payload.valor is not None:
        operacao.valor = payload.valor
    if payload.descricao is not None:
        operacao.descricao = payload.descricao
    if payload.data is not None:
        operacao.data = payload.data
    if payload.conta_id is not None:
        operacao.conta_id = payload.conta_id

    if payload.categoria_ids is not None:
        categorias = db.query(Categoria).filter(
            Categoria.id.in_(payload.categoria_ids)
        ).all()
        if len(categorias) != len(payload.categoria_ids):
            raise HTTPException(status_code=404, detail="Uma ou mais categorias não encontradas")
        # substitui as associações — o cascade cuida da deleção das antigas
        operacao.operacao_categorias = [
            OperacaoCategoria(categoria=cat) for cat in categorias
        ]

    # aplica o novo efeito no saldo da conta de destino
    aplicar_operacao(conta_nova, operacao.tipo, float(operacao.valor))

    db.commit()
    return _carregar_operacao(db, operacao.id)


@router.delete("/{operacao_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_operacao(operacao_id: int, db: Session = Depends(get_db)):
    operacao = _carregar_operacao(db, operacao_id)
    conta = db.get(Conta, operacao.conta_id)

    reverter_operacao(conta, operacao.tipo, float(operacao.valor))

    db.delete(operacao)
    db.commit()
