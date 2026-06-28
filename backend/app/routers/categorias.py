from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Categoria
from app.schemas import CategoriaCreate, CategoriaUpdate, CategoriaResponse

router = APIRouter(prefix="/categorias", tags=["categorias"])


@router.get("/", response_model=list[CategoriaResponse])
def listar_categorias(db: Session = Depends(get_db)):
    return db.query(Categoria).order_by(Categoria.nome).all()


@router.post("/", response_model=CategoriaResponse, status_code=status.HTTP_201_CREATED)
def criar_categoria(payload: CategoriaCreate, db: Session = Depends(get_db)):
    categoria = Categoria(nome=payload.nome, cor=payload.cor)
    db.add(categoria)
    db.commit()
    db.refresh(categoria)
    return categoria


@router.patch("/{categoria_id}", response_model=CategoriaResponse)
def atualizar_categoria(categoria_id: int, payload: CategoriaUpdate, db: Session = Depends(get_db)):
    categoria = db.get(Categoria, categoria_id)
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
    # atualiza só os campos enviados — campos None no payload são ignorados
    if payload.nome is not None:
        categoria.nome = payload.nome
    if payload.cor is not None:
        categoria.cor = payload.cor
    db.commit()
    db.refresh(categoria)
    return categoria


@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_categoria(categoria_id: int, db: Session = Depends(get_db)):
    categoria = db.get(Categoria, categoria_id)
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
    db.delete(categoria)
    db.commit()
