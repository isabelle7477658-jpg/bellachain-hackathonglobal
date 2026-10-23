# BellaChain: pacotes flexÃ­veis na Solana

## Regra do produto

O cliente compra um pacote de crÃ©dito sem escolher os serviÃ§os. Ao agendar, escolhe um serviÃ§o do prestador; o valor correspondente sai do saldo livre e passa a saldo reservado. Na conclusÃ£o, cliente e prestador assinam a liquidaÃ§Ã£o. O prestador recebe o valor confirmado e qualquer diferenÃ§a volta ao saldo livre.

O BellaChain nÃ£o guarda chaves privadas. A compra deposita os tokens em uma conta de token associada a uma carteira inteligente do cliente. Essa carteira Ã© uma PDA cuja autoridade Ã© o programa; o cliente autoriza operaÃ§Ãµes com sua chave. O programa sÃ³ permite saque do saldo livre. Isso mantÃ©m a custÃ³dia da chave com o cliente, mas o saldo reservado fica sujeito ao cÃ³digo on-chain enquanto durar a reserva.

Uma carteira Solana comum nÃ£o consegue impedir que o titular gaste tokens reservados. DelegaÃ§Ã£o SPL Ã© revogÃ¡vel pelo titular; por isso, nÃ£o serve como garantia de bloqueio do pacote. A carteira inteligente evita essa divergÃªncia entre saldo reservado e fundos ainda gastÃ¡veis.

## Estados e regras

- Compra: `aguardando_compra` â†’ `ativo` â†’ `esgotado` ou `cancelado`.
- Reserva: `aguardando_reserva_onchain` â†’ `reservada` â†’ `concluida`, `cancelada`, `falta` ou `contestada`.
- O prazo de cancelamento, a taxa tardia e a regra de falta sÃ£o copiados para a reserva no momento do agendamento. MudanÃ§as na regra do serviÃ§o valem para novos agendamentos.
- Antes do limite, cancelamento do cliente devolve todo o valor reservado ao saldo livre.
- Depois do limite, a taxa percentual aceita no agendamento pode ser liberada ao prestador; o restante volta ao saldo livre.
- Cancelamento pelo prestador devolve todo o valor reservado. Falta pode liberar a taxa acordada, apÃ³s o horÃ¡rio do serviÃ§o.
- Os valores on-chain sÃ£o inteiros nas unidades mÃ­nimas do mint SPL; nunca usar ponto flutuante para saldo ou liquidaÃ§Ã£o.

## O que foi iniciado

- MigraÃ§Ã£o PostgreSQL para carteira Solana vinculada, catÃ¡logo de pacotes, compras, reservas, snapshots de regras e eventos de transaÃ§Ã£o.
- API para provar controle de uma carteira por assinatura Ed25519, listar pacotes publicados e gerenciar rascunhos de pacote.
- API de serviÃ§os com configuraÃ§Ã£o de prazo de cancelamento e polÃ­ticas de cancelamento tardio/falta.
- Programa Anchor com carteira inteligente, criaÃ§Ã£o de pacote, compra, reserva, liquidaÃ§Ã£o bilateral, cancelamento, falta e saque do saldo livre.
- Portal React para vincular a carteira Phantom e criar/consultar rascunhos.

## Itens ainda necessÃ¡rios para operar

- O portal jÃ¡ constrÃ³i e envia publicaÃ§Ã£o de pacote e compra; reserva, cancelamento e liquidaÃ§Ã£o ainda nÃ£o tÃªm fluxo de assinaturas coordenadas.
- O backend nÃ£o indexa nem confirma eventos Solana. `publicado` sÃ³ pode ser marcado por um indexador confiÃ¡vel depois de confirmar a transaÃ§Ã£o no programa correto.
- Falta um IDL Anchor gerado do build, cliente Anchor/web3, configuraÃ§Ã£o do RPC, mint SPL Devnet e definiÃ§Ã£o das casas decimais.
- Os arquivos de configuracao sao `solana-programs/bella-packages/Anchor.toml` e `solana-programs/bella-packages/programs/bella_packages/src/lib.rs`; ambos ainda usam um Program ID de exemplo. Gere um ID proprio e alinhe os ambientes antes de publicar.
- O programa ainda nÃ£o foi compilado, auditado ou publicado. Trate como protÃ³tipo e use apenas ambiente local/Devnet depois da revisÃ£o tÃ©cnica.
- A administraÃ§Ã£o e recuperaÃ§Ã£o da carteira inteligente, polÃ­tica de upgrade do programa, disputas, expiraÃ§Ã£o/reembolso integral de pacote e eventual recuperaÃ§Ã£o de cliente precisam ser especificadas antes de mainnet.

## VariÃ¡veis de configuraÃ§Ã£o

Backend: `SOLANA_PAYMENT_MINT`, `SOLANA_PROGRAM_ID`, `SOLANA_RPC_URL`.

Frontend: `VITE_SOLANA_PROGRAM_ID`, `VITE_SOLANA_TOKEN_DECIMALS`, `VITE_SOLANA_RPC_URL`.

Para o banco existente ou uma instalaÃ§Ã£o nova, aplique `database/migrations/20261023_solana_packages.sql` depois de `database/schema.sql` e antes de iniciar a API.


