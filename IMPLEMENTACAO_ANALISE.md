# BellaChain — Gap analysis atual

Data da revisão: 23/10/2026  
Escopo: código e documentação local no working tree. Esta análise considera o modelo aprovado: compra de pacote sem serviço definido, token em carteira inteligente controlada pelo programa Solana, reserva por serviço escolhido depois, aceite do prestador e liquidação autorizada por cliente e prestador. O prazo e as regras de cancelamento são definidos pelo prestador e copiados para cada reserva.

## Resumo executivo

O projeto tem um protótipo de ponta a ponta para autenticação, catálogo de pacotes, vínculo de carteira e transações on-chain de publicação/compra. Não há, porém, um fluxo operacional de agendamento, aceite, cancelamento e liquidação na interface/API. A sincronização do saldo exibido no PostgreSQL também termina na compra: depois de qualquer operação on-chain, os saldos espelhados ficam desatualizados.

O programa Anchor mudou recentemente para proposta de reserva, aceite do prestador e aprovações de liquidação em transações separadas. Ainda precisa ser compilado/revisado e conectado ao restante do sistema. Há divergência entre as regras configuráveis no cadastro do serviço e os parâmetros que o programa realmente aplica: o contrato recebe taxas em basis points, mas não valida se correspondem à política do serviço nem codifica a escolha entre “devolver” e “cobrar taxa”.

**Conclusão:** protótipo de desenvolvimento, não pronto para uso operacional nem para receber fundos reais. Os bloqueios principais são integração incompleta, regras não impostas on-chain, espelho de saldo sem reconciliação e ausência de validação/implantação do programa.

## Estado por área

| Área | Estado observado | Lacuna principal |
|---|---|---|
| Autenticação e perfis | Backend JWT/bcrypt com rotas protegidas; fluxo legado de login/dashboards permanece | Fallback demo não é persistente; política de papéis e operação/admin em produção requer validação |
| Carteira Solana | Desafio nonce, assinatura Ed25519 e vínculo da chave pública ao usuário | Não transfere tokens; unicidade concorrente precisa de constraint única no banco; troca/desvinculação/recuperação não definidas |
| Catálogo de pacotes | Rascunho no PostgreSQL, publicação assinada e leitura pública de pacotes publicados | Pausar pacote publicado já exige instrução on-chain, mas a UI/API ainda não envia essa instrução |
| Compra | Portal constrói `buy_package`, carteira assina; API verifica transação e espelha compra | Sem indexador/reconciliação; validação RPC precisa ser fortalecida; saldo exibido deixa de ser confiável após reserva/liquidação/saque |
| Reserva | Programa contém proposta e aceite separados; proposta não bloqueia saldo, aceite verifica e reserva saldo | Nenhuma ação de reserva/aceite na UI/API; serviço, preço e política não são validados contra registro confiável; sem agenda/disponibilidade/expiração |
| Liquidação | Programa registra aprovações separadas para o mesmo valor e permite liquidação posterior | Sem UI/API; sem disputa; não há prova funcional compilada; valor acordado carece de política de preço verificável |
| Cancelamento/falta | Programa tem cancelamento do cliente, cancelamento do prestador e reivindicação de falta | Ação/taxa configurada no serviço não é imposta; falta pode ser reivindicada logo após início, sem janela de tolerância; não há fluxo conectado |
| Persistência | Migração PostgreSQL adiciona entidades de pacotes, compras, reservas e eventos | Banco é espelho parcial; migração e consultas não foram exercitadas em PostgreSQL real nesta revisão |
| Interface | Portal de pacotes, política do prestador, publicação, compra e listagem de compras | Não contém reserva, aceite, cancelamento, aprovações, saque nem estados de transação completos; áreas legadas continuam acessíveis |
| Contratos e deploy | Estrutura Anchor/IDL fonte e carteira inteligente PDA/vault SPL | Program ID é placeholder; sem compilação, auditoria, implantação, upgrade policy ou configuração validada de mint/rede |
| Operação | README e guia de instalação descrevem PostgreSQL e Solana em desenvolvimento | Sem indexador, monitoramento, gestão de RPC, alertas, suporte a falhas ou recuperação/disputas |

## Gaps prioritários

### P0 — Regra do serviço não é garantida pela transação

O backend guarda prazo, ação de cancelamento e taxas no serviço, mas `reserve_service` recebe apenas referências e taxas informadas pelo cliente. O programa não lê uma conta on-chain de serviço nem comprova que os valores correspondem à configuração do prestador. Também trata a taxa como percentual sempre que passou do prazo; não recebe a opção `devolver`/`cobrar_taxa`. O cliente pode acabar aprovando termos diferentes dos configurados ou exibidos.

**Necessário:** criar estado verificável de serviço/política on-chain, atualizado pelo prestador, e fazer a reserva copiar essa política; ou usar assinatura verificável do prestador sobre um snapshot completo. Exibir snapshot e preço ao cliente antes de assinar. Definir se taxa é percentual, valor fixo ou retenção total.

### P0 — Fluxo de reserva e liquidação não está integrado

As instruções on-chain para propor/aceitar reserva e aprovar/liquidar existem no código, mas não há handlers/endpoints nem componentes React para executá-las. O usuário não consegue concluir o fluxo de negócio pelo aplicativo. A migração possui `reservas_pacotes`, mas a API não cria nem atualiza os respectivos estados.

**Necessário:** implementar ações e autorização por papel; montar transações Phantom para cada etapa; espelhar assinaturas/eventos com idempotência; mostrar estados pendentes e falhas sem tratar o banco como autoridade de saldo.

### P0 — Programa Anchor ainda sem compilação/auditoria

O programa e o layout de contas foram alterados para suportar aprovações separadas. Não existe evidência atual de build, IDL gerado, teste local ou Devnet. A mudança no layout de `Reservation` altera o formato serializado; qualquer conta criada por uma implantação anterior precisaria de migração, embora o endereço atual seja placeholder.

**Necessário:** instalar/fixar toolchain, compilar e gerar IDL, revisar validações e contas em cada instrução, testar casos permitidos/rejeitados em localnet e revisar por especialista antes de Devnet/mainnet.

### P0 — Saldos PostgreSQL ficam desatualizados

A compra é espelhada após confirmação RPC; nenhuma instrução posterior atualiza `saldo_disponivel_units`, `saldo_reservado_units` ou `saldo_total_units`. A listagem de compras mostra esses valores como se fossem atuais.

**Necessário:** indexador idempotente dos eventos do programa ou leitura de contas on-chain no backend; reconciliação periódica e indicação de horário/estado da sincronização. Saldo on-chain deve prevalecer.

### P1 — Regras de cancelamento e falta estão incompletas

O serviço permite configurar devolução ou taxa, porém o programa aplica somente bps; `claim_no_show` aceita a partir de `starts_at`, sem período de tolerância nem prova de ausência. A reserva pendente pode ser cancelada pelo cliente antes do aceite, mas a experiência ainda não existe. O cancelamento do prestador reembolsa saldo reservado integralmente.

**Necessário:** definir prazo de tolerância, provas/contestações, efeitos precisos de cada ação, política para reserva não aceita e operação de disputa. Congelar a política na criação da reserva e impedir mudanças retroativas.

### P1 — Risco de divergência e segurança no espelhamento RPC

O helper consulta `getTransaction` e confere instrução/contas/assinatura para as operações atualmente espelhadas. Falta um indexador de programa que processe os eventos, reconcilie estado e trate reprocessamento/reorganização. O banco não deve aceitar status enviados pelo cliente como fonte de verdade.

**Necessário:** validar programa/rede/mint e todos os dados/accounts relevantes; exigir finalização definida para produto; persistir assinatura única; processar eventos de forma repetível e reconciliar os PDAs/vaults com o banco.

### P1 — Vínculo da carteira e conta

A API evita reutilização consultando usuários antes de atualizar o vínculo, mas não há índice único explícito mostrado para `solana_wallet_address`; chamadas concorrentes podem tentar vincular o mesmo endereço. Também não existe fluxo para troca de carteira, perda de acesso ou atendimento a erro de assinatura.

**Necessário:** constraint única parcial no endereço normalizado, transação concorrente segura, política de troca/desvinculação e recuperação que não permita apropriação de saldo.

### P1 — Pacote e serviço não têm modelo de agenda completo

Não há fluxo para escolher serviço depois da compra, selecionar horário, verificar disponibilidade, criar reserva espelhada ou lidar com colisões. O `service_ref` on-chain não é validado contra um registro de serviço e não contém snapshot on-chain do preço/termos suficientes.

**Necessário:** modelo de disponibilidade e reserva off-chain com proteção contra concorrência, referência imutável do serviço, cotação em unidades do mint e aceite/política verificáveis on-chain.

### P1 — Produto de pagamento incompleto

O mint e as casas decimais são variáveis de configuração, sem ativo/taxa/relação com preço em reais definida. Compra é pelo preço integral; não há expiração, reembolso de pacote, transferência de crédito, taxas BellaChain, impostos, chargeback ou atendimento de erro operacional definidos.

**Necessário:** decidir token/moeda, mint por rede, conversão de preço, responsabilidade por taxas e regras comerciais/legais antes de oferecer compras reais.

### P2 — Experiência legada e documentos divergentes

Rotas de dashboard redirecionam para `PacotesPortal`, enquanto componentes antigos de pontos continuam no repositório e em rota de legado. A documentação do modelo ainda descreve reserva/liquidação como capacidades iniciadas, sem refletir precisamente a correção recente. Há texto com codificação quebrada em várias fontes.

**Necessário:** indicar claramente o fluxo legado, atualizar os documentos para o estado corrente e normalizar codificação sem alterar conteúdo funcional inadvertidamente.

## Sequência recomendada

1. Congelar a especificação das transições, estados de disputa, preço, cancelamento tardio e falta.
2. Definir como o programa verifica serviço e política: conta on-chain ou snapshot assinado pelo prestador; não aceitar taxa livremente fornecida pelo cliente.
3. Compilar e revisar o Anchor; gerar IDL e exercitar casos de reserva, aceite, cancelamento, aprovações incompatíveis/iguais, liquidação, falta e saque em localnet.
4. Implementar endpoints e UI de agendamento/aceite/cancelamento/aprovações/liquidação/saque.
5. Implementar indexador e reconciliação; retirar saldo espelhado não sincronizado da interface ou marcá-lo como desatualizado.
6. Corrigir concorrência e idempotência (vínculo único, compras, reservas, assinaturas e disponibilidade de agenda).
7. Fechar configurações de mint/rede/decimais e operações de produção; só então considerar implantação pública.

## Limites desta revisão

Foi feita inspeção estática de documentos, rotas e código local. Não houve execução de testes, build, compilação Anchor, conexão com banco ou transações em Solana; as afirmações de funcionamento transacional não foram verificadas em runtime. Nenhum arquivo `.env` foi consultado.
