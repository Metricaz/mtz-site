# Dashboard Metricaz - Setup Guide

## 📋 Estrutura do Projeto

Este dashboard permite gerenciar dinamicamente os dados do site através do Supabase, começando pelas empresas do carousel.

### Tabelas criadas:
- `s_users` - Usuários do dashboard (com autenticação bcrypt)
- `s_companies` - Empresas/logos do carousel

Todas as tabelas usam prefixo `s_` para identificar dados do site.

---

## 🚀 Setup Inicial

### 1. Executar o SQL no Supabase

1. Vá para [https://app.supabase.com](https://app.supabase.com)
2. Abra o SQL Editor
3. **Cole o conteúdo de `database.sql`** (tabelas e índices)
4. Execute (Run)

✅ As tabelas estão criadas!

### 2. Criar primeiro usuário

#### Opção A: Via Script Node.js (Recomendado)

```bash
node generate-hash.js sua_senha_segura
```

O script vai gerar um hash bcrypt e o SQL pronto para colar no Supabase.

1. Copie o SQL gerado
2. Vá para o SQL Editor do Supabase
3. Cole e execute

#### Opção B: Manual

1. Abra o terminal/Node REPL:
```bash
node
> const bcrypt = require('bcryptjs');
> bcrypt.hash('sua_senha_aqui', 10).then(hash => console.log(hash))
```

2. Copie o hash
3. Cole no Supabase SQL Editor:
```sql
INSERT INTO s_users (email, password_hash, is_active)
VALUES ('seu@email.com', 'seu_hash_aqui', true);
```

### 3. Variáveis de Ambiente

O `.env` já foi preenchido com:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

⚠️ **Nunca commite o `.env` no Git!** Use `.env.local` para desenvolvimento.

---

## 🔐 Segurança

### Encriptação de Senhas
- Usamos **bcryptjs** com salt rounds = 10
- Nenhuma senha é armazenada em texto plano
- Senhas são comparadas com hash na autenticação

### Próximos passos:
- [ ] Implementar RLS (Row Level Security) no Supabase
- [ ] Adicionar 2FA (Two-Factor Authentication)
- [ ] Audit logs para rastrear mudanças
- [ ] Hierarquia de permissões (admin, editor, viewer)

---

## 🎯 Funcionalidades Atuais

### ✅ Implementado:
- [x] Login com autenticação bcrypt
- [x] CRUD de Empresas/Logos
- [x] Upload de URLs de logos com preview
- [x] Reordenação de empresas
- [x] Rota protegida `/dashboard`
- [x] Logout seguro

### 🔜 Próximas etapas:
- [ ] Conectar o Marquee.tsx para ler dados do Supabase em tempo real
- [ ] Adicionar drag-and-drop para reordenar
- [ ] Gerenciar Casos de Uso (Cases)
- [ ] Gerenciar Serviços (Services)
- [ ] Gerenciar Time (Team)
- [ ] Gerenciar Testimoniais

---

## 📝 Usando o Dashboard

### Acessar:
```
http://localhost:5173/metricaz/dashboard/login
```

### Credenciais de Teste:
- Email: `admin@metricaz.com`
- Senha: *a que você criou*

### Funcionalidades:
1. **Adicionar Empresa**: Clique em "Adicionar Empresa"
2. **Editar**: Clique em "Editar" em uma empresa existente
3. **Deletar**: Clique na lixeira (soft delete - marca como inativo)
4. **Logout**: Clique em "Sair"

---

## 🧪 Testes

```bash
# Rodar testes
npm run test

# Build para produção
npm run build

# Preview de produção
npm run preview
```

---

## 🔧 Variáveis de Ambiente

```env
# Supabase (obrigatório)
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=seu_anon_key_aqui
```

---

## 📚 Estrutura de Pastas

```
src/
├── pages/
│   ├── Dashboard.tsx          # Página principal do dashboard
│   ├── DashboardLogin.tsx     # Login
│   ├── Index.tsx              # Homepage (público)
│   └── NotFound.tsx
├── components/
│   ├── dashboard/
│   │   ├── CompanyForm.tsx    # Formulário CRUD
│   │   └── CompanyList.tsx    # Lista de empresas
│   └── ProtectedRoute.tsx     # Proteção de rota
├── hooks/
│   └── useAuth.tsx            # Context de autenticação
├── lib/
│   ├── supabase.ts            # Cliente Supabase
│   └── types.ts               # Tipos TypeScript
└── App.tsx                    # Rotas e providers

database.sql                   # Schema do Supabase
SETUP_DASHBOARD.sql           # Script de setup inicial
generate-hash.js              # Gerador de hash bcrypt
```

---

## ⚠️ Troubleshooting

### "Usuário não encontrado ou inativo"
- Verifique se o usuário foi inserido corretamente na tabela `s_users`
- Confirme que `is_active = true`

### "Erro de conexão ao Supabase"
- Verifique se `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão corretos
- Verifique se o Supabase está online

### Senha não funciona
- Confirme que o hash bcrypt foi gerado corretamente
- Tente regenerar com `node generate-hash.js`

---

## 📞 Suporte

Para mais informações sobre:
- **Supabase**: https://supabase.com/docs
- **bcryptjs**: https://www.npmjs.com/package/bcryptjs
- **React Router**: https://reactrouter.com/

---

**Última atualização**: 2026-07-07  
**Versão**: 1.0.0 (Beta)
