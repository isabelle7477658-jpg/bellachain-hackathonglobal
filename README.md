# BellaChain

Aplicação para conectar clientes a salões e prestadores, com catálogo de serviços, agenda e regras de cancelamento. A prioridade atual é estruturar esses fluxos operacionais; pagamentos, pacotes pré-pagos e blockchain serão tratados em uma fase posterior. Pontos e recompensas são legado. Consulte ESTRUTURA_APLICACAO.md para a arquitetura proposta e IMPLEMENTACAO_ANALISE.md para os gaps atuais.

## Componentes

- Frontend: React, Vite e Tailwind CSS.
- Backend: Node.js e Express.
- Banco: Supabase PostgreSQL, acessado pelo backend com SUPABASE_DATABASE_URL.
- AutenticaÃ§Ã£o: JWT e bcrypt.
- Blockchain: programa Anchor/Solana em desenvolvimento; o contrato EVM Ã© legado e nÃ£o liquida pacotes.

## Funcionalidades legadas presentes

- Cadastro pÃºblico de clientes e login por perfil.
- Consulta do perfil do cliente e dos prÃ³prios atendimentos.
- Cadastro de serviÃ§os e recompensas por rotas protegidas.
- Registro de atendimento e crÃ©dito de pontos configurados no campo `servicos.pontos_por_servico`.
- Resgate de recompensa com dÃ©bito de pontos e geraÃ§Ã£o de cÃ³digo.
- RecuperaÃ§Ã£o de senha por token; o envio do link ainda Ã© demonstrativo no ambiente de desenvolvimento.

## ConfiguraÃ§Ã£o local

1. Configure um projeto Supabase e aplique `database/schema.sql`, `database/migrations/20261023_solana_packages.sql` e, uma vez, `database/seeds.sql`.
2. Copie `backend/.env.example` para `backend/.env` e configure SUPABASE_DATABASE_URL e JWT_SECRET.
3. Instale dependÃªncias em `backend` e `frontend` com `npm install`.
4. Inicie o backend com `npm run dev` dentro de `backend`.
5. Inicie o frontend com `npm run dev` dentro de `frontend`.

O frontend usa `VITE_API_URL=http://localhost:3001/api` se a variÃ¡vel nÃ£o estiver definida. O modo demo deve ser usado apenas em desenvolvimento; ele nÃ£o persiste os dados de negÃ³cio.

## Solana e contratos

O programa Anchor estÃ¡ em `solana-programs/bella-packages`. PublicaÃ§Ã£o de pacotes e compra jÃ¡ assinam transaÃ§Ãµes Devnet pelo portal. Reserva, cancelamento e liquidaÃ§Ã£o bilateral ainda precisam do fluxo de assinatura coordenada; faltam IDL de build e indexador. As transaÃ§Ãµes exigem RPC, Program ID, mint SPL e casas decimais configurados para Devnet. O contrato Solidity em `smart-contracts/contracts/BellaPoints.sol` Ã© legado.

## Estado e validacao

Consulte `IMPLEMENTACAO_ANALISE.md` para gaps, prioridades e itens que ainda precisam de validacao. Os arquivos SQL e fluxos alterados precisam ser verificados em um PostgreSQL de desenvolvimento antes de uso operacional.



