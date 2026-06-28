import os
import sys
from logging.config import fileConfig
from pathlib import Path

from sqlalchemy import engine_from_config, pool
from alembic import context
from dotenv import load_dotenv

load_dotenv()

# Adiciona backend/ ao path para que "from app.xxx" funcione ao rodar alembic da raiz
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.database import Base
import app.models  # noqa: F401 — importar os models registra os metadados no Base

config = context.config

# Sobrescreve a sqlalchemy.url do alembic.ini com a variável de ambiente
# Isso permite trocar de SQLite (dev) para PostgreSQL (prod) sem alterar código
config.set_main_option(
    "sqlalchemy.url",
    os.getenv("DATABASE_URL", "sqlite:///./dev.db"),
)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Gera o SQL sem conectar ao banco — útil para inspecionar ou auditar migrations."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Conecta ao banco e aplica as migrations diretamente (modo padrão)."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
