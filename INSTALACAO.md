# GUIA DE INSTALAÇÃO - BellaChain

## 1. REQUISITOS

- Node.js 18+
- MySQL 8.0+
- npm ou yarn

## 2. INSTALAÇÃO DO BANCO DE DADOS

### Passo 1: Criar o banco de dados e tabelas

```bash
mysql -u root -p < database/schema.sql
```

Isso irá:
- Criar o banco de dados `bellachain`
- Criar todas as tabelas necessárias
- Criar triggers para lógica automática de pontos

### Passo 2: Inserir dados de teste

```bash
mysql -u root -p bellachain < database/seeds.sql
```

Isso irá inserir:
- 1 usuário admin
- 2 funcionários
- 4 clientes
- 10 serviços
- 8 recompensas
- Dados de exemplo de atendimentos

### Verificar instalação

```bash
mysql -u root -p
> USE bellachain;
> SHOW TABLES;
> SELECT COUNT(*) FROM usuarios;
```

## 3. INSTALAÇÃO DO BACKEND

### Passo 1: Navegar até a pasta backend

```bash
cd backend
```

### Passo 2: Instalar dependências

```bash
npm install
```

### Passo 3: Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais do MySQL:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=bellachain
JWT_SECRET=sua_chave_secreta_aqui
```

### Passo 4: Executar em desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3001/api

## 4. INSTALAÇÃO DO FRONTEND

### Passo 1: Navegar até a pasta frontend

```bash
cd frontend
```

### Passo 2: Instalar dependências

```bash
npm install
```

### Passo 3: Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Verifique se a URL da API está correta:

```env
VITE_API_URL=http://localhost:3001/api
```

### Passo 4: Executar em desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:5173

## 5. EXECUTAR TUDO

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## 6. CREDENCIAIS PADRÃO

### Admin
- Email: `admin@bellachain.com`
- Senha: `admin123`

### Funcionário
- Email: `ana@bellachain.com`
- Senha: `ana123`

### Cliente
- Email: `marina@bellachain.com`
- Senha: `marina123`

**Nota:** As senhas no banco estão criptografadas com bcrypt. Use as credenciais acima para fazer login.

## 7. TESTAR A API

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "marina@bellachain.com",
    "senha": "marina123"
  }'
```

Resposta:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tipo_usuario": "cliente",
  "usuario_id": 4,
  "nome": "Marina Costa",
  "email": "marina@bellachain.com",
  "message": "Login realizado com sucesso"
}
```

### Listar Clientes
```bash
curl http://localhost:3001/api/clientes
```

### Obter Perfil do Cliente Autenticado
```bash
curl -H "Authorization: Bearer seu_token_aqui" \
  http://localhost:3001/api/clientes/meu-perfil
```

### Resgatar Recompensa
```bash
curl -X POST http://localhost:3001/api/recompensas/resgatar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer seu_token_aqui" \
  -d '{
    "cliente_id": 1,
    "recompensa_id": 1
  }'
```

## 8. BUILD PARA PRODUÇÃO

### Frontend
```bash
cd frontend
npm run build
```

Arquivos otimizados em: `frontend/dist/`

### Backend
```bash
cd backend
npm run start
```

## 9. TROUBLESHOOTING

### Erro de conexão ao MySQL
- Verifique se o MySQL está rodando
- Confira as credenciais em `.env`
- Verifique o host e porta (padrão: localhost:3306)

### Porta 3001 já em uso
```bash
# Mude a porta em .env ou use:
PORT=3002 npm run dev
```

### Porta 5173 já em uso
```bash
npm run dev -- --port 5174
```

### Token JWT inválido
- Verifique se o JWT_SECRET em `.env` é o mesmo
- Verifique se o token não expirou (padrão: 24h)

## 10. PRÓXIMOS PASSOS

1. Configurar banco de dados em produção
2. Configurar contrato inteligente do EVM
3. Fazer deploy do backend (Heroku, AWS, DigitalOcean)
4. Fazer deploy do frontend (Vercel, Netlify)
5. Configurar CI/CD

## 11. DOCUMENTAÇÃO ADICIONAL

- API: `/docs/API.md`
- Banco de Dados: `/docs/BANCO_DADOS.md`
- Guia do Usuário: `/docs/GUIA_USUARIO.md`
- README Principal: `/README.md`
