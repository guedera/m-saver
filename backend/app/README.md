# backend/app

Entrypoint e núcleo da API FastAPI. Cada subpasta tem responsabilidade única.

---

## Estrutura

```
app/
├── main.py          ← instância do FastAPI, middlewares, rotas registradas
├── database.py      ← engine, sessão e Base declarativa do SQLAlchemy
│
├── models/          ← tabelas do banco (SQLAlchemy ORM)
├── schemas/         ← contratos da API (Pydantic)
├── routers/         ← endpoints HTTP agrupados por entidade
└── services/        ← regras de negócio que envolvem múltiplos models
```

---

## models/

Mapeamento direto para as tabelas do banco via SQLAlchemy. Cada arquivo é uma entidade:

| Arquivo          | Tabela(s)                          | Responsabilidade                                      |
|------------------|------------------------------------|-------------------------------------------------------|
| `conta.py`       | `contas`                           | Contas bancárias com saldo atual                      |
| `categoria.py`   | `categorias`                       | Categorias de gasto (ex: COMIDA, TRANSPORTE)         |
| `operacao.py`    | `operacoes`, `operacao_categorias` | Transações (gasto/recebimento) + junção N:N com categorias |
| `meta.py`        | `metas`                            | Metas de economia com valor alvo e valor atual        |

Nenhuma regra de negócio vive aqui — models são só estrutura.

---

## schemas/

Schemas Pydantic que definem o formato de entrada e saída da API. Separados dos models para que a API possa expor só o necessário (ex: sem `criado_em` na resposta de criação).

Convenção de nomes:
- `XxxCreate` — payload do `POST`
- `XxxUpdate` — payload do `PATCH` (campos opcionais)
- `XxxResponse` — o que a API devolve

---

## routers/

Endpoints agrupados por entidade, registrados no `main.py` com um prefixo de URL. Cada router lida com HTTP, validação via schema e chamada ao service (ou diretamente ao banco para operações simples).

| Arquivo          | Prefixo        |
|------------------|----------------|
| `contas.py`      | `/contas`      |
| `categorias.py`  | `/categorias`  |
| `operacoes.py`   | `/operacoes`   |
| `metas.py`       | `/metas`       |
| `dashboard.py`   | `/dashboard`   |

---

## services/

Lógica de negócio que coordena múltiplos models. Exemplos do que vive aqui:

- Atualizar o `saldo_atual` da conta ao criar, editar ou deletar uma operação
- Calcular o progresso de metas no dashboard

Mantemos isso separado dos routers para facilitar testes e evitar lógica espalhada nos endpoints.

---

## Fluxo de uma requisição

```
Request HTTP
    ↓
router (valida schema Pydantic, extrai dados)
    ↓
service (aplica regra de negócio se necessário)
    ↓
model / query SQLAlchemy
    ↓
Response HTTP (serializado pelo schema de resposta)
```
