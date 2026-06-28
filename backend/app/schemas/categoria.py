from datetime import datetime
from pydantic import BaseModel, ConfigDict, field_validator


class CategoriaCreate(BaseModel):
    nome: str
    cor: str | None = None  # hex opcional ex: "#FF5733"

    @field_validator("cor")
    @classmethod
    def validar_cor(cls, v: str | None) -> str | None:
        if v is not None and not v.startswith("#"):
            raise ValueError("cor deve estar no formato hex, ex: #FF5733")
        return v


class CategoriaUpdate(BaseModel):
    nome: str | None = None
    cor: str | None = None

    @field_validator("cor")
    @classmethod
    def validar_cor(cls, v: str | None) -> str | None:
        if v is not None and not v.startswith("#"):
            raise ValueError("cor deve estar no formato hex, ex: #FF5733")
        return v


class CategoriaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nome: str
    cor: str | None
    criado_em: datetime
