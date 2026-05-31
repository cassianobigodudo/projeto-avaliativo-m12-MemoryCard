# Histórico de Prompts — MemoryCard 🎮

Este documento registra todos os prompts utilizados durante o desenvolvimento do projeto MemoryCard, incluindo os que geraram erros, com seus respectivos relatórios de resultado.

---

## Prompt 1 — Arquitetura Base do Projeto

**Branch:** `feat/project-setup`

```
Estamos iniciando o projeto MemoryCard. Na raiz do projeto existe a pasta steering onde contém os arquivos product.md, tech.md, spec.md e git-conventions.md. Por favor, leia-os para entender o contexto do produto, arquitetura e padrões de commit antes de começarmos.

Instrução: Você é um desenvolvedor sênior full-stack, pronto para fazer um spec-driven do projeto, leia todo o contexto atenciosamente e monte a arquitetura de todo o projeto em uma nova branch dentro da develop (Toda a organização das pastas, a base do README.md e a base da INSTALLATION.md)

Objetivo: Preparação de toda a arquitetura para começar o desenvolvimento da aplicação MemoryCard

Limitações:
- Seguir ESTRITAMENTE apenas o que está dentro da pasta steering
- Não é permitido fazer coisas fora do escopo do projeto ou das limitações do prompt
- Usar as convenções git que estão no git-conventions quando estiver fazendo a nova branch
```

**Técnicas utilizadas:** Contextualização com arquivos de steering (RAG manual)

**Resultado:** ✅ Sucesso — Toda a arquitetura base do projeto foi criada corretamente, com organização de pastas, README.md e INSTALLATION.md.

---

## Prompt 2 — Cadastro de Usuário (Backend)

**Branch:** `feat/cadastro-usuario`

```
Tarefa: Preciso que você implemente a funcionalidade de Cadastro de Usuário (Backend). Isso inclui a configuração da tabela no Prisma, a rota, o controller e a criptografia de senha usando hash.

Instruções : Trabalhe pensando passo a passo na seguinte ordem. Só avance para o próximo passo após concluir o anterior com sucesso:
1- Branch: Crie uma nova branch a partir da develop chamada feat/cadastro-usuario.
2- Modelagem: Atualize o arquivo schema.prisma com o modelo User (id, name, email, password_hash, created_at). Rode o comando do prisma para gerar/formatar o client.
3- Lógica (Controller): Crie o controller de cadastro. Instale a biblioteca bcrypt (e seus @types se necessário) para fazer o hash da senha antes de salvar no banco. Lembre-se que o email deve ser único.
4- Rota: Crie a rota POST /users/register e conecte ao controller.
5- Commit: Após testar se compila, faça o commit seguindo as regras do nosso git-conventions.md.

Exemplo de Retorno Esperado: Quando o controller retornar o sucesso da criação, o JSON de resposta deve omitir a senha criptografada por segurança. Siga este padrão de retorno:
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Fulano",
    "email": "fulano@email.com"
  }
}

Pode começar o passo 1
```

**Técnicas utilizadas:** Chain-of-Thought (CoT) com execução sequencial passo a passo + One-Shot Example para o formato de retorno da API

**Resultado:** ✅ Sucesso — A IA executou todos os passos sequencialmente, instalou o bcrypt, criou o model no Prisma, o controller e a rota, e realizou o commit corretamente.

---

## Prompt 3 — Testes Unitários do Cadastro

**Branch:** `feat/cadastro-usuario`

```
Agora que tudo está confirmado, gere testes unitários para cada caso no cadastro

Exemplo:
"Teste 1: Logar com sucesso
se logar com sucesso = sucesso
se algo der erro = fracasso"
```

**Técnicas utilizadas:** One-Shot Example para o formato dos testes

**Resultado:** ✅ Sucesso — A IA instalou as dependências de teste necessárias e implementou todos os testes unitários para os cenários de cadastro.

---

## Prompt 4 — Login, JWT e Middleware de Autenticação

**Branch:** `feat/login-usuario`

```
Instrução: Criar passo-a-passo a implementação do login completa do backend, incluindo as rotas, a conexão com o banco de dados e o prisma, geração de token e middleware de proteção de rotas incluindo testes unitários de todos os passos. após tudo, documentar as novas funcionalidades e adições.

Objetivo: Completar a parte de cadastro e login do usuário que está faltando

Regras:
1. Trabalhe em uma nova branch chamada `feat/login-usuario` criada a partir da `develop`.
2. Stack obrigatória: Node.js, Express, Prisma, bcrypt (para comparar senhas) e jsonwebtoken (para o JWT).
3. Padrão MVC: Mantenha a separação de pastas (`controllers/`, `routes/`, `middlewares/`).
4. Segurança do Middleware: O middleware de proteção deve buscar o token no header `Authorization: Bearer <token>` e retornar `401 Unauthorized` se estiver ausente ou inválido.
5. Testes: Escreva testes unitários garantindo que: (A) Login com sucesso gera token, (B) Email inexistente retorna erro, (C) Senha incorreta retorna erro.
6. Documentação: Atualize os arquivos `.md` relevantes (como `spec.md` ou README) adicionando a documentação da nova rota de login e como enviar o token.
7. Commits: Faça commits atômicos de cada etapa seguindo nosso `git-conventions.md`.

Exemplo: Em caso de sucesso no login, o controller NÃO deve retornar o password_hash. O JSON de resposta esperado da API deve seguir estritamente este formato:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Cassiano",
    "email": "cassiano@email.com"
  }
}
```

**Técnicas utilizadas:** Chain-of-Thought com regras numeradas + One-Shot Example para o formato de resposta da API

**Resultado:** ✅ Sucesso — Login, geração de JWT, middleware de autenticação e testes unitários implementados. Commits atômicos realizados e PR aberto ao final.

---

## Prompt 5 — Update e Delete de Usuário (Backend)

**Branch:** `feat/update-delete-usuario`

```
Objetivo: Finalizar todo o CRUD de conta no backend, implementando as funcionalidades de Edição (Update) e Remoção (Delete) de usuários.

Instrução: Abra uma nova branch (ex: `feat/update-delete-usuario`) a partir da `develop`. Prepare todo o desenvolvimento dos controllers e rotas de update e delete no backend utilizando o Prisma. É obrigatório o uso do middleware de autenticação criado anteriormente. Execute testes unitários cobrindo todos os cenários (sucesso e falhas de permissão) e valide. Faça os commits, o push e abra o Pull Request assim que tudo estiver concluído e testado.

Regras:
1. Regra de Ouro de Segurança: APENAS o usuário dono da conta consegue editar ou deletar a sua própria conta.
2. Para aplicar a Regra 1, o controller DEVE verificar se o `id` recebido como parâmetro na rota (ex: /users/:id) é exatamente igual ao `id` extraído do token JWT pelo middleware. Se for diferente, retorne erro 403 (Forbidden).
3. Na edição, não permita que o usuário altere o ID ou altere o email para um email que já exista no banco.
4. Mantenha o padrão MVC e os commits seguindo o arquivo de convenções do projeto.

Exemplo:
Exemplo 1 - Edição com sucesso (PUT ou PATCH /users/:id):
Request Body (O que o frontend vai enviar):
{"name": "Cassiano Atualizado"}
Response (O que a API deve retornar):
{"success": true,"message": "Conta atualizada com sucesso.","data": {"id": "123e4567-e89b-12d3-a456-426614174000","name": "Cassiano Atualizado","email": "cassiano@email.com"}}

Exemplo 2 - Deleção com sucesso (DELETE /users/:id):
Response:
{"success": true,"message": "Conta deletada com sucesso."}

Exemplo 3 - Tentativa de deletar conta de outro usuário (Erro de Segurança):
Response (Status 403):
{"success": false,"message": "Acesso negado. Você só pode modificar a sua própria conta."}
```

**Técnicas utilizadas:** Few-Shot Examples (3 exemplos de resposta da API) + regras de segurança explícitas

**Resultado:** ✅ Sucesso — Update e Delete implementados com verificação de ownership via JWT, testes unitários cobrindo todos os cenários de sucesso e falha de permissão.

---

## Prompt 6 — Frontend: Telas de Auth e Dashboard

**Branch:** `feat/telas-auth`

```
Leia todos os arquivos na pasta steering antes de continuar.

Objetivo: Desenvolver o frontend das telas de Cadastro, Login e Painel do Usuário do projeto MemoryCard, integrando a interface visual com a API do backend de autenticação já existente.

Instrução: Crie os componentes visuais para as telas de Registro, Login e Dashboard do usuário. Você deve configurar o roteamento (navegação) entre essas telas, gerenciar o estado dos formulários, fazer as chamadas HTTP para nossa API e gerenciar o armazenamento do token JWT. Em seguida, escreva testes unitários focados na renderização e interação dessas telas. Por fim, atualize a documentação pertinente.

Regras:
1. Branch: Crie uma nova branch a partir da `develop` chamada `feat/telas-auth`.
2. Stack Obrigatória: React (com Vite), React Router DOM (para rotas) e Vitest/React Testing Library (para os testes). Utilize `fetch` ou `axios` para as requisições API.
3. Integração e Estado: Ao realizar o login com sucesso, salve o token recebido no `localStorage` (ou Context API). A tela do Painel do Usuário deve ser uma rota protegida: se não houver token, redirecione o usuário de volta para o login.
4. Requisições Autenticadas: As requisições feitas na tela do Painel do Usuário devem obrigatoriamente incluir o header `Authorization: Bearer <token>`.
5. Testes: Garanta que existam testes validando: (A) A renderização correta dos inputs, (B) Comportamento quando o usuário tenta enviar o formulário vazio, (C) Redirecionamento correto após o login.
6. Commits: Faça commits atômicos de cada tela ou componente isolado, seguindo as regras do `git-conventions.md`.

Exemplo:
Sua chamada para a API no formulário de login deve tratar tanto o sucesso quanto o erro de forma clara para o usuário. Exemplo do comportamento esperado do fluxo:
1. Usuário digita email e senha corretos e clica em Entrar.
2. Função dispara `POST /users/login`.
3. Resposta 200 OK: O código extrai `response.data.token`, salva no `localStorage.setItem('token', token)` e usa o `useNavigate` do React Router para redirecionar para a rota `/dashboard`.
4. Resposta 401: Exibe uma mensagem em vermelho na tela (ex: "E-mail ou senha incorretos"), sem quebrar a aplicação.
```

**Técnicas utilizadas:** Contextualização com steering + Chain-of-Thought com regras numeradas + One-Shot Example para o fluxo de login

**Resultado:** ⚠️ Parcialmente bem-sucedido com erro — As telas foram criadas corretamente, mas na etapa de testes unitários do frontend ocorreram vários erros de instalação e configuração do Vitest, exigindo intervenção humana para resolver o problema de dependências.

---

## Prompt 7 — Correção dos Testes Frontend (Vitest)

**Branch:** `feat/telas-auth`

```
Kiro, o testador rodou e retornou Error: No test suite found in file para os arquivos LoginPage.test.tsx, ProtectedRoute.test.tsx e RegisterPage.test.tsx.

Isso significa que os arquivos estão vazios ou não possuem a estrutura correta. Por favor, preencha esses arquivos implementando os testes reais. Atenção: Certifique-se de importar o describe, it/test e expect do vitest no topo de cada arquivo e escreva os cenários corretamente utilizando o React Testing Library.
```

**Técnicas utilizadas:** Prompt de correção direta com diagnóstico do erro

**Resultado:** ✅ Sucesso — A IA identificou que os arquivos de teste estavam com estrutura incorreta, corrigiu as importações do Vitest e implementou os cenários de teste. Commits e PRs realizados ao final.

---

## Prompt 8 — CRUD de Jogos Fullstack (Parte 1 — Adicionar Jogo)

**Branch:** `feat/crud-jogos`

```
Instrução: Trabalhe de forma estritamente sequencial. Não avance para o próximo passo sem terminar o anterior.
1. Modelagem (Prisma): Crie o model `Game` no schema.prisma relacionando-o com o `User` (um usuário tem vários jogos). Rode as migrations.
2. Backend (MVC): Crie a rota (POST) e o controller protegidos pelo middleware de autenticação.
3. Testes Backend: Crie os testes unitários da rota garantindo que a regra de negócio funciona.
4. Frontend (UI): Na tela de Dashboard existente, crie um Modal com um formulário para adicionar um jogo.
5. Frontend (Integração): Conecte esse Modal à nossa nova rota do backend enviando o token JWT.
6. Testes Frontend: Escreva testes reais para a abertura do Modal e submissão do formulário.
7. Documentação: Atualize os arquivos .md do projeto com a nova rota e a nova estrutura do banco.

Objetivo: Testar sua capacidade de desenvolver uma funcionalidade Fullstack (Backend e Frontend) de ponta a ponta. Vamos implementar a funcionalidade de "Adicionar Jogo à Coleção" no painel do usuário, respeitando as regras de negócio.

Regras:
1. Branch: Trabalhe em uma nova branch `feat/crud-jogos` a partir da `develop`.
2. Regra de Negócio Crítica: Todo jogo adicionado DEVE ser atrelado ao `userId` do usuário que fez a requisição (extraído do token JWT). Um usuário não pode adicionar jogos na conta de outro.
3. Atenção aos Testes: Lembre-se do erro anterior ao testar o frontend e evite que ele ocorra novamente.
4. Commits: Faça commits parciais (atômicos) a cada passo concluído (ex: um commit para o Prisma, um para o Controller, um para o Modal).

Exemplo: O model `Game` no Prisma deve ter no mínimo os seguintes campos, além da relação com o usuário:
- id (UUID)
- title (String)
- platform (String)
- condition (String - ex: "Novo", "Usado")
- created_at (DateTime)
```

**Técnicas utilizadas:** Chain-of-Thought sequencial com 7 passos + regras de negócio explícitas + referência ao erro anterior (aprendizado iterativo)

**Resultado:** ❌ Timeout (3x) — A IA deu timeout após ~3 minutos na primeira execução, parando no controller e rotas dos jogos. Foi necessário criar uma nova conta para recuperar tokens. Na segunda execução, novo timeout, desta vez parando nos testes do frontend. Na terceira execução o prompt foi reaproveitado com aviso de continuação e tudo foi concluído com sucesso.

> **Nota:** Este foi o prompt mais complexo do projeto. A estratégia de reexecução com contexto de continuação ("ele já foi rodado, cheque o que falta") foi eficaz para contornar o limite de tokens.

---

## Prompt 9 — CRUD de Jogos: Update e Delete

**Branch:** `feat/crud-jogos`

```
*Observação, esqueci de adicionar o update e delete no ultimo prompt

Objetivo: Completar o CRUD de Jogos, implementando as funcionalidades que ficaram faltando: Edição (Update) e Exclusão (Delete), tanto no backend quanto no frontend.

Instrução: Trabalhe de forma estritamente sequencial e só avance para o próximo passo após concluir o anterior.
1. Backend (Rotas e Controllers): Crie a rota de edição (PUT ou PATCH) e a rota de exclusão (DELETE) recebendo o ID do jogo na URL (`/games/:id`). Ambas devem ser protegidas pelo middleware de autenticação.
2. Segurança (Regra Crítica): No controller, ANTES de editar ou deletar, verifique no banco de dados se o `userId` do jogo corresponde ao `userId` extraído do token JWT. Se não for o dono do jogo, retorne erro 403 (Forbidden).
3. Testes Backend: Escreva testes garantindo que: (A) O dono pode editar/deletar, (B) Tentar editar/deletar jogo de outra pessoa retorna erro.
4. Frontend (UI): Adicione um botão de "Editar" e um de "Excluir" em cada item de jogo na lista do Dashboard.
5. Frontend (Integração): Conecte os botões à API. O botão "Editar" pode reutilizar o Modal existente (preenchendo os dados do jogo) ou abrir um novo Modal de edição. O botão "Excluir" deve pedir uma confirmação antes de apagar.
6. Testes Frontend: Escreva testes para garantir que os botões renderizam e as requisições disparam corretamente.
7. Documentação e Commits: Faça commits atômicos por etapa e atualize os arquivos .md com as duas novas rotas.

Regras:
1. Branch: Continue na branch atual se ela ainda estiver aberta, ou crie uma nova branch chamada `feat/update-delete-jogos` a partir da `develop`.
2. Reutilização de Código: No frontend, tente reaproveitar o máximo da lógica de formulário que você já criou para o "Adicionar Jogo".

Exemplo:
O fluxo da exclusão no Frontend deve ser:
1. Usuário clica na lixeira (Deletar).
2. O sistema exibe um alerta nativo ou modal pequeno perguntando: "Tem certeza que deseja remover este jogo da sua coleção?".
3. Se "Sim", dispara a requisição `DELETE /games/:id`.
4. Em caso de sucesso (200 OK), o frontend deve remover o jogo da lista da tela imediatamente, sem precisar dar refresh na página.
```

**Técnicas utilizadas:** Chain-of-Thought sequencial + One-Shot Example para o fluxo de exclusão + reutilização de contexto da branch anterior

**Resultado:** ✅ Sucesso — Update e Delete de jogos implementados fullstack, com verificação de ownership, testes e commits atômicos.

---

## Prompt 10 — Tela de Perfil do Usuário (Fullstack Final)

**Branch:** `feat/perfil-usuario`

```
Objetivo:
Implementar a Tela de Perfil do Usuário completa, permitindo a edição de dados cadastrais (nome, email, senha) e a exclusão definitiva da conta (com remoção de todos os dados vinculados), cobrindo backend, frontend, testes e documentação.

Instrução:
Desenvolva a funcionalidade de forma estritamente sequencial. Só avance para o próximo passo após concluir e testar o anterior com sucesso:
1. Backend (Rotas e Controllers):
- Crie uma rota `PUT /users/profile` para atualizar os dados do usuário logado (se alterar a senha, lembre-se de criptografá-la com bcrypt).
- Crie uma rota `DELETE /users/profile` para a exclusão da conta.
2. Banco de Dados e Exclusão em Cascata:
- Certifique-se de que, ao deletar o usuário, todos os registros relacionados na tabela `Game` sejam excluídos automaticamente. Se necessário, ajuste a relação no seu `schema.prisma` usando `onDelete: Cascade`. Rode as migrations correspondentes.
3. Testes Backend:
- Escreva testes unitários validando: (A) Atualização bem-sucedida, (B) Erro ao tentar mudar o e-mail para um já existente, (C) Exclusão da conta limpa os dados do usuário e seus jogos associados.
4. Frontend (Tela de Perfil):
- Crie a tela/rota de Perfil (`/profile`) com um formulário preenchido com os dados atuais do usuário.
- Adicione os campos para edição e um botão de destaque "Excluir Conta".
5. Frontend (Integração):
- Conecte o formulário à rota de atualização.
- No botão de exclusão, exiba um modal de confirmação crítico. Se o usuário confirmar, dispare a requisição DELETE, limpe o `localStorage` (removendo o token) e redirecione-o para a tela de login.
6. Testes Frontend:
- Crie testes reais usando Vitest/React Testing Library para verificar a renderização dos dados do usuário, o comportamento de envio e a abertura do modal de exclusão.
7. Documentação e Commits:
- Faça commits atômicos por etapa e atualize os arquivos .md com as novas rotas.

Regras:
1. Branch: Trabalhe em uma nova branch chamada `feat/perfil-usuario` criada a partir da `develop`.
2. Segurança Absoluta: Todas as novas rotas no backend devem exigir autenticação via JWT. O usuário só pode editar ou excluir a sua própria conta (extraída do token).

Exemplo:
O comportamento esperado ao clicar em "Excluir Conta" no frontend deve ser:
1. O usuário clica no botão.
2. Um modal aparece com um aviso severo: "Atenção: Esta ação é irreversível. Todos os seus dados e jogos salvos serão apagados para sempre. Deseja continuar?".
3. O usuário clica em "Sim, excluir minha conta".
4. A API responde com 200 OK.
5. O frontend executa `localStorage.removeItem('token')` e navega o usuário de volta para `/login` exibindo uma mensagem de sucesso na tela de destino.
```

**Técnicas utilizadas:** Chain-of-Thought com 7 passos sequenciais + One-Shot Example para o fluxo do modal de exclusão + regras de segurança explícitas

**Resultado:** ✅ Sucesso — Tela de perfil completa implementada fullstack. Backend com `ProfileController`, cascade delete no Prisma, 9 testes unitários no backend e 8 no frontend, todos passando. Prompt final do desenvolvimento do software.

---

---

## Prompt 11 — Linting e Pipeline de CI (GitHub Actions)

**Branch:** `chore/setup-ci`

```
leia silenciosamente os steerings antes de iniciar o prompt

Objetivo:
Configurar o ambiente de qualidade de código (Linting) e criar uma esteira automatizada (Pipeline CI) usando GitHub Actions para o projeto MemoryCard.

Instrução:
Trabalhe de forma sequencial:
1. Linting Backend: Instale e configure o ESLint na pasta do backend. Crie um script `"lint": "eslint ."` no package.json.
2. Linting Frontend: O Vite/React geralmente já vem com ESLint. Apenas certifique-se de que o script `"lint"` está configurado no package.json do frontend e rodando sem erros.
3. GitHub Actions: Crie a pasta `.github/workflows` na raiz do projeto e crie um arquivo chamado `ci.yml`.
4. Configuração do Workflow: Configure o arquivo YAML para rodar sempre que houver um 'push' ou 'pull_request' para as branches `main` e `develop`.
5. Documentação e Commits: Adicione essas mudanças em uma branch `chore/setup-ci`, faça o commit e adicione um parágrafo no README explicando a pipeline.

Regras:
1. O workflow (Pipeline) no GitHub Actions deve ter as seguintes etapas (steps):
- Fazer o checkout do código.
- Configurar o Node.js.
- Instalar as dependências (`npm ci` ou `npm install`) do front e do back.
- Rodar o Lint (`npm run lint`) no front e no back.
- Gerar os clients do Prisma (`npx prisma generate`).
- Rodar os testes (`npm run test`) no front e no back.
2. Não se preocupe com banco de dados real na pipeline agora; foque em rodar os testes de forma isolada ou configurar as variáveis de ambiente necessárias para os testes passarem no GitHub.

Exemplo:
O início do seu arquivo .github/workflows/ci.yml deve se parecer com isso:
name: CI Pipeline
on:
  push:
    branches: [ "main", "develop" ]
  pull_request:
    branches: [ "main", "develop" ]
jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    # ... continuação dos passos
```

**Técnicas utilizadas:** Chain-of-Thought sequencial com 5 passos + One-Shot Example para a estrutura do YAML + regras explícitas para os steps da pipeline

**Resultado:** ⚠️ Parcialmente bem-sucedido na primeira execução — A pipeline foi criada e o job do backend passou, mas o job do frontend falhou no CI com `exit code 1`. Foram identificados três problemas:

1. **ESLint frontend incompatível:** O config foi criado no formato flat (`eslint.config.js`), que requer ESLint v9+, mas o projeto usa ESLint v8. Solução: substituído por `.eslintrc.json` no formato legado, compatível com a versão instalada.
2. **Warning de `any` virou erro no CI:** O `as any` na linha 67 do `profile.controller.test.ts` era um warning local mas bloqueou o lint no CI. Solução: substituído por tipagem explícita `{ data: Record<string, unknown> }`.
3. **Node.js 20 deprecado:** O GitHub Actions emitiu aviso de que Node.js 20 será removido em setembro de 2026. Solução: atualizado para Node.js 24 no `ci.yml`.

Após análise e correção dos três problemas em um commit adicional, a pipeline passou com sucesso nos dois jobs.

---

## Resumo Geral

| # | Funcionalidade | Branch | Resultado |
|---|---|---|---|
| 1 | Arquitetura base | `feat/project-setup` | ✅ Sucesso |
| 2 | Cadastro de usuário (backend) | `feat/cadastro-usuario` | ✅ Sucesso |
| 3 | Testes do cadastro | `feat/cadastro-usuario` | ✅ Sucesso |
| 4 | Login + JWT + Middleware | `feat/login-usuario` | ✅ Sucesso |
| 5 | Update/Delete de usuário | `feat/update-delete-usuario` | ✅ Sucesso |
| 6 | Frontend: telas de auth | `feat/telas-auth` | ⚠️ Erro de configuração Vitest |
| 7 | Correção dos testes frontend | `feat/telas-auth` | ✅ Sucesso |
| 8 | CRUD de jogos (adicionar) | `feat/crud-jogos` | ❌ Timeout 3x → ✅ Sucesso na 3ª tentativa |
| 9 | CRUD de jogos (editar/excluir) | `feat/crud-jogos` | ✅ Sucesso |
| 10 | Tela de perfil (fullstack final) | `feat/perfil-usuario` | ✅ Sucesso |
| 11 | Linting + Pipeline CI | `chore/setup-ci` | ⚠️ Erro no CI (frontend ESLint v8 vs v9, any, Node 20) → ✅ Corrigido na 2ª análise |

**Total de testes ao final do projeto:** 75 (45 backend + 30 frontend) — todos passando ✅
