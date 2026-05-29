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
| POST | `/api/auth/register` | Cadastro de usuário (legado) | ❌ | 🚧 Placeholder |
| GET | `/api/games` | Listar jogos do usuário | ✅ | 🚧 Placeholder |
| POST | `/api/games` | Adicionar jogo | ✅ | 🚧 Placeholder |
| GET | `/api/games/:id` | Detalhar jogo | ✅ | 🚧 Placeholder |
| PUT | `/api/games/:id` | Editar jogo | ✅ | 🚧 Placeholder |
| DELETE | `/api/games/:id` | Remover jogo | ✅ | 🚧 Placeholder |

## Testes

O projeto utiliza **Jest** com **ts-jest** para testes unitários no backend.

| Módulo | Casos cobertos |
|---|---|
| `AuthController.register` | Cadastro com sucesso, campos obrigatórios ausentes (name, email, password), email inválido, senha fraca, email duplicado |
| `AuthController.login` | Login com sucesso (gera token), email inexistente, senha incorreta, campos ausentes |
| `authMiddleware` | Token válido (libera rota e injeta userId), header ausente, sem prefixo Bearer, token inválido/expirado |

Para rodar os testes:

```bash
cd backend
npm test
```

### Como usar o token nas rotas protegidas

Após o login, inclua o token retornado no header de todas as requisições às rotas protegidas:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Como Rodar

Consulte o [INSTALLATION.md](./INSTALLATION.md) para instruções detalhadas de instalação e execução.

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

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](./LICENSE) para mais detalhes.
