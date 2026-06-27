# Arquitetura — m-saver

## Visão geral

```
┌─────────────────────────────────────────────┐
│               Browser / iPhone              │
│         React + Vite + TailwindCSS          │
│              (Vercel — free)                │
└─────────────────┬───────────────────────────┘
                  │ HTTPS / JSON (REST)
┌─────────────────▼───────────────────────────┐
│              FastAPI (Python)               │
│         Pydantic · SQLAlchemy               │
│             (Render — free)                 │
└─────────────────┬───────────────────────────┘
                  │
       ┌──────────▼──────────┐
       │  Dev: SQLite (.db)  │
       │  Prod: PostgreSQL   │
       │     (Neon — free)   │
       └─────────────────────┘
```

---

## Componentes

### Frontend (React + Vite + TailwindCSS)
- SPA servida pelo Vercel via CDN
- Consome a API REST do backend
- Mobile-first — projetada para funcionar no Safari/iPhone
- Sem estado global complexo: React Query (ou SWR) para cache e sincronização com a API

### Backend (FastAPI)
- API REST com documentação automática em `/docs` (Swagger)
- Validação de entrada via Pydantic
- Regras de negócio: atualização de saldo de conta ao registrar operação, cálculo de progresso de metas
- CORS configurado para aceitar apenas a origem do frontend

### Banco de dados
- **Desenvolvimento:** SQLite — arquivo `dev.db` local, zero setup
- **Produção:** PostgreSQL hospedado no Neon (free tier, 0.5 GB de armazenamento)
- A troca de banco é feita via variável de ambiente `DATABASE_URL` — o código não muda
- Migrations gerenciadas pelo Alembic

---

## Modelo de dados (ER simplificado)

```
contas
──────
id            INTEGER  PK
nome          TEXT     (ex: "BTG", "Itaú")
saldo_atual   NUMERIC
criado_em     DATETIME

categorias
──────────
id            INTEGER  PK
nome          TEXT
cor           TEXT     (hex, opcional — para visualização)
criado_em     DATETIME

operacoes
─────────
id            INTEGER  PK
tipo          ENUM     ('gasto', 'recebimento')
valor         NUMERIC
descricao     TEXT
data          DATE
conta_id      FK → contas.id
criado_em     DATETIME

operacao_categorias   ← tabela de junção (N:N)
────────────────────
operacao_id   FK → operacoes.id
categoria_id  FK → categorias.id

metas
─────
id            INTEGER  PK
descricao     TEXT
valor_alvo    NUMERIC
valor_atual   NUMERIC  (atualizado manualmente ou automaticamente)
criado_em     DATETIME
concluida     BOOLEAN
```

### Relacionamentos
- Uma **conta** tem muitas **operações** (1:N)
- Uma **operação** pertence a uma **conta** (N:1)
- Uma **operação** pode ter várias **categorias** (N:N via `operacao_categorias`)
- Uma **categoria** pode estar em várias **operações** (N:N)
- **Metas** são independentes (sem FK obrigatória)

---

## Estrutura de pastas prevista

```
m-saver/
├── backend/
│   ├── app/
│   │   ├── main.py            ← entrypoint FastAPI
│   │   ├── database.py        ← engine, session
│   │   ├── models/            ← SQLAlchemy models
│   │   ├── schemas/           ← Pydantic schemas
│   │   ├── routers/           ← endpoints por entidade
│   │   │   ├── contas.py
│   │   │   ├── categorias.py
│   │   │   ├── operacoes.py
│   │   │   ├── metas.py
│   │   │   └── dashboard.py
│   │   └── services/          ← lógica de negócio
│   ├── alembic/               ← migrations
│   ├── alembic.ini
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── api/               ← funções de chamada à API
│   │   ├── components/        ← componentes reutilizáveis
│   │   ├── pages/             ← telas (Dashboard, Contas, Operações...)
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── arquitetura.md
└── README.md
```

---

## Fluxo de uma operação (exemplo)

1. Usuário abre o formulário no iPhone e preenche: **Gasto, R$ 85,00, categorias: COMIDA + NAMORADA, conta: Itaú**
2. Frontend envia `POST /operacoes` com o payload JSON
3. FastAPI valida com Pydantic, persiste a operação e as categorias associadas
4. O saldo da conta Itaú é decrementado em R$ 85,00 automaticamente
5. A resposta retorna a operação criada com id e timestamp
6. Frontend atualiza a lista e o dashboard sem recarregar a página

---

## Variáveis de ambiente

| Variável        | Dev                    | Prod                              |
|-----------------|------------------------|-----------------------------------|
| `DATABASE_URL`  | `sqlite:///./dev.db`   | `postgresql://...` (Neon)         |
| `FRONTEND_URL`  | `http://localhost:5173`| `https://msaver.vercel.app`       |

---

## Por que FastAPI?

- **Simples e rápido de desenvolver:** decoradores limpos, sem boilerplate
- **Tipagem nativa:** Pydantic valida e documenta automaticamente os schemas
- **Swagger incluso:** `/docs` disponível em dev para testar endpoints sem Postman
- **SQLAlchemy:** integração madura e direta
- **Performance:** baseado em Starlette/ASGI, excelente para I/O bound como chamadas ao banco
- **Ideal para projeto solo:** pouca configuração, muito resultado
