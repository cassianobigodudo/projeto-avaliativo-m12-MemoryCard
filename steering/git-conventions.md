# Git and Commit Conventions

Você deve seguir estritamente as regras abaixo ao realizar commits ou criar branches neste projeto.

## 1. Padrão de Mensagem de Commit (Conventional Commits)
Todas as mensagens de commit devem seguir o formato: `<tipo>(<escopo>): <descrição curta em minúsculas>`

### Tipos Permitidos:
- `feat`: Uma nova funcionalidade para o usuário.
- `fix`: Correção de um bug.
- `docs`: Alterações exclusivamente na documentação.
- `style`: Alterações que não afetam o significado do código (espaços em branco, formatação, ponto e vírgula faltando).
- `refactor`: Uma alteração de código que não corrige um bug nem adiciona uma funcionalidade.
- `test`: Adição de testes ausentes ou correção de testes existentes.
- `chore`: Atualizações de tarefas de build, configurações de ferramentas (ex: eslint, gitignore).

### Exemplos:
- `feat(auth): adiciona endpoint de cadastro de usuário`
- `fix(games): corrige filtro de jogos por plataforma`
- `docs(readme): atualiza instruções de instalação local`

## 2. Regras de Ouro para a IA ao Commitar
- **Faça commits atômicos:** Não misture refatoração de código com criação de nova funcionalidade no mesmo commit. Faça um por um.
- **Idioma:** Escreva as mensagens de commit em português.
- **Antes de commitar:** Certifique-se de que o código compila e que os testes existentes (se houver) não foram quebrados.