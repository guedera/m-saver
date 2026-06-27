# m-saver

Plataforma web para acompanhamento de finanças pessoais. Desenvolvida para uso solo, acessível no computador e no iPhone via Safari.

## O que é

O m-saver permite registrar entradas e saídas de dinheiro ao longo do tempo — salário, mesada, compras, contas, pix de amigos — e exibe um dashboard com resumo visual do que foi gasto, por qual categoria, em qual conta, e quanto sobrou.

## Funcionalidades

### Contas bancárias
Cadastre seus bancos (ex: BTG, Itaú) com o saldo atual. Toda operação referencia uma conta, mantendo o saldo sempre atualizado. É possível corrigir o saldo manualmente a qualquer momento.

### Operações (entradas e saídas)
Ao registrar uma operação, você informa:
- **Tipo:** gasto ou recebimento
- **Valor** em R$
- **Categorias** (uma ou mais — ex: COMIDA + NAMORADA)
- **Conta** de origem ou destino

### Categorias
Tabela de categorias totalmente gerenciável (adicionar, renomear, remover). Uma operação pode ter múltiplas categorias, permitindo análises cruzadas no dashboard.

### Metas
Cadastre metas de economia (ex: juntar R$ 5.000). O dashboard exibe o progresso de cada meta.

### Dashboard
Resumo mensal com navegação por período: total de entradas, total de saídas, saldo por conta, distribuição de gastos por categoria e progresso das metas.

---

## Arquitetura

Para mais detalhes, veja [`arquitetura.md`](arquitetura.md).

### Backend — FastAPI (Python)
FastAPI foi escolhido pela sua simplicidade, tipagem nativa com Pydantic, documentação automática via Swagger e excelente performance para APIs REST. Para um projeto solo, elimina o boilerplate sem sacrificar estrutura.

### Frontend — React + Vite + TailwindCSS
SPA leve com Vite para build rápido e Tailwind para estilização mobile-first sem esforço. Hospedado gratuitamente no Vercel.

### Banco de dados — SQL com SQLAlchemy + Alembic
SQL é a escolha natural para dados financeiros relacionais (contas → operações ↔ categorias). SQLAlchemy como ORM e Alembic para migrations controladas.

| Ambiente        | Banco             | Justificativa                                   |
|-----------------|-------------------|-------------------------------------------------|
| Desenvolvimento | SQLite            | Zero configuração, arquivo local               |
| Produção        | PostgreSQL (Neon) | Free tier generoso, confiável, pronto para crescer |

### Deploy
| Componente | Plataforma        | Custo        |
|------------|-------------------|--------------|
| Frontend   | Vercel            | Gratuito     |
| Backend    | Render            | Gratuito (free tier) |
| Banco      | Neon (PostgreSQL) | Gratuito     |

---

## Stack resumida

| Camada     | Tecnologia              |
|------------|-------------------------|
| Backend    | Python 3.12 + FastAPI   |
| ORM        | SQLAlchemy + Alembic    |
| Frontend   | React + Vite + Tailwind |
| DB (dev)   | SQLite                  |
| DB (prod)  | PostgreSQL (Neon)       |
| Deploy BE  | Render                  |
| Deploy FE  | Vercel                  |

## Como rodar

> Em breve — será detalhado durante o desenvolvimento.
