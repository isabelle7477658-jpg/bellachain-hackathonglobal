# Estrutura funcional e técnica do BellaChain

## Direção do produto

A primeira versão operacional deve organizar o atendimento entre clientes e salões/prestadores: descobrir prestadores, consultar serviços e disponibilidade, criar/confirmar/cancelar agendamentos e administrar o catálogo. O pagamento, a carteira, os tokens e a blockchain ficam fora do fluxo obrigatório nesta etapa. Nenhuma tela deve apresentar saldo ou compra como confirmados até existir um módulo financeiro conectado e reconciliado.

## Perfis

- **Cliente:** mantém perfil, pesquisa prestadores, consulta serviços e horários, agenda, consulta histórico e cancela conforme a política aceita.
- **Prestador:** representa um profissional autônomo ou membro de um salão; mantém perfil público, serviços, preços, horários, bloqueios de agenda e regras de cancelamento; acompanha agendamentos.
- **Administrador:** administra contas, prestadores e suporte, sem se passar pelo cliente/prestador nas operações de negócio.

Um salão e um prestador autônomo precisam ser representáveis. A associação de funcionários a um estabelecimento não deve depender de um único `prestador_usuario_id` nem presumir que todo funcionário é dono do catálogo.

## Módulos de aplicação

1. **Identidade e acesso** — cadastro, login, sessão, papéis e perfil.
2. **Prestadores e estabelecimentos** — perfil, dados públicos, membros e estado de publicação.
3. **Catálogo** — serviços, categoria, duração, preço de referência, ativação e política de cancelamento.
4. **Agenda** — horários recorrentes, exceções/bloqueios, prevenção de sobreposição e disponibilidade.
5. **Agendamentos** — solicitação, confirmação, conclusão, cancelamento e histórico; política do serviço copiada no momento do aceite.
6. **Notificações e auditoria** — eventos de alteração e mensagens operacionais (email/push podem entrar depois).
7. **Pagamentos (fase posterior)** — pacote/crédito, método de pagamento, liquidação, reembolso, carteira e Solana. Integrar como módulo/adaptador depois que os fluxos acima estiverem estáveis.

## Modelo de dados conceitual inicial

- `usuarios`: identidade e autenticação.
- `estabelecimentos`: salão ou entidade de atendimento; pode ser omitida para prestador autônomo.
- `membros_estabelecimento`: relação entre estabelecimento, usuário e papel local (proprietário, gerente, prestador).
- `servicos`: pertence a um prestador ou estabelecimento; inclui duração e política de cancelamento editável.
- `disponibilidade_prestador`: regra semanal de horários de atendimento.
- `bloqueios_agenda`: férias, intervalos e indisponibilidades extraordinárias.
- `agendamentos`: cliente, prestador, serviço, início/fim, estado e snapshot da política aceita.
- `historico_agendamento`: auditoria de transições, autor, instante e motivo.

O banco de dados é a fonte de verdade para identidade, catálogo e agenda nesta fase. Não armazenar colunas de pagamento, token, reserva financeira ou saldo até fechar o fluxo comercial. Preservar as tabelas de pontos como legado isolado, sem misturá-las ao novo agendamento.

## Estados funcionais

Agendamento: `solicitado` → `confirmado` → `concluido`; `solicitado` pode virar `recusado` ou `cancelado`; `confirmado` pode virar `cancelado` ou `nao_compareceu`. Toda transição deve registrar autor e horário. O prazo e a política de cancelamento são um snapshot imutável por agendamento; atualizar o serviço afeta apenas novos agendamentos.

A definição de `solicitado` versus confirmação imediata deve depender da regra de agenda do prestador. Não aceitar dois agendamentos simultâneos para o mesmo prestador e intervalo, mesmo em requisições concorrentes.

## Organização técnica alvo

Backend Express organizado por domínio, com validação na borda e regras de negócio em serviços; controladores cuidam de HTTP e repositórios cuidam de consultas PostgreSQL. Rotas e permissões devem deixar explícito o escopo do recurso: cliente próprio, catálogo do prestador autenticado ou operação administrativa.

Frontend React organizado por áreas: autenticação, descoberta/catálogo, agenda do cliente, gestão do prestador e administração. Separar formulários e estados de carregamento/erro por fluxo. A tela atual `PacotesPortal` é provisória e deve ser dividida; pontos/recompensas ficam sob uma entrada legada.

Migrações versionadas são a única forma de alterar bancos existentes. Schema de instalação nova e migrações precisam representar o mesmo modelo. Criar restrições e índices junto com a regra de negócio (unicidade por estabelecimento/prestador, chaves estrangeiras e prevenção de colisão da agenda).

## Sequência de entrega

1. Fechar o escopo de salão versus profissional autônomo, papéis locais e regras de confirmação do agendamento.
2. Corrigir a base estrutural: relação estabelecimento/prestador, serviços com escopo correto e migração segura.
3. Implementar disponibilidade, bloqueios e criação/consulta de agendamentos com proteção contra sobreposição.
4. Implementar cancelamento, histórico e telas distintas para cliente e prestador.
5. Revisar autorização por perfil e isolamento de dados; validar o ciclo completo no PostgreSQL.
6. Só então definir o pacote pré-pago e conectar pagamento. A integração Solana atual permanece protótipo isolado e não participa deste fluxo.

## Gaps identificados no código atual

- Serviços são globalmente únicos por nome no schema, embora já tenham um campo de prestador na migração; salões distintos deveriam poder oferecer serviços com o mesmo nome.
- Não existem tabelas de estabelecimento/membros, disponibilidade, bloqueios nem agendamentos futuros. `atendimentos` registra serviço realizado e não substitui uma agenda.
- O portal de pacotes concentra funções de carteira, catálogo e política de serviço; dashboards anteriores continuam como legado.
- Configurações de cancelamento já estão no schema de serviços, mas não há fluxo de agendamento que as copie e aplique.
- As tabelas e chamadas de pacotes/Solana estão adiantadas em relação ao núcleo de agenda e dependem de integração financeira ainda não definida.
- A estrutura aqui é uma proposta técnica derivada do estado atual; preços, duração de serviço, confirmação automática e escopo de cada salão precisam ser definidos como regras de produto antes da migração final.

## Fora desta fase

Compra de tokens, custódia, carteira inteligente, saldo, pacote pré-pago, taxas, liquidação bilateral, reembolso on-chain, integração com mint e implantação Solana. Esses itens serão retomados após a estrutura de catálogo e agenda estar validada.
