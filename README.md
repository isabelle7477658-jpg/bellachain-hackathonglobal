# BellaChain

Sistema de fidelidade para salões de beleza com integração de blockchain, gestão de clientes, pontuação por atendimentos e recompensas digitais.

## Visão geral

O BellaChain foi pensado para modernizar a experiência de fidelização em salões de beleza. O sistema permite:

- cadastrar clientes e funcionários;
- registrar atendimentos;
- gerar BellaPoints conforme o valor do serviço;
- consultar saldo e histórico de pontos;
- gerenciar recompensas e resgates;
- manter registros de transações em ambiente blockchain.

## Objetivo

Desenvolver um protótipo funcional de programa de fidelidade para salões de beleza, combinando uma interface amigável com a rastreabilidade e a segurança proporcionadas pela tecnologia blockchain.

## Funcionalidades principais

### Cliente
- cadastro e login;
- consulta de saldo de BellaPoints;
- histórico de ganhos e resgates;
- visualização de recompensas disponíveis.

### Funcionário
- identificação de clientes;
- registro de atendimentos;
- geração automática de pontos;
- acompanhamento de serviços realizados.

### Administrador
- cadastro de serviços;
- cadastro de recompensas;
- configuração do programa de fidelização;
- consulta de métricas e relatórios.

## Regras de negócio

- a pontuação é calculada a partir do valor do atendimento;
- pontos são gerados apenas para atendimentos concluídos;
- o saldo é calculado com base nos pontos recebidos e utilizados;
- resgates só são permitidos quando o cliente possui saldo suficiente;
- registros de pontos e recompensas devem ser rastreáveis.

## Stack tecnológica

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Banco de dados: MySQL
- Autenticação: JWT + bcrypt
- Contrato inteligente: Solidity + Hardhat

## Estrutura do projeto

```text
bella-chain/
├── backend/
│   ├── src/
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── smart-contracts/
│   ├── contracts/
│   ├── scripts/
│   └── hardhat.config.js
├── database/
│   ├── schema.sql
│   └── seeds.sql
├── .gitignore
├── .gitattributes
├── README.md
└── package.json
```

## Como executar

### 1) Instalar dependências

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

#### Smart contracts
```bash
cd smart-contracts
npm install
```

### 2) Configurar banco de dados

Crie o banco e execute os scripts em:

- `database/schema.sql`
- `database/seeds.sql`

### 3) Configurar variáveis de ambiente

No backend, crie um arquivo `.env` com os dados de conexão ao MySQL e a porta do servidor.

### 4) Rodar a aplicação

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

Smart contract:
```bash
cd smart-contracts
npx hardhat compile
```

## Fluxo principal

1. o cliente ou funcionário realiza login;
2. o funcionário registra um atendimento;
3. o sistema calcula os BellaPoints;
4. os pontos são registrados no histórico do cliente;
5. o cliente pode resgatar recompensas usando o saldo disponível.

## Observações

Este projeto é um protótipo acadêmico e pode ser expandido com melhorias em autenticação, relatórios, UX e integração mais robusta com blockchain.

## Licença

Este projeto foi desenvolvido como estudo e protótipo interno sem uma licença comercial definida.
