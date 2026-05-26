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

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Cadastro de usuário | ❌ |
| POST | `/api/auth/login` | Login | ❌ |
| GET | `/api/games` | Listar jogos do usuário | ✅ |
| POST | `/api/games` | Adicionar jogo | ✅ |
| GET | `/api/games/:id` | Detalhar jogo | ✅ |
| PUT | `/api/games/:id` | Editar jogo | ✅ |
| DELETE | `/api/games/:id` | Remover jogo | ✅ |

## Como Rodar

Consulte o [INSTALLATION.md](./INSTALLATION.md) para instruções detalhadas de instalação e execução.

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](./LICENSE) para mais detalhes.
