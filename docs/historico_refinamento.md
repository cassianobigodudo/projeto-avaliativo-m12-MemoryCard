# 🔄 Histórico de Geração e Refinamento de Código - MemoryCard

Este documento registra os 3 ciclos completos de desenvolvimento, identificação de problemas e refinamento de código realizados com o auxílio de IA no projeto MemoryCard.

---

## 📅 Ciclo 1: Autenticação e Configuração de Ambiente (Fullstack)

**Escopo Inicial:** Criação das tabelas de usuário via Prisma, controllers de login/cadastro no backend e as telas correspondentes em React no frontend.

### ❌ Problema Encontrado
Ao tentar rodar as migrações e testar a conexão, o Prisma retornava o erro de autenticação `P1000: Authentication failed`, mesmo com a senha teoricamente correta.

```
Error: P1000: Authentication failed against database server at `localhost:5432`, the provided database credentials for `postgres` are not valid. Please make sure to double-check the connection string.
```

### 🔍 Diagnóstico
1. Investigação inicial apontou para conflitos de IPv6 no Windows
2. Validação de caracteres especiais na string de conexão
3. **Diagnóstico Final:** O *Auto Save* do VSCode estava desativado, fazendo com que o Prisma lesse uma versão antiga e não salva do arquivo `.env`

### ✅ Refinamento Aplicado

**Antes (`.env` desatualizado):**
```env
# Arquivo não salvo automaticamente
DATABASE_URL="postgresql://postgres:senha_errada@localhost:5432/memorycard_db"
JWT_SECRET="chave_temporaria"
```

**Depois (`.env` sincronizado com IPv4):**
```env
# Auto Save ativado no VSCode
DATABASE_URL="postgresql://postgres:senha_correta@127.0.0.1:5432/memorycard_db"
JWT_SECRET="uma_chave_secreta_muito_forte_aqui"
PORT=3333
NODE_ENV=development
```

**Ações Tomadas:**
1. Ativar Auto Save no VSCode (`File → Auto Save`)
2. Alterar `localhost` para `127.0.0.1` para evitar conflitos de IPv6
3. Validar credenciais do PostgreSQL
4. Executar `npx prisma migrate dev --name init` com sucesso

**Resultado:** ✅ Migrações executadas com sucesso, banco de dados criado e Prisma Client gerado

---

## 📅 Ciclo 2: Expansão do CRUD de Jogos e Segurança de Escopo

**Escopo Inicial:** Criação da tabela de jogos (`Game`) e desenvolvimento de um Modal no frontend para permitir que o usuário adicionasse títulos à sua coleção.

### ❌ Problema Encontrado
O planejamento inicial limitou-se apenas à criação (Create) e listagem (Read). Ficou evidente a falta das operações de Edição (Update) e Exclusão (Delete), gerando um CRUD incompleto. Além disso, **não havia validação de propriedade**, permitindo que um usuário editasse ou deletasse jogos de outro usuário.

### 🔍 Diagnóstico
1. Controller inicial aceitava qualquer `userId` sem validação
2. Faltavam rotas `PUT` e `DELETE`
3. Risco crítico de segurança: violação de autorização

### ✅ Refinamento Aplicado

**Antes (Sem validação de ownership):**
```typescript
// ❌ INSEGURO: Qualquer usuário pode editar qualquer jogo
async update(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { title, platform, condition } = req.body;

  // Sem verificação de userId!
  const updated = await prisma.game.update({
    where: { id },
    data: { title, platform, condition }
  });

  res.status(200).json({ success: true, data: updated });
}

async destroy(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  
  // Sem verificação de userId!
  await prisma.game.delete({ where: { id } });
  
  res.status(200).json({ success: true });
}
```

**Depois (Com validação de ownership via JWT):**
```typescript
// ✅ SEGURO: Apenas o dono pode editar seu jogo
async update(req: Request, res: Response): Promise<void> {
  const userId = req.userId; // Extraído do token JWT pelo middleware
  const { id } = req.params;
  const { title, platform, condition, region, notes } = req.body;

  if (!userId) {
    res.status(401).json({ success: false, message: 'Não autorizado.' });
    return;
  }

  // ✅ Verificar se o jogo existe E pertence ao usuário
  const game = await prisma.game.findFirst({ 
    where: { id, userId } // Dupla validação
  });
  
  if (!game) {
    res.status(404).json({ success: false, message: 'Jogo não encontrado.' });
    return;
  }

  if (!title && !platform && !condition && !region && notes === undefined) {
    res.status(400).json({
      success: false,
      message: 'Informe ao menos um campo para atualizar.'
    });
    return;
  }

  const dataToUpdate: Record<string, unknown> = {};
  if (title) dataToUpdate.title = title;
  if (platform) dataToUpdate.platform = platform;
  if (condition) dataToUpdate.condition = condition;
  if (region) dataToUpdate.region = region;
  if (notes !== undefined) dataToUpdate.notes = notes;

  const updated = await prisma.game.update({ 
    where: { id }, 
    data: dataToUpdate 
  });

  res.status(200).json({
    success: true,
    message: 'Jogo atualizado com sucesso.',
    data: updated
  });
}

// ✅ SEGURO: Apenas o dono pode deletar seu jogo
async destroy(req: Request, res: Response): Promise<void> {
  const userId = req.userId;
  const { id } = req.params;

  if (!userId) {
    res.status(401).json({ success: false, message: 'Não autorizado.' });
    return;
  }

  // ✅ Verificar se o jogo existe E pertence ao usuário
  const game = await prisma.game.findFirst({ 
    where: { id, userId } 
  });
  
  if (!game) {
    res.status(404).json({ success: false, message: 'Jogo não encontrado.' });
    return;
  }

  await prisma.game.delete({ where: { id } });

  res.status(200).json({ 
    success: true, 
    message: 'Jogo removido com sucesso.' 
  });
}
```

**Frontend - Modal de Confirmação:**
```typescript
// ✅ Confirmação antes de deletar
const handleDeleteGame = async (gameId: string) => {
  const confirmed = window.confirm(
    'Tem certeza que deseja remover este jogo da sua coleção? Esta ação é irreversível.'
  );
  
  if (!confirmed) return;

  try {
    await deleteGame(gameId);
    setGames(games.filter(g => g.id !== gameId)); // Atualizar UI imediatamente
    alert('Jogo removido com sucesso!');
  } catch (error) {
    alert('Erro ao remover jogo');
  }
};
```

**Ações Tomadas:**
1. Implementar validação de `userId` em Update e Delete
2. Retornar erro 403 (Forbidden) se usuário não é o dono
3. Adicionar modal de confirmação no frontend
4. Escrever testes unitários para validar ownership

**Resultado:** ✅ CRUD completo com segurança de escopo, 8 testes passando

---

## 📅 Ciclo 3: Perfil do Usuário e Gerenciamento de Contexto da IA

**Escopo Inicial:** Criação da tela de perfil para alteração de dados cadastrais (nome, e-mail, senha) e exclusão definitiva da conta.

### ❌ Problema Encontrado
Durante o processamento do código pela IA, o limite de tokens/créditos da conta foi atingido, causando queda de conexão e "amnésia de contexto" na nova conta utilizada. Além disso, **deletar o usuário deixava jogos órfãos no banco de dados**, violando a integridade referencial.

### 🔍 Diagnóstico
1. Limite de tokens da IA atingido durante geração de código complexo
2. Nova instância da IA sem contexto do projeto
3. Schema.prisma sem `onDelete: Cascade` na relação User → Game
4. Risco de dados órfãos no banco

### ✅ Refinamento Aplicado

**Antes (Schema sem Cascade Delete):**
```prisma
// ❌ PROBLEMA: Deletar usuário deixa jogos órfãos
model User {
  id           String   @id @default(uuid())
  name         String
  email        String   @unique
  passwordHash String   @map("password_hash")
  createdAt    DateTime @default(now()) @map("created_at")

  games Game[]

  @@map("users")
}

model Game {
  id        String    @id @default(uuid())
  userId    String    @map("user_id")
  title     String
  platform  String
  condition Condition
  region    Region    @default(RegionFree)
  notes     String?
  createdAt DateTime  @default(now()) @map("created_at")

  // ❌ Sem onDelete: Cascade
  user User @relation(fields: [userId], references: [id])

  @@map("games")
}
```

**Depois (Schema com Cascade Delete):**
```prisma
// ✅ SOLUÇÃO: Cascade delete remove jogos automaticamente
model User {
  id           String   @id @default(uuid())
  name         String
  email        String   @unique
  passwordHash String   @map("password_hash")
  createdAt    DateTime @default(now()) @map("created_at")

  games Game[]

  @@map("users")
}

model Game {
  id        String    @id @default(uuid())
  userId    String    @map("user_id")
  title     String
  platform  String
  condition Condition
  region    Region    @default(RegionFree)
  notes     String?
  createdAt DateTime  @default(now()) @map("created_at")

  // ✅ onDelete: Cascade garante limpeza automática
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("games")
}

enum Condition {
  Sealed
  CompleteInBox
  Loose
  Digital
}

enum Region {
  NTSC
  PAL
  NTSC_J     @map("NTSC-J")
  RegionFree
}
```

**Controller - Exclusão de Conta com Cascade:**
```typescript
// ✅ Cascade delete remove usuário E todos seus jogos
async delete(req: Request, res: Response): Promise<void> {
  const userId = req.userId;

  if (!userId) {
    res.status(401).json({ success: false, message: 'Não autorizado.' });
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
    return;
  }

  // ✅ Cascade delete remove usuário E todos os jogos vinculados automaticamente
  await prisma.user.delete({ where: { id: userId } });

  res.status(200).json({
    success: true,
    message: 'Conta deletada com sucesso.'
  });
}
```

**Frontend - Modal de Confirmação Crítica:**
```typescript
// ✅ Confirmação com aviso severo
const handleDeleteAccount = async () => {
  const confirmed = window.confirm(
    'ATENÇÃO: Esta ação é IRREVERSÍVEL!\n\n' +
    'Todos os seus dados e jogos salvos serão apagados para sempre.\n\n' +
    'Deseja continuar?'
  );

  if (!confirmed) return;

  try {
    await deleteProfile();
    localStorage.removeItem('token');
    navigate('/login');
    alert('Conta deletada com sucesso.');
  } catch (error) {
    alert('Erro ao deletar conta');
  }
};
```

**Engenharia de Prompt - Injeção de Contexto:**
```
Instrução: Você perdeu contexto do projeto. Leia PRIMEIRO os arquivos abaixo 
antes de gerar qualquer código:

1. backend/prisma/schema.prisma — Estrutura do banco
2. backend/src/controllers/profile.controller.ts — Controller existente
3. backend/src/routes/user.routes.ts — Rotas existentes

Depois, implemente a exclusão de conta com cascade delete no Prisma.

Objetivo: Garantir que ao deletar um usuário, todos os seus jogos sejam 
removidos automaticamente do banco de dados.

Regras:
- Usar onDelete: Cascade na relação User → Game
- Executar npx prisma migrate dev
- Escrever testes para validar cascade
```

**Ações Tomadas:**
1. Adicionar `onDelete: Cascade` no schema.prisma
2. Executar `npx prisma migrate dev --name add_cascade_delete`
3. Injetar contexto manual em novo prompt para IA
4. Escrever 17 testes para validar exclusão em cascata
5. Testar manualmente: deletar usuário → verificar se jogos foram removidos

**Resultado:** ✅ Cascade delete funcionando, integridade referencial garantida, 17 testes passando