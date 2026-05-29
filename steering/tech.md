# Technology Stack & Architecture: MemoryCard

## 1. Stack Tecnológica
- **Frontend:** React (com Vite), TypeScript, TailwindCSS.
- **Backend:** Node.js com Express, TypeScript.
- **Banco de Dados:** PostgreSQL.
- **ORM / Query Builder:** Prisma ORM.
- **Autenticação:** JSON Web Tokens (JWT) e bcrypt para hash de senhas.
- **Kiro:** IDE e LLM auxiliar para o projeto.

## 2. Arquitetura do Banco de Dados (Esquema Conceitual)

### Tabela: Users
- `id`: UUID (Primary Key)
- `name`: String
- `email`: String (Unique)
- `password_hash`: String
- `created_at`: Timestamp

### Tabela: Games
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key -> Users.id)
- `title`: String
- `platform`: String (ex: PS2, Super Nintendo, Nintendo Switch)
- `condition`: Enum (Sealed, CompleteInBox, Loose, Digital)
- `region`: Enum (NTSC, PAL, NTSC-J, RegionFree)
- `notes`: Text (Opcional, para detalhes da compra ou estado)
- `created_at`: Timestamp

## 3. Diretrizes de Código para a IA
- Sempre utilize TypeScript com tipagem estrita.
- Utilize o padrão MVC no Backend separando em Routes, Controllers e Models
- No Frontend, utilize componentes funcionais e Hooks customizados para lógica de API.