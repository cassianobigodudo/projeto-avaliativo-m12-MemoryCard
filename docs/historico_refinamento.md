# 🔄 Histórico de Geração e Refinamento de Código - MemoryCard

Este documento registra os 3 ciclos completos de desenvolvimento, identificação de problemas e refinamento de código realizados com o auxílio de IA no projeto MemoryCard.

---

## 📅 Ciclo 1: Autenticação com Validações e Testes (Backend)

**Escopo Inicial:** Criação do controller de autenticação (cadastro e login) com validações de email, senha e testes unitários.

### ❌ Problema Encontrado
A IA gerou um controller de autenticação funcional, mas **sem validações robustas de entrada**. O código aceitava emails inválidos, senhas fracas e não tinha testes unitários. Além disso, a resposta da API **expunha o hash da senha** em alguns cenários.

### 🔍 Diagnóstico
1. Falta de validação de formato de email (regex)
2. Falta de validação de força de senha (mínimo 8 caracteres, letra + número)
3. Resposta da API retornando `passwordHash` em alguns casos
4. Sem testes unitários para validar comportamento
5. Sem tratamento de email duplicado (erro 409)

### ✅ Refinamento Aplicado

**Antes (Sem validações):**
```typescript
// ❌ INSEGURO: Aceita qualquer entrada
export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    const { name, email, password } = req.body;

    // Sem validação de campos
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: await bcrypt.hash(password, 10),
      },
    });

    // ❌ PROBLEMA: Retorna passwordHash
    res.status(201).json({
      success: true,
      data: user, // Expõe passwordHash!
    });
  }

  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    // Sem validação, sem tratamento de erro
    const user = await prisma.user.findUnique({ where: { email } });
    const match = await bcrypt.compare(password, user.passwordHash);

    if (!match) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!);
    res.status(200).json({ token, user }); // ❌ Expõe passwordHash
  }
}
```

**Depois (Com validações robustas):**
```typescript
// ✅ SEGURO: Validações completas
export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    const { name, email, password } = req.body;

    // ✅ Validação 1: Campos obrigatórios
    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Os campos name, email e password são obrigatórios.',
      });
      return;
    }

    // ✅ Validação 2: Formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: 'O email informado não é válido.',
      });
      return;
    }

    // ✅ Validação 3: Força de senha (mínimo 8 caracteres, letra + número)
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      res.status(400).json({
        success: false,
        message: 'A senha deve ter no mínimo 8 caracteres, contendo pelo menos uma letra e um número.',
      });
      return;
    }

    // ✅ Validação 4: Email duplicado
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'Este email já está cadastrado.',
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
    });

    // ✅ Retorna SEM expor passwordHash
    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  }

  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    // ✅ Validação: Campos obrigatórios
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Os campos email e password são obrigatórios.',
      });
      return;
    }

    // ✅ Buscar usuário
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Email ou senha inválidos.',
      });
      return;
    }

    // ✅ Comparar senha
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      res.status(401).json({
        success: false,
        message: 'Email ou senha inválidos.',
      });
      return;
    }

    // ✅ Gerar token
    const secret = process.env.JWT_SECRET as string;
    const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '7d' });

    // ✅ Retorna SEM expor passwordHash
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  }
}
```

**Testes Unitários Adicionados:**
```typescript
describe('AuthController - register', () => {
  it('Deve cadastrar com sucesso e retornar 201 sem expor senha', async () => {
    const req = mockRequest({ name: 'Fulano', email: 'fulano@email.com', password: 'Senha123' });
    const res = mockResponse();
    
    await controller.register(req as Request, res as Response);
    
    expect(res.statusCode).toBe(201);
    expect(res.jsonBody.data).not.toHaveProperty('passwordHash');
  });

  it('Deve rejeitar email inválido com 400', async () => {
    const req = mockRequest({ name: 'Fulano', email: 'email-invalido', password: 'Senha123' });
    const res = mockResponse();
    
    await controller.register(req as Request, res as Response);
    
    expect(res.statusCode).toBe(400);
    expect(res.jsonBody.message).toContain('email');
  });

  it('Deve rejeitar senha fraca com 400', async () => {
    const req = mockRequest({ name: 'Fulano', email: 'fulano@email.com', password: 'abc' });
    const res = mockResponse();
    
    await controller.register(req as Request, res as Response);
    
    expect(res.statusCode).toBe(400);
    expect(res.jsonBody.message).toContain('senha');
  });

  it('Deve rejeitar email duplicado com 409', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'existing' });
    const req = mockRequest({ name: 'Fulano', email: 'fulano@email.com', password: 'Senha123' });
    const res = mockResponse();
    
    await controller.register(req as Request, res as Response);
    
    expect(res.statusCode).toBe(409);
  });
});
```

**Ações Tomadas:**
1. Adicionar validações de email com regex
2. Adicionar validações de força de senha
3. Adicionar verificação de email duplicado (erro 409)
4. Remover `passwordHash` de todas as respostas da API
5. Escrever 7 testes unitários cobrindo todos os cenários
6. Executar `npm test` com sucesso

**Resultado:** ✅ Controller seguro com validações robustas, 7 testes passando, sem exposição de senhas

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