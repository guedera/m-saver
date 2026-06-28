from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Meta
from app.schemas.meta import MetaCreate, MetaResponse, MetaUpdate

router = APIRouter(prefix="/metas", tags=["metas"])


@router.get("/", response_model=list[MetaResponse])
def listar_metas(db: Session = Depends(get_db)):
    return db.query(Meta).order_by(Meta.criado_em).all()


@router.post("/", response_model=MetaResponse, status_code=status.HTTP_201_CREATED)
def criar_meta(payload: MetaCreate, db: Session = Depends(get_db)):
    meta = Meta(descricao=payload.descricao, valor_alvo=payload.valor_alvo)
    db.add(meta)
    db.commit()
    db.refresh(meta)
    return meta


@router.patch("/{meta_id}", response_model=MetaResponse)
def atualizar_meta(meta_id: int, payload: MetaUpdate, db: Session = Depends(get_db)):
    meta = db.get(Meta, meta_id)
    if not meta:
        raise HTTPException(status_code=404, detail="Meta não encontrada")

    if payload.descricao is not None:
        meta.descricao = payload.descricao
    if payload.valor_atual is not None:
        meta.valor_atual = payload.valor_atual
    if payload.concluida is not None:
        meta.concluida = payload.concluida

    db.commit()
    db.refresh(meta)
    return meta


@router.delete("/{meta_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_meta(meta_id: int, db: Session = Depends(get_db)):
    meta = db.get(Meta, meta_id)
    if not meta:
        raise HTTPException(status_code=404, detail="Meta não encontrada")
    db.delete(meta)
    db.commit()
