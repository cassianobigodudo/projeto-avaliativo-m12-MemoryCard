# MemoryCard 🎮

Sistema de catalogação pessoal de mídias de jogos eletrônicos, focado em colecionadores.

## Sobre o Projeto

O **MemoryCard** resolve um problema real de colecionadores: perder o controle de quais títulos possuem, em qual plataforma, o estado físico da mídia ou se é digital. Uma ferramenta moderna, limpa e focada na experiência do usuário para esse nicho.

## Funcionalidades (MVP)

- **Autenticação Segura** — Criação de conta, login e gerenciamento de perfil individual
- **Catálogo de Jogos** — Adicionar, visualizar, editar e remover jogos da coleção
- **Metadados de Colecionador** — Estado da mídia (Lacrado, Completo com Caixa e Manual, Apenas Mídia, Digital), plataforma e região (NTSC, PAL, NTSC-J, Region Free)

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Frontend | React 18, Vite, TypeScript, TailwindCSS |
| Backend | Node.js, Express, TypeScript |
| Banco de Dados | PostgreSQL |
| ORM | Prisma |
| Autenticação | JWT + bcrypt |

## Estrutura do Projeto

```
projeto-avaliativo-m12-MemoryCard/
├── backend/                    # API REST (Node.js + Express)
│   ├── prisma/
│   │   └── schema.prisma       # Schema do banco de dados
│   ├── src/
│   │   ├── controllers/        # Lógica de negócio das rotas
│   │   ├── middlewares/        # Middlewares (auth, validação)
│   │   ├── models/             # Acesso ao banco via Prisma
│   │   ├── routes/             # Definição das rotas da API
│   │   ├── lib/                # Instâncias compartilhadas (Prisma client)
│   │   ├── app.ts              # Configuração do Express
│   │   └── server.ts           # Ponto de entrada do servidor
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/                   # SPA (React + Vite)
    ├── src/
    │   ├── components/         # Componentes reutilizáveis
    │   ├── contexts/           # Contextos React (AuthContext, etc.)
    │   ├── hooks/              # Hooks customizados (useAuth, useGames)
    │   ├── pages/              # Páginas da aplicação
    │   ├── services/           # Cliente HTTP para a API
    │   ├── styles/             # Estilos globais (TailwindCSS)
    │   ├── types/              # Tipos TypeScript compartilhados
    │   ├── App.tsx             # Componente raiz com roteamento
    │   └── main.tsx            # Ponto de entrada do React
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.ts
```

## Endpoints da API

| Método | Rota | Descrição | Auth | Status |
|---|---|---|---|---|
| POST | `/api/users/register` | Cadastro de usuário | ❌ | ✅ Implementado |
| POST | `/api/auth/login` | Login | ❌ | ✅ Implementado |
| PUT | `/api/users/:id` | Editar conta do usuário | ✅ | ✅ Implementado |
| DELETE | `/api/users/:id` | Deletar conta do usuário | ✅ | ✅ Implementado |
| PUT | `/api/users/profile` | Atualizar perfil do usuário logado (nome, email, senha) | ✅ | ✅ Implementado |
| DELETE | `/api/users/profile` | Excluir conta do usuário logado (cascade nos jogos) | ✅ | ✅ Implementado |
| POST | `/api/auth/register` | Cadastro de usuário (legado) | ❌ | 🚧 Placeholder |
| GET | `/api/games` | Listar jogos do usuário | ✅ | ✅ Implementado |
| POST | `/api/games` | Adicionar jogo à coleção | ✅ | ✅ Implementado |
| PUT | `/api/games/:id` | Editar jogo da coleção | ✅ | ✅ Implementado |
| DELETE | `/api/games/:id` | Remover jogo da coleção | ✅ | ✅ Implementado |

## Testes

O projeto utiliza **Jest** com **ts-jest** para testes unitários no backend e **Vitest** com **React Testing Library** para testes do frontend.

### Backend

| Módulo | Casos cobertos |
|---|---|
| `AuthController.register` | Cadastro com sucesso, campos obrigatórios ausentes (name, email, password), email inválido, senha fraca, email duplicado |
| `AuthController.login` | Login com sucesso (gera token), email inexistente, senha incorreta, campos ausentes |
| `authMiddleware` | Token válido (libera rota e injeta userId), header ausente, sem prefixo Bearer, token inválido/expirado |
| `UserController.update` | Edição com sucesso, tentativa de editar conta alheia (403), nenhum campo enviado (400), email duplicado (409) |
| `UserController.delete` | Deleção com sucesso, tentativa de deletar conta alheia (403), usuário inexistente (404) |
| `GameController.create` | Adição com sucesso (userId do token), sem userId retorna 401, campos obrigatórios ausentes retorna 400 |
| `GameController.index` | Lista apenas jogos do usuário autenticado, sem userId retorna 401 |
| `GameController.update` | Edição com sucesso, jogo de outro usuário retorna 404, sem userId retorna 401, sem campos retorna 400 |
| `GameController.destroy` | Exclusão com sucesso, jogo de outro usuário retorna 404, sem userId retorna 401 |

```bash
cd backend
npm test
```

### Frontend

| Módulo | Casos cobertos |
|---|---|
| `LoginPage` | Renderização dos inputs, formulário vazio não chama API, login com sucesso redireciona para /dashboard, credenciais inválidas exibem erro |
| `RegisterPage` | Renderização dos inputs, formulário vazio não chama API, cadastro com sucesso redireciona para /login, email duplicado exibe erro |
| `ProtectedRoute` | Sem token redireciona para /login, com token renderiza conteúdo protegido |
| `AddGameModal` | Modal fechado não renderiza, campos renderizados, formulário vazio não chama API, submissão com dados válidos, cancelar fecha modal, exibe erro, estado de loading |
| `DashboardPage` | Botões Editar e Excluir renderizados, Editar abre modal com dados preenchidos, Excluir com confirmação chama deleteGame, Excluir cancelado não chama deleteGame, submissão de edição chama updateGame |

```bash
cd frontend
npm test
```

### Como usar o token nas rotas protegidas

Após o login, inclua o token retornado no header de todas as requisições às rotas protegidas:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Como Rodar

Consulte o [INSTALLATION.md](./INSTALLATION.md) para instruções detalhadas de instalação e execução.

## Pipeline de CI (GitHub Actions)

O projeto utiliza **GitHub Actions** para garantir a qualidade do código de forma automatizada. A pipeline é disparada em todo `push` ou `pull_request` para as branches `main` e `develop`.

### O que a pipeline executa

A esteira roda dois jobs em paralelo — um para o backend e outro para o frontend — com as seguintes etapas em cada:

1. **Checkout** do código
2. **Configuração do Node.js 20**
3. **Instalação de dependências** (`npm ci`)
4. **Lint** (`npm run lint`) — verifica padrões de código com ESLint + TypeScript ESLint
5. **Geração do client Prisma** (`npx prisma generate`) — apenas no backend
6. **Testes** (`npm test`) — executa todos os testes unitários

> Os testes do backend rodam de forma isolada (sem banco de dados real), pois utilizam mocks do Prisma via Jest.

## Uso de IA — Kiro (LLM)

Este projeto foi desenvolvido com auxílio do **Kiro**, um ambiente de desenvolvimento com IA integrada. Para garantir consistência, rastreabilidade e confiabilidade nas interações com a LLM, adotamos um padrão de prompt estruturado em todas as tarefas delegadas à IA.

### Por que padronizar os prompts?

Prompts bem estruturados reduzem ambiguidade, evitam que a IA extrapole o escopo e tornam o histórico de decisões auditável por qualquer membro do time.

### Template de Prompt

```
Instrução: <o que deve ser feito, de forma imperativa e objetiva>

Objetivo: <qual o resultado esperado ao final da tarefa>

Regras/Limitações:
- <restrição 1>
- <restrição 2>
- <restrição N>

Exemplo (se aplicável):
<demonstração do formato de entrada ou saída esperado>
```

### Exemplo real utilizado no projeto

```
Instrução: Implemente a funcionalidade de Cadastro de Usuário no backend,
incluindo a rota, o controller e a criptografia de senha com bcrypt.

Objetivo: Ter um endpoint POST /api/users/register funcional, com validações
e retorno sem expor o hash da senha.

Regras/Limitações:
- Seguir estritamente o padrão MVC definido no tech.md
- Usar bcrypt para hash da senha (nunca salvar em texto puro)
- O email deve ser único; retornar 409 em caso de duplicidade
- A resposta de sucesso deve omitir o passwordHash

Exemplo de retorno esperado:
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Fulano",
    "email": "fulano@email.com"
  }
}
```

### Arquivos de contexto (Steering)

A pasta `steering/` contém os arquivos que alimentam o contexto da IA em todas as sessões:

| Arquivo | Conteúdo |
|---|---|
| `product.md` | Visão do produto, problema e público-alvo |
| `tech.md` | Stack tecnológica, schema do banco e diretrizes de código |
| `spec.md` | Regras funcionais e de negócio da aplicação |
| `git-conventions.md` | Padrão de commits e criação de branches |

## Melhorias Futuras

A seguir, ideias de evolução para o projeto após o MVP:

### 🔍 Busca e Filtros
- Filtrar a coleção por plataforma, condição ou região diretamente no dashboard
- Campo de busca por título de jogo em tempo real
- Ordenação por data de adição, título ou plataforma

### 📊 Estatísticas da Coleção
- Painel com total de jogos por plataforma
- Gráfico de distribuição por condição (Lacrado, Completo, Apenas Mídia, Digital)
- Valor estimado da coleção com campo de preço pago por jogo

### 🖼️ Imagens e Capas
- Upload de imagem de capa para cada jogo
- Integração com API pública (ex: IGDB ou RAWG) para buscar capa automaticamente pelo título

### 👥 Funcionalidades Sociais
- Perfil público opcional para compartilhar a coleção
- Sistema de "quero comprar" e "quero vender" entre usuários
- Exportação da coleção em CSV ou PDF

### 🔔 Notificações
- Alertas por email ao atingir marcos (ex: 100 jogos na coleção)
- Lembrete de jogos marcados como "quero comprar"

### 🛡️ Segurança e Infraestrutura
- Refresh token para renovação automática de sessão
- Rate limiting nas rotas de autenticação para prevenir brute force
- Deploy automatizado via GitHub Actions (CD) em plataforma como Railway ou Render
- Testes de integração com banco de dados real em ambiente de staging

### 📱 Mobile
- Versão mobile com React Native reutilizando a API existente
- PWA (Progressive Web App) para instalação direta no celular

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](./LICENSE) para mais detalhes.
