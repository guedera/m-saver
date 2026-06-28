# Tecnologias do projeto — m-saver

Documento de referência explicando cada tecnologia escolhida para o projeto e o motivo da escolha.

---

## Frontend

### React
**O que é:**
Biblioteca JavaScript criada pelo Facebook para construir interfaces de usuário. A ideia central é dividir a tela em componentes reutilizáveis — um botão, um card, um formulário — e o React cuida de atualizar apenas o que mudou, sem recarregar a página inteira.

**Por que foi escolhido:**
O m-saver precisa de uma interface dinâmica — registrar uma operação e ver o saldo atualizar na hora, navegar entre meses sem recarregar, selecionar múltiplas categorias num formulário. React torna isso natural. É o padrão do mercado, com enorme comunidade e biblioteca de componentes disponíveis.

---

### Vite
**O que é:**
Ferramenta de build para projetos JavaScript/TypeScript. Substitui ferramentas antigas como Webpack com uma abordagem muito mais rápida. Em desenvolvimento, serve os arquivos quase instantaneamente. Em produção, empacota e otimiza tudo para deploy.

**Por que foi escolhido:**
É o padrão atual para projetos React. Configuração mínima, feedback imediato ao salvar um arquivo (hot reload em menos de 1 segundo) e build de produção otimizado. Para um projeto solo, elimina horas de configuração.

---

### TailwindCSS
**O que é:**
Framework de CSS utilitário. Em vez de escrever arquivos `.css` separados com classes como `.botao-verde`, você aplica classes diretamente no HTML como `bg-green-500 text-white rounded px-4 py-2`. Cada classe faz uma coisa só.

**Por que foi escolhido:**
Produtividade alta para projetos solo sem designer. Mobile-first por padrão — classes como `md:flex hidden` mostram um elemento apenas em telas maiores. A estilização fica junto do componente, sem precisar alternar entre arquivos. Para o m-saver, que precisa funcionar bem no iPhone, Tailwind acelera muito a criação de layouts responsivos.

---

### Vercel
**O que é:**
Plataforma de hospedagem especializada em frontends. Você conecta seu repositório GitHub, ela detecta automaticamente o Vite, faz o build e publica. Cada novo push no repositório gera um deploy automático. Inclui HTTPS, CDN global e domínio gratuito.

**Por que foi escolhido:**
Zero configuração para projetos React + Vite. Deploy em menos de 2 minutos. HTTPS automático (necessário para o Safari no iPhone aceitar chamadas à API). **Custo: R$ 0** para projetos pessoais.

---

## Backend

### FastAPI
**O que é:**
Framework Python para criar APIs REST. Com decoradores simples você define endpoints que recebem e retornam JSON. Inclui validação automática de dados, serialização e uma página interativa em `/docs` onde você pode testar todos os endpoints diretamente no browser, sem precisar de ferramentas externas.

**Por que foi escolhido:**
Simplicidade sem abrir mão de estrutura. Para o m-saver, cada ação do usuário (registrar operação, criar categoria, consultar dashboard) vira um endpoint FastAPI. A página `/docs` é especialmente útil durante o desenvolvimento — antes de ter o frontend pronto, você testa tudo pelo browser. Tem excelente integração com SQLAlchemy e Pydantic, as outras ferramentas escolhidas.

---

### Pydantic
**O que é:**
Biblioteca Python para validação de dados usando tipagem. Você descreve o formato esperado de um dado em Python puro e o Pydantic rejeita automaticamente qualquer coisa que não bater — campo faltando, tipo errado, valor inválido.

**Por que foi escolhido:**
Vem integrado ao FastAPI. Garante que nenhuma operação chegue ao banco com dados inválidos — sem valor negativo, sem operação sem conta, sem tipo inválido. Em vez de escrever validações manuais, você declara o schema uma vez e a validação acontece automaticamente em toda requisição.

---

### SQLAlchemy
**O que é:**
ORM (Object-Relational Mapper) para Python. Traduz entre objetos Python e tabelas SQL. Em vez de escrever `INSERT INTO operacoes (valor, tipo) VALUES (...)`, você escreve `db.add(operacao)`. Também gerencia conexões, transações e busca relacionamentos automaticamente (ex: buscar uma operação já com suas categorias).

**Por que foi escolhido:**
Abstrai o SQL sem escondê-lo — quando necessário, você ainda pode escrever queries brutas. Funciona com SQLite em desenvolvimento e PostgreSQL em produção sem mudar nenhuma linha de código, só a variável de configuração `DATABASE_URL`. É o ORM Python mais maduro e documentado disponível.

---

### Alembic
**O que é:**
Ferramenta de migrations para SQLAlchemy. Uma "migration" é um script controlado que altera o esquema do banco de dados — adicionar uma coluna, criar uma tabela, renomear um campo. O Alembic guarda o histórico de todas as alterações e permite aplicar ou reverter cada uma.

**Por que foi escolhido:**
Sem o Alembic, alterar o banco em produção seria manual e arriscado. Com ele, cada mudança no modelo de dados vira um arquivo versionado no repositório. Para colocar em produção, basta rodar `alembic upgrade head` e o banco é atualizado com segurança.

---

### Render
**O que é:**
Plataforma de hospedagem para backends e APIs. Você conecta o repositório, define o comando de inicialização (`uvicorn app.main:app`) e ele cuida do servidor, HTTPS e deploy automático a cada push.

**Por que foi escolhido:**
Free tier permanente para serviços web simples, sem expirar após 12 meses como na AWS. Configuração mínima comparado a alternativas como AWS EC2 ou Heroku. Ideal para um backend FastAPI solo sem necessidade de escala.

---

## Banco de dados

### SQL (linguagem)
**O que é:**
Linguagem padrão para interagir com bancos de dados relacionais. Permite criar tabelas, inserir dados e — principalmente — fazer perguntas complexas: *"quanto gastei com COMIDA em junho?"*, *"qual o saldo atual por conta?"*, *"quais categorias tiveram mais gasto esse mês?"*.

**Por que foi escolhido:**
Os dados do m-saver são naturalmente relacionais: uma operação pertence a uma conta e tem várias categorias. SQL torna as agregações do dashboard triviais — uma única query resolve o que em outras abordagens exigiria código manual complexo. A relação N:N entre operações e categorias é um caso clássico onde bancos relacionais brilham.

---

### SQLite
**O que é:**
Banco de dados que vive inteiro em um único arquivo no disco. Zero instalação, zero configuração, zero servidor rodando em segundo plano. Basta importar a biblioteca e apontar para um arquivo `.db`.

**Por que foi escolhido:**
Exclusivamente para desenvolvimento local. Você clona o projeto, roda, já tem banco funcionando. Não precisa instalar PostgreSQL, criar usuário, configurar acesso. O SQLAlchemy usa SQLite e PostgreSQL com a mesma API — a troca entre os dois é só uma linha de configuração.

---

### PostgreSQL
**O que é:**
Banco de dados relacional robusto, open source e padrão da indústria para produção. Suporta múltiplos acessos simultâneos, tem tipos de dados avançados, é confiável e bem documentado.

**Por que foi escolhido:**
É o banco de produção do m-saver. Mais robusto que SQLite para um ambiente real, com suporte a concorrência e backup automático. É gratuito e amplamente suportado por hospedagens como o Neon.

---

### Neon
**O que é:**
Hospedagem de PostgreSQL na nuvem com uma proposta serverless — o banco "dorme" quando não está sendo usado e "acorda" na primeira requisição, reduzindo custos. Oferece um free tier com 0,5 GB de armazenamento.

**Por que foi escolhido:**
0,5 GB é mais que suficiente para anos de dados financeiros pessoais. Free tier permanente, sem cartão de crédito obrigatório para começar. Você cria o banco no site, copia a URL de conexão e cola como variável de ambiente no Render. **Custo: R$ 0.**
