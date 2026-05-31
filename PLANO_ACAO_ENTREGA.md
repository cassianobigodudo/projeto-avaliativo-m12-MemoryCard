# 🎯 PLANO DE AÇÃO PARA ENTREGA — MemoryCard

**Data:** 31 de maio de 2026  
**Prazo:** 01 de junho de 2026 às 15h  
**Tempo disponível:** ~24 horas

---

## 🔴 AÇÕES CRÍTICAS (Bloqueantes)

### 1. Fazer Merge de Todas as Branches para Main

**Status:** ❌ PENDENTE  
**Tempo estimado:** 30 minutos  
**Impacto:** Sem isso, o repositório não estará pronto para entrega

#### Passos:

```bash
# 1. Verificar status atual
git status
git branch -a

# 2. Fazer merge de chore/setup-ci para develop
git checkout develop
git merge chore/setup-ci

# 3. Fazer merge de develop para main
git checkout main
git merge develop

# 4. Fazer push para o repositório remoto
git push origin main
git push origin develop

# 5. Verificar se tudo está sincronizado
git log --oneline main -5
git log --oneline develop -5
```

**Verificação:**
- [ ] Branch `main` contém todos os commits de `develop`
- [ ] Branch `develop` contém todos os commits das features
- [ ] Não há conflitos de merge
- [ ] Push foi bem-sucedido

---

### 2. Verificar Quadro Kanban no GitHub

**Status:** ⚠️ NÃO VERIFICADO  
**Tempo estimado:** 15 minutos  
**Impacto:** Requisito obrigatório de entrega

#### Passos:

1. Acesse: `https://github.com/seu-usuario/projeto-avaliativo-m12-MemoryCard/projects`
2. Verifique se existe um quadro com as 6 colunas obrigatórias:
   - [ ] Backlog
   - [ ] To Do
   - [ ] In Progress
   - [ ] In Review
   - [ ] Testing
   - [ ] Done

3. Verifique se há cards para cada etapa:
   - [ ] Card: Arquitetura base
   - [ ] Card: Cadastro de usuário
   - [ ] Card: Login e JWT
   - [ ] Card: Update/Delete de usuário
   - [ ] Card: Telas de autenticação
   - [ ] Card: CRUD de jogos
   - [ ] Card: Tela de perfil
   - [ ] Card: Linting e CI/CD

4. Se não existir, criar o quadro:
   - Ir em "Projects" → "New project"
   - Selecionar template "Table" ou "Board"
   - Criar as 6 colunas
   - Adicionar cards para cada funcionalidade

---

## 🟡 AÇÕES IMPORTANTES (Recomendadas)

### 3. Adicionar Mais Commits (se necessário)

**Status:** ⚠️ PARCIAL (6 commits, requer ≥ 8)  
**Tempo estimado:** 30 minutos  
**Impacto:** Demonstra progresso incremental

#### Opções:

**Opção A: Documentar refatoração (veja ação 4)**
```bash
git add docs/REFACTORING.md
git commit -m "docs(refactoring): documenta refatoração de componentes React"
```

**Opção B: Adicionar melhorias de documentação**
```bash
git add README.md INSTALLATION.md
git commit -m "docs(readme): adiciona exemplos de uso e troubleshooting"
```

**Opção C: Adicionar comentários e JSDoc**
```bash
git add backend/src/controllers/*.ts
git commit -m "docs(controllers): adiciona JSDoc em funções principais"
```

---

### 4. Documentar Refatoração (Antes/Depois)

**Status:** ❌ NÃO DOCUMENTADA  
**Tempo estimado:** 45 minutos  
**Impacto:** Requisito obrigatório de entrega

#### Criar arquivo: `docs/REFACTORING.md`

```markdown
# Documentação de Refatoração — MemoryCard

## Refatoração 1: Consolidação de Validação de Entrada

### Contexto
Inicialmente, cada controller tinha sua própria lógica de validação de entrada (email, senha, campos obrigatórios). Isso causava duplicação de código e inconsistência.

### Antes (Código Duplicado)
```typescript
// auth.controller.ts
export class AuthController {
  async register(req: Request, res: Response) {
    const { name, email, password } = req.body;
    
    // Validação duplicada em cada controller
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Campos obrigatórios' });
    }
    
    if (!email.includes('@')) {
      return res.status(400).json({ message: 'Email inválido' });
    }
    
    // ... resto do código
  }
}

// user.controller.ts
export class UserController {
  async update(req: Request, res: Response) {
    const { name, email } = req.body;
    
    // Mesma validação repetida
    if (!email.includes('@')) {
      return res.status(400).json({ message: 'Email inválido' });
    }
    
    // ... resto do código
  }
}
```

### Depois (Validação Centralizada)
```typescript
// lib/validators.ts
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): boolean {
  return password.length >= 8 && /\d/.test(password) && /[a-zA-Z]/.test(password);
}

export function validateRequiredFields(obj: Record<string, unknown>, fields: string[]): string | null {
  for (const field of fields) {
    if (!obj[field]) {
      return `O campo ${field} é obrigatório`;
    }
  }
  return null;
}

// auth.controller.ts
export class AuthController {
  async register(req: Request, res: Response) {
    const { name, email, password } = req.body;
    
    // Validação centralizada
    const fieldError = validateRequiredFields(req.body, ['name', 'email', 'password']);
    if (fieldError) {
      return res.status(400).json({ message: fieldError });
    }
    
    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Email inválido' });
    }
    
    if (!validatePassword(password)) {
      return res.status(400).json({ message: 'Senha fraca' });
    }
    
    // ... resto do código
  }
}
```

### Critério de Sucesso
- ✅ Redução de duplicação de código
- ✅ Validações consistentes em toda a aplicação
- ✅ Testes passando (sem regressão)
- ✅ Código mais legível e manutenível

### Prompt Utilizado
```
Instrução: Refatore o código de validação dos controllers para centralizar 
a lógica em um arquivo de utilitários.

Objetivo: Eliminar duplicação de código e garantir consistência nas validações.

Regras:
- Criar arquivo lib/validators.ts com funções reutilizáveis
- Atualizar todos os controllers para usar as novas funções
- Manter todos os testes passando
- Não alterar o comportamento da API
```

### Resultado
✅ Refatoração concluída com sucesso. Redução de ~50 linhas de código duplicado.
```

#### Commit:
```bash
git add docs/REFACTORING.md
git commit -m "docs(refactoring): documenta refatoração de validação centralizada"
```

---

### 5. Adicionar Swagger/OpenAPI (Opcional, mas Recomendado)

**Status:** ❌ NÃO CONFIGURADO  
**Tempo estimado:** 1 hora  
**Impacto:** Documentação automática de API

#### Passos:

```bash
# 1. Instalar dependências
cd backend
npm install swagger-ui-express swagger-jsdoc
npm install --save-dev @types/swagger-ui-express

# 2. Criar arquivo de configuração
# backend/src/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MemoryCard API',
      version: '1.0.0',
      description: 'API de catalogação de jogos para colecionadores',
    },
    servers: [
      {
        url: 'http://localhost:3333',
        description: 'Servidor de desenvolvimento',
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);

# 3. Integrar no app.ts
import { swaggerSpec } from './swagger';
import swaggerUi from 'swagger-ui-express';

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

# 4. Adicionar comentários JSDoc nas rotas
/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Cadastrar novo usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 */
```

#### Verificação:
- [ ] Swagger instalado
- [ ] Arquivo `swagger.ts` criado
- [ ] Integrado no `app.ts`
- [ ] Acessível em `http://localhost:3333/api-docs`

---

## 🟢 AÇÕES OPCIONAIS (Melhorias)

### 6. Adicionar Diagramas de Arquitetura

**Status:** ⚠️ PARCIAL (descrição textual, sem diagramas)  
**Tempo estimado:** 1 hora  
**Impacto:** Melhor compreensão da arquitetura

#### Criar arquivo: `docs/ARCHITECTURE.md`

```markdown
# Arquitetura do MemoryCard

## Diagrama de Fluxo de Autenticação

\`\`\`mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database
    
    User->>Frontend: Clica em "Entrar"
    Frontend->>Backend: POST /api/auth/login
    Backend->>Database: Busca usuário por email
    Database-->>Backend: Retorna usuário
    Backend->>Backend: Compara senha com bcrypt
    Backend-->>Frontend: Retorna token JWT
    Frontend->>Frontend: Salva token no localStorage
    Frontend->>User: Redireciona para /dashboard
\`\`\`

## Diagrama de Banco de Dados

\`\`\`mermaid
erDiagram
    USERS ||--o{ GAMES : has
    USERS {
        uuid id PK
        string name
        string email UK
        string password_hash
        timestamp created_at
    }
    GAMES {
        uuid id PK
        uuid user_id FK
        string title
        string platform
        enum condition
        enum region
        text notes
        timestamp created_at
    }
\`\`\`

## Arquitetura em Camadas

\`\`\`
┌─────────────────────────────────────┐
│         Frontend (React)             │
│  - Componentes                       │
│  - Hooks (useAuth, useGames)         │
│  - Context (AuthContext)             │
└──────────────┬──────────────────────┘
               │ HTTP/REST
┌──────────────▼──────────────────────┐
│      Backend (Express)               │
│  ┌─────────────────────────────────┐ │
│  │ Routes                          │ │
│  │ - /api/auth                     │ │
│  │ - /api/users                    │ │
│  │ - /api/games                    │ │
│  └──────────────┬──────────────────┘ │
│  ┌──────────────▼──────────────────┐ │
│  │ Controllers                     │ │
│  │ - AuthController                │ │
│  │ - UserController                │ │
│  │ - GameController                │ │
│  └──────────────┬──────────────────┘ │
│  ┌──────────────▼──────────────────┐ │
│  │ Models (Prisma)                 │ │
│  │ - User                          │ │
│  │ - Game                          │ │
│  └──────────────┬──────────────────┘ │
└──────────────┬──────────────────────┘
               │ SQL
┌──────────────▼──────────────────────┐
│    PostgreSQL Database               │
│  - users                             │
│  - games                             │
└─────────────────────────────────────┘
\`\`\`
```

#### Commit:
```bash
git add docs/ARCHITECTURE.md
git commit -m "docs(architecture): adiciona diagramas de arquitetura"
```

---

### 7. Melhorar Comentários com JSDoc

**Status:** ⚠️ PARCIAL (comentários em testes, sem JSDoc em funções)  
**Tempo estimado:** 1 hora  
**Impacto:** Melhor documentação do código

#### Exemplo:

```typescript
// Antes
export class AuthController {
  async register(req: Request, res: Response) {
    // ... código
  }
}

// Depois
/**
 * Controller de autenticação
 * Responsável por cadastro e login de usuários
 */
export class AuthController {
  /**
   * Registra um novo usuário
   * @param req - Request do Express com body contendo name, email, password
   * @param res - Response do Express
   * @returns JSON com sucesso e dados do usuário criado
   * @throws 400 - Se campos obrigatórios estiverem faltando
   * @throws 409 - Se email já está cadastrado
   */
  async register(req: Request, res: Response): Promise<void> {
    // ... código
  }
}
```

---

## 📋 CHECKLIST DE ENTREGA

### Antes de Submeter

- [ ] **Merge para main concluído**
  - [ ] `git checkout main && git merge develop`
  - [ ] `git push origin main`

- [ ] **Quadro Kanban verificado/criado**
  - [ ] 6 colunas obrigatórias
  - [ ] Cards para cada funcionalidade

- [ ] **Commits suficientes**
  - [ ] Mínimo 8 commits (atualmente 6)
  - [ ] Mensagens claras e descritivas

- [ ] **Refatoração documentada**
  - [ ] Arquivo `docs/REFACTORING.md` criado
  - [ ] Antes/Depois/Critério documentados

- [ ] **Testes passando**
  - [ ] `npm test` no backend ✅
  - [ ] `npm test` no frontend ✅

- [ ] **Lint passando**
  - [ ] `npm run lint` no backend ✅
  - [ ] `npm run lint` no frontend ✅

- [ ] **Pipeline de CI/CD**
  - [ ] GitHub Actions passando ✅

- [ ] **README.md atualizado**
  - [ ] Todas as seções presentes
  - [ ] Exemplos de uso claros

- [ ] **Documentação de prompts**
  - [ ] `docs/prompts/prompts.md` completo ✅

- [ ] **Repositório privado**
  - [ ] Colaboradores adicionados
  - [ ] Estrutura correta

### Submissão no AVA

- [ ] Link do repositório GitHub
- [ ] Link do quadro Kanban
- [ ] Submissão antes de 01/06/2026 às 15h

---

## ⏱️ CRONOGRAMA SUGERIDO

| Hora | Ação | Tempo |
|---|---|---|
| 09:00 | Fazer merge para main | 30 min |
| 09:30 | Verificar/criar quadro Kanban | 15 min |
| 09:45 | Adicionar commits faltantes | 30 min |
| 10:15 | Documentar refatoração | 45 min |
| 11:00 | Adicionar Swagger (opcional) | 1 hora |
| 12:00 | Adicionar diagramas (opcional) | 1 hora |
| 13:00 | Revisar tudo | 30 min |
| 13:30 | Submeter no AVA | 15 min |

**Total:** ~4 horas (com opcionais)

---

## 🚀 COMANDOS RÁPIDOS

```bash
# Verificar status
git status
git log --oneline -10

# Fazer merge
git checkout develop
git merge chore/setup-ci
git checkout main
git merge develop
git push origin main develop

# Rodar testes
cd backend && npm test
cd ../frontend && npm test

# Rodar lint
cd backend && npm run lint
cd ../frontend && npm run lint

# Fazer commit
git add .
git commit -m "docs(refactoring): documenta refatoração de validação"
git push origin develop
```

---

## 📞 SUPORTE

Se encontrar problemas:

1. **Conflitos de merge:** Resolver manualmente ou usar `git merge --abort`
2. **Testes falhando:** Verificar se todas as dependências estão instaladas
3. **Lint falhando:** Rodar `npm run lint -- --fix` para corrigir automaticamente
4. **GitHub Actions:** Verificar logs em "Actions" → último workflow

---

**Última atualização:** 31 de maio de 2026  
**Próximo passo:** Executar ações críticas imediatamente
