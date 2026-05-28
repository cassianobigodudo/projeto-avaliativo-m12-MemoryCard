# Guia de Instalação — MemoryCard

## Pré-requisitos

Certifique-se de ter instalado em sua máquina:

- [Node.js](https://nodejs.org/) v20 ou superior
- [npm](https://www.npmjs.com/) v10 ou superior
- [PostgreSQL](https://www.postgresql.org/) v15 ou superior
- [Git](https://git-scm.com/)

## 1. Clonar o Repositório

```bash
git clone https://github.com/seu-usuario/projeto-avaliativo-m12-MemoryCard.git
cd projeto-avaliativo-m12-MemoryCard
```

## 2. Configurar o Backend

### 2.1. Instalar dependências

```bash
cd backend
npm install
```

### 2.2. Configurar variáveis de ambiente

Copie o arquivo de exemplo e preencha com suas configurações:

```bash
cp .env.example .env
```

Edite o arquivo `.env`:

```env
# Substitua com as credenciais do seu PostgreSQL
DATABASE_URL="postgresql://seu_usuario:sua_senha@localhost:5432/memorycard_db"

# Defina uma chave secreta forte para o JWT
JWT_SECRET="uma_chave_secreta_muito_forte_aqui"
JWT_EXPIRES_IN="7d"

PORT=3333
NODE_ENV=development
```

### 2.3. Criar o banco de dados

Crie o banco de dados no PostgreSQL:

```sql
CREATE DATABASE memorycard_db;
```

### 2.4. Executar as migrations

```bash
npm run prisma:migrate
```

### 2.5. Gerar o Prisma Client

```bash
npm run prisma:generate
```

### 2.6. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

O backend estará disponível em: `http://localhost:3333`

Para verificar: `http://localhost:3333/health`

---

## 3. Configurar o Frontend

Abra um novo terminal na raiz do projeto:

### 3.1. Instalar dependências

```bash
cd frontend
npm install
```

### 3.2. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

O frontend estará disponível em: `http://localhost:5173`

> O Vite está configurado com proxy para `/api`, então as requisições ao backend são redirecionadas automaticamente para `http://localhost:3333`.

---

## 4. Verificar a Instalação

Com ambos os servidores rodando:

1. Acesse `http://localhost:5173` no navegador
2. Verifique o health check da API: `http://localhost:3333/health`

---

## Scripts Disponíveis

### Backend (`/backend`)

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor em modo desenvolvimento com hot-reload |
| `npm run build` | Compila o TypeScript para JavaScript |
| `npm run start` | Inicia o servidor compilado (produção) |
| `npm run prisma:migrate` | Executa as migrations do banco de dados |
| `npm run prisma:generate` | Gera o Prisma Client |
| `npm run prisma:studio` | Abre o Prisma Studio (interface visual do banco) |

### Frontend (`/frontend`)

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor Vite em modo desenvolvimento |
| `npm run build` | Gera o build de produção |
| `npm run preview` | Visualiza o build de produção localmente |
| `npm run lint` | Executa o ESLint |

---

## Solução de Problemas

**Erro de conexão com o banco de dados:**
- Verifique se o PostgreSQL está rodando
- Confirme as credenciais no arquivo `.env`
- Certifique-se de que o banco `memorycard_db` foi criado

**Porta já em uso:**
- Backend: altere `PORT` no `.env`
- Frontend: altere `server.port` no `vite.config.ts`

**Erro no Prisma Client:**
- Execute `npm run prisma:generate` novamente após qualquer alteração no `schema.prisma`
