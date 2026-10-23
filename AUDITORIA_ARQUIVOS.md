# Auditoria de arquivos e dependências

Data: 23/10/2026  
Método: busca estática por imports, referências em rotas, scripts e documentação. Não foram executados testes nem build.

## Removidos por não terem referências ativas

- `backend/src/models/Usuario.js` — classe sem importadores no backend.
- `backend/src/config/blockchain.js` — configuração EVM sem importadores; o projeto usa Solana no fluxo atual e o contrato EVM permanece isolado como legado.
- `frontend/src/lib/supabaseClient.js` — cliente não importado. A aplicação usa a API Express; a conexão PostgreSQL/Supabase é feita no backend.
- `frontend/sobre.html` — página estática antiga de pontos, duplicada pela rota React `/sobre`; o Vite está configurado como SPA com `index.html` como entrada.
- `frontend/build.log` — arquivo de saída/log, não é entrada do aplicativo.

## Dependências removidas

- Backend: `ethers`, usado somente pela configuração EVM removida.
- Frontend: `axios`, `@supabase/supabase-js` e `@coral-xyz/anchor`; não havia importações no código ativo. As transações Solana existentes usam diretamente `@solana/web3.js`.

Os manifestos e lockfiles foram atualizados com `npm uninstall --package-lock-only --ignore-scripts` nos diretórios respectivos.

## Mantidos intencionalmente

- `smart-contracts/` e o contrato `BellaPoints.sol`: legado explicitamente referenciado na documentação e ainda útil como histórico; não participa do backend atual.
- `solana-programs/`, `frontend/src/lib/solanaPackages.js` e `PacotesPortal.jsx`: estão conectados entre si e/ou referenciados, embora o fluxo de pagamento tenha sido adiado como prioridade do produto.
- `DashboardCliente.jsx` e `DashboardFuncionario.jsx`: acessíveis pela rota `/legado-pontos`.
- `SobreBellaChain.jsx`: acessível pela rota `/sobre`.
- `backend/src/services/rewardsService.js` e rotas de recompensas: compõem o fluxo legado ainda montado na API.
- `vite.config.js`, `tailwind.config.js` e `postcss.config.js`: arquivos de configuração carregados pelas ferramentas, mesmo sem import explícito pela aplicação.

## Limites

A busca estática não prova ausência de uso por ferramentas externas, links salvos ou processos de deploy. Os cinco arquivos removidos foram avaliados por ausência de referências no repositório e, nos casos das páginas de informação, pela existência de uma alternativa roteada. Não alterei arquivos além dos itens acima, manifestos/lockfiles e do relatório. A exclusão preexistente de `Novo(a) Documento de Texto.txt` foi preservada sem alteração.
