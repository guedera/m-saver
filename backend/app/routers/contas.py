from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Conta
from app.schemas import ContaCreate, ContaUpdate, ContaResponse

router = APIRouter(prefix="/contas", tags=["contas"])


@router.get("/", response_model=list[ContaResponse])
def listar_contas(db: Session = Depends(get_db)):
    return db.query(Conta).order_by(Conta.nome).all()


@router.post("/", response_model=ContaResponse, status_code=status.HTTP_201_CREATED)
def criar_conta(payload: ContaCreate, db: Session = Depends(get_db)):
    conta = Conta(nome=payload.nome, saldo_atual=payload.saldo_inicial)
    db.add(conta)
    db.commit()
    db.refresh(conta)
    return conta


@router.patch("/{conta_id}", response_model=ContaResponse)
def atualizar_saldo(conta_id: int, payload: ContaUpdate, db: Session = Depends(get_db)):
    conta = db.get(Conta, conta_id)
    if not conta:
        raise HTTPException(status_code=404, detail="Conta não encontrada")
    conta.saldo_atual = payload.saldo_atual
    db.commit()
    db.refresh(conta)
    return conta


@router.delete("/{conta_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_conta(conta_id: int, db: Session = Depends(get_db)):
    conta = db.get(Conta, conta_id)
    if not conta:
        raise HTTPException(status_code=404, detail="Conta não encontrada")
    db.delete(conta)
    db.commit()
