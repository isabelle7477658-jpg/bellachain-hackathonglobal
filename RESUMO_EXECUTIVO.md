# Resumo executivo - BellaChain

## Objetivo

Plataforma em transição para pacotes pré-pagos flexíveis com liquidação bilateral na Solana; pontos e recompensas são legado.

## Estado atual do codigo

- Frontend: React/Vite com landing page, login e dashboards de cliente/funcionario. O dashboard administrativo reutiliza a tela operacional.
- Backend: Express com autenticao JWT, cadastro de cliente, catalogos, atendimentos, resgates e recuperacao de senha.
- Banco configurado no codigo: PostgreSQL usando `pg`. Os guias antigos que mencionavam MySQL foram substituidos; o runtime nao usa MySQL.
- Pontos: o atendimento usa `pontos_por_servico` configurado no servico.
- Blockchain: programa Anchor/Solana iniciado para carteira inteligente, reservas e liquidação; ainda sem build, publicação ou integração do cliente.

## Correcoes recentes

- Adaptador PostgreSQL passou a usar `RETURNING id` em INSERTs sem retorno explicito e oferece transacoes.
- Cadastro de cliente cria usuario e perfil na mesma transacao e nao permite escolher perfil privilegiado.
- Consultas de atendimentos e resgates limitam os resultados do cliente ao dono autenticado.
- Resgate usa transacao, bloqueio de cliente/recompensa e identidade do token para cliente.
- Cancelamento de atendimento preserva registro e cria movimento compensatorio; nao permite reverter pontos que ja foram gastos.
- Campos booleanos de servicos/recompensas foram ajustados para PostgreSQL.

## Lacunas conhecidas

- Ajustes recentes ainda precisam de validacao em PostgreSQL real e testes de integracao.
- Dados demo nao sao persistidos e nao suportam operacoes reais de pontos.
- Preco informado pelo funcionario ainda pode diferir do catalogo; a politica de desconto deve ser definida.
- Recuperacao ainda nao envia email e faltam limites contra tentativas automatizadas.
- Schema nao e uma migracao de banco MySQL legado.
- Blockchain nao esta ligada ao ledger PostgreSQL.

O modelo aprovado e os limites da etapa atual estão em `SOLANA_PACKAGE_MODEL.md`; o gap analysis atualizado está em `IMPLEMENTACAO_ANALISE.md`.
