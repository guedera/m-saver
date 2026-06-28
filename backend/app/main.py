import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.routers import contas, categorias, operacoes

load_dotenv()

app = FastAPI(title="m-saver", version="0.1.0")

# CORS restrito à origem do frontend — em prod, FRONTEND_URL vem da variável de ambiente
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(contas.router)
app.include_router(categorias.router)
app.include_router(operacoes.router)


@app.get("/health")
def health():
    """Usado pelo Render para checar se a instância está viva."""
    return {"status": "ok"}
