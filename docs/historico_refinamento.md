# 🔄 Histórico de Geração e Refinamento de Código - MemoryCard

Este documento registra os 3 ciclos completos de desenvolvimento, identificação de problemas e refinamento de código realizados com o auxílio de IA no projeto MemoryCard.

---

### 📅 Ciclo 1: Autenticação e Configuração de Ambiente (Fullstack)
* **Escopo Inicial:** Criação das tabelas de usuário via Prisma, controllers de login/cadastro no backend e as telas correspondentes em React no frontend.
* **Problema Encontrado:** Ao tentar rodar as migrações e testar a conexão, o Prisma retornava o erro de autenticação `P1000: Authentication failed`, mesmo com a senha teoricamente correta.
* **Refinamento Aplicado:** 1. Investigação de rede, alterando o host de `localhost` para `127.0.0.1` devido a conflitos de IPv6 no Windows.
  2. Validação de caracteres especiais na string de conexão do banco.
  3. **Diagnóstico Final:** Identificado que o *Auto Save* do VSCode estava desativado, fazendo com que o Prisma lesse uma versão antiga e não salva do arquivo `.env`. O recurso foi ativado e as credenciais foram sincronizadas com sucesso.

---

### 📅 Ciclo 2: Expansão do CRUD de Jogos e Segurança de Escopo
* **Escopo Inicial:** Criação da tabela de jogos (`Game`) e desenvolvimento de um Modal no frontend para permitir que o usuário adicionasse títulos à sua coleção.
* **Problema Encontrado:** O planejamento inicial limitou-se apenas à criação (Create) e listagem (Read). Ficou evidente a falta das operações de Edição (Update) e Exclusão (Delete), gerando um CRUD incompleto.
* **Refinamento Aplicado:** 1. Implementação das rotas `PUT` e `DELETE` para os jogos no backend.
  2. **Regra de Segurança Crítica:** Refinamento do controller para verificar se o `userId` dono do jogo bate exatamente com o `userId` extraído do token JWT da requisição, impedindo que um usuário altere ou delete dados de outro (Erro 403).
  3. No frontend, o Modal foi reaproveitado para o fluxo de edição e foi adicionado um alerta de confirmação antes da exclusão.

---

### 📅 Ciclo 3: Perfil do Usuário e Gerenciamento de Contexto da IA
* **Escopo Inicial:** Criação da tela de perfil para alteração de dados cadastrais (nome, e-mail, senha) e exclusão definitiva da conta.
* **Problema Encontrado:** Durante o processamento do código pela IA, o limite de tokens/créditos da conta foi atingido, causando queda de conexão e "amnésia de contexto" na nova conta utilizada. Além disso, deletar o usuário deixava jogos órfãos no banco de dados.
* **Refinamento Aplicado:**
  1. **Engenharia de Prompt:** Criação de um prompt de injeção manual de contexto, forçando a nova instância da IA a ler os arquivos estruturais (`schema.prisma`, rotas e controllers existentes) antes de gerar novos códigos.
  2. **Banco de Dados:** Refinamento do relacionamento no `schema.prisma` adicionando a propriedade `onDelete: Cascade` na relação entre Usuário e Jogo, garantindo que a exclusão da conta limpe automaticamente todos os registros vinculados no PostgreSQL.