import os
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from dotenv import load_dotenv

load_dotenv()

# Em dev aponta para SQLite local; em prod, DATABASE_URL é um postgres:// do Neon
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./dev.db")

# check_same_thread=False é exigido pelo SQLite quando rodado com ASGI (múltiplas threads)
# PostgreSQL não precisa disso, por isso o connect_args é condicional
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)

# autocommit=False garante que precisamos chamar db.commit() explicitamente — sem surpresas
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """Dependency do FastAPI: abre sessão, injeta nos endpoints, fecha ao final."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
