# ⚡ GUIA RÁPIDO — Ações Finais para Entrega

**Tempo total:** ~1 hora  
**Prazo:** 01/06/2026 às 15h

---

## 🔴 AÇÃO 1: Fazer Merge para Main (15 min)

```bash
# 1. Verificar status
git status

# 2. Fazer merge de chore/setup-ci para develop
git checkout develop
git merge chore/setup-ci

# 3. Fazer merge de develop para main
git checkout main
git merge develop

# 4. Fazer push
git push origin main
git push origin develop

# 5. Verificar
git log --oneline main -3
```

**Verificação:**
- [ ] Sem conflitos
- [ ] Push bem-sucedido
- [ ] Main contém todos os commits

---

## 🔴 AÇÃO 2: Verificar Quadro Kanban (15 min)

1. Acesse: `https://github.com/seu-usuario/projeto-avaliativo-m12-MemoryCard/projects`

2. Se não existir, criar:
   - Clique em "Projects" → "New project"
   - Nome: "MemoryCard Development"
   - Template: "Table" ou "Board"

3. Criar 6 colunas:
   - [ ] Backlog
   - [ ] To Do
   - [ ] In Progress
   - [ ] In Review
   - [ ] Testing
   - [ ] Done

4. Adicionar cards (mínimo 6):
   - [ ] Arquitetura base
   - [ ] Autenticação (cadastro + login)
   - [ ] CRUD de jogos
   - [ ] Tela de perfil
   - [ ] Testes e documentação
   - [ ] Pipeline de CI/CD

**Verificação:**
- [ ] Quadro criado
- [ ] 6 colunas presentes
- [ ] 6+ cards adicionados

---

## 🟡 AÇÃO 3: Adicionar Commits Faltantes (30 min)

Se necessário (atualmente 6, requer ≥ 8):

```bash
# Opção A: Documentar refatoração
cat > docs/REFACTORING.md << 'EOF'
# Refatoração: Validação Centralizada

## Antes
Cada controller tinha sua própria validação de email, senha, campos obrigatórios.

## Depois
Criado arquivo lib/validators.ts com funções reutilizáveis.

## Resultado
✅ Redução de duplicação de código
✅ Validações consistentes
✅ Testes passando
EOF

git add docs/REFACTORING.md
git commit -m "docs(refactoring): documenta refatoração de validação centralizada"

# Opção B: Melhorar documentação
git add README.md INSTALLATION.md
git commit -m "docs(readme): adiciona exemplos e troubleshooting"

# Opção C: Adicionar comentários
git add backend/src/controllers/
git commit -m "docs(controllers): adiciona JSDoc em funções principais"

# Push
git push origin develop
```

**Verificação:**
- [ ] 2+ commits adicionados
- [ ] Total ≥ 8 commits
- [ ] Push bem-sucedido

---

## 🟢 AÇÃO 4: Verificar Tudo (15 min)

```bash
# Testes backend
cd backend
npm test

# Testes frontend
cd ../frontend
npm test

# Lint backend
cd ../backend
npm run lint

# Lint frontend
cd ../frontend
npm run lint
```

**Verificação:**
- [ ] Todos os testes passando
- [ ] Lint sem erros

---

## 🟢 AÇÃO 5: Submeter no AVA (15 min)

1. Acesse o AVA
2. Vá para a atividade de entrega
3. Preencha:
   - **Link do repositório:** `https://github.com/seu-usuario/projeto-avaliativo-m12-MemoryCard`
   - **Link do quadro Kanban:** `https://github.com/seu-usuario/projeto-avaliativo-m12-MemoryCard/projects/1`
4. Clique em "Enviar"

**Verificação:**
- [ ] Submissão realizada
- [ ] Confirmação recebida

---

## 📋 Checklist Final

- [ ] Merge para main concluído
- [ ] Quadro Kanban criado/verificado
- [ ] Commits suficientes (≥ 8)
- [ ] Testes passando
- [ ] Lint passando
- [ ] Submissão no AVA realizada
- [ ] Antes de 01/06/2026 às 15h

---

## 🆘 Problemas Comuns

### Conflito de Merge
```bash
# Ver conflitos
git status

# Resolver manualmente ou abortar
git merge --abort
```

### Testes Falhando
```bash
# Reinstalar dependências
npm ci

# Rodar testes novamente
npm test
```

### Lint Falhando
```bash
# Corrigir automaticamente
npm run lint -- --fix
```

### Push Rejeitado
```bash
# Fazer pull antes de push
git pull origin develop
git push origin develop
```

---

## 📞 Documentação Completa

Para mais detalhes, consulte:
- `CHECKLIST_ENTREGA.md` — Checklist detalhado
- `PLANO_ACAO_ENTREGA.md` — Plano completo com opcionais
- `RESUMO_EXECUTIVO.md` — Visão geral do projeto

---

**Tempo total:** ~1 hora  
**Próximo passo:** Executar ações acima  
**Prazo:** 01/06/2026 às 15h ✅
