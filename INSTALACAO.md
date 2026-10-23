# Instalacao e execucao local - BellaChain

## Requisitos

- Node.js 18 ou superior e npm.
- Projeto Supabase com connection string PostgreSQL.

## Banco de dados

Use o banco PostgreSQL do Supabase. Execute `database/schema.sql`, depois `database/migrations/20261023_solana_packages.sql` e por fim `database/seeds.sql` uma vez.

Para Supabase, use a connection string em **Project Settings > Database**. A URL HTTP publica do projeto nao e uma connection string PostgreSQL.

## Backend

```powershell
cd backend
Copy-Item .env.example .env
npm install
npm run dev
```

Edite `backend/.env` e configure pelo menos:

```env
PORT=3001
NODE_ENV=development
SUPABASE_DATABASE_URL=postgresql://postgres:[DB_PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
JWT_SECRET=gere-uma-chave-longa-e-aleatoria
ENABLE_DEMO_LOGIN=true
FRONTEND_URL=http://localhost:5173
```

Use uma chave JWT longa e privada. Nao versione `.env`. A conexao do backend com o Supabase usa TLS.

## Frontend

Em outro terminal:

```powershell
cd frontend
npm install
npm run dev
```

Por padrao, o frontend chama `http://localhost:3001/api`. Para outro endereco, defina `VITE_API_URL` antes de iniciar o Vite. `VITE_ENABLE_DEMO_LOGIN` so habilita o fallback local durante desenvolvimento.

## Contrato EVM legado

O contrato Hardhat em `smart-contracts` mantÃ©m o protÃ³tipo antigo de pontos e nÃ£o participa do fluxo de pacotes.

## Notas de operacao

- Rotas que consultam dados privados exigem JWT.
- O cadastro publico cria somente clientes.
- O fluxo demo nao representa persistencia de pontos, atendimentos ou resgates.
- A recuperacao de senha imprime o link no log em desenvolvimento; nao existe envio de email configurado.
- O estado de implementacao e os gaps restantes estao em `IMPLEMENTACAO_ANALISE.md`.
- A validacao com banco, testes de integracao e compilacao/deploy do contrato ainda precisa ser feita no ambiente de desenvolvimento.

## Programa Solana (em desenvolvimento)

O cÃ³digo Anchor estÃ¡ em `solana-programs/bella-packages`. Instale Rust, Solana CLI e Anchor CLI compatÃ­veis com Anchor 0.31.1. O Program ID atual Ã© apenas um endereÃ§o de exemplo; gere um endereÃ§o prÃ³prio e alinhe `Anchor.toml` e `programs/bella_packages/src/lib.rs` antes de compilar ou publicar.

Configure `SOLANA_PAYMENT_MINT`, `SOLANA_PROGRAM_ID` e `SOLANA_RPC_URL` no backend. No frontend, configure `VITE_SOLANA_PROGRAM_ID`, `VITE_SOLANA_TOKEN_DECIMALS` e opcionalmente `VITE_SOLANA_RPC_URL` (padrÃ£o Devnet).



A conexao direta usa a porta 5432 e pode exigir IPv6. Para um ambiente que so tenha IPv4, selecione Session pooler em Connect no painel Supabase e use a connection string exibida ali.

