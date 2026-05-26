# Functional Specifications: MemoryCard

## 1. Regras do Gerenciamento de Conta (Auth)
- **Cadastro:** O email deve ser válido e único. A senha deve ter no mínimo 8 caracteres, contendo pelo menos uma letra e um número.
- **Segurança:** Nenhuma senha pode ser salva em texto puro. Sempre aplicar hash com bcrypt.
- **Sessão:** O token JWT gerado no login deve expirar em 7 dias. Ele deve ser enviado no Header `Authorization: Bearer <token>` nas rotas protegidas.

## 2. Regras do Catálogo de Jogos (Games)
- **Privacidade de Dados:** Um usuário **nunca** pode visualizar, editar ou deletar um jogo que pertença a outro `user_id`. Todas as queries de jogos devem filtrar pelo ID do usuário autenticado.
- **Campos Obrigatórios:** Para cadastrar um jogo, os campos `title`, `platform` e `condition` são obrigatórios.
- **Exclusão:** Quando um usuário deletar sua conta, todos os jogos vinculados a ele devem ser deletados em cascata (Cascade Delete).