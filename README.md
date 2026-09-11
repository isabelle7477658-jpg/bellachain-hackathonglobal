# BellaChain — Sistema de Fidelidade para Salões de Beleza Baseado em Blockchain

## 1. Introdução

A transformação digital tem modificado significativamente a forma como empresas se relacionam com seus clientes. No setor de beleza, salões, clínicas de estética e profissionais autônomos utilizam cada vez mais sistemas digitais para agendamentos, pagamentos, divulgação de serviços e gestão do relacionamento com clientes.

Apesar desse avanço, muitos estabelecimentos ainda utilizam mecanismos simples de fidelização, como cartões físicos, registros em planilhas ou sistemas centralizados de pontos. Essas abordagens podem apresentar limitações relacionadas à perda de informações, alterações indevidas de saldo, dificuldade de auditoria e pouca integração entre diferentes estabelecimentos.

Nesse contexto, a tecnologia blockchain pode ser utilizada como mecanismo para registrar transações de maneira rastreável e resistente a alterações. Entretanto, soluções baseadas em blockchain frequentemente apresentam interfaces complexas para usuários sem conhecimento técnico.

O projeto **BellaChain** propõe o desenvolvimento de um sistema de fidelidade voltado para salões de beleza no qual clientes recebem pontos após a realização de serviços e podem posteriormente utilizá-los para obter descontos ou benefícios.

A blockchain é utilizada para registrar as operações relacionadas à emissão e ao resgate dos pontos de fidelidade, enquanto a aplicação oferece uma interface simples e semelhante à de sistemas convencionais.

Assim, o projeto busca unir uma aplicação comercial de fácil utilização aos conceitos de descentralização, rastreabilidade e imutabilidade proporcionados pela tecnologia blockchain.

---

# 2. Tema

Aplicação da tecnologia blockchain em programas de fidelidade para estabelecimentos do setor de beleza.

---

# 3. Título do Projeto

**BellaChain: Sistema de Fidelidade para Salões de Beleza Baseado em Blockchain**

---

# 4. Problema de Pesquisa

Programas tradicionais de fidelidade normalmente são administrados por sistemas centralizados, nos quais o estabelecimento possui controle completo sobre os pontos concedidos e utilizados pelos clientes.

Esse modelo pode apresentar problemas como:

* ausência de transparência no histórico de pontos;
* possibilidade de alteração indevida dos registros;
* dependência de um banco de dados central;
* dificuldade de integração entre diferentes estabelecimentos;
* perda de pontos em caso de encerramento ou migração do sistema;
* dificuldade para auditoria das transações.

Diante desse cenário, define-se a seguinte questão de pesquisa:

**Como a tecnologia blockchain pode ser aplicada à criação de um sistema de fidelidade simples, transparente e rastreável para clientes de salões de beleza?**

---

# 5. Hipótese

A utilização de blockchain para registrar a emissão e o resgate de pontos de fidelidade pode aumentar a rastreabilidade e a transparência das operações sem comprometer a facilidade de utilização do sistema pelo cliente.

---

# 6. Objetivo Geral

Desenvolver um protótipo de sistema de fidelidade para salões de beleza utilizando tecnologia blockchain para registrar a geração, movimentação e utilização de pontos de clientes.

---

# 7. Objetivos Específicos

O projeto possui os seguintes objetivos específicos:

1. Desenvolver uma aplicação web para cadastro de clientes e serviços do salão.

2. Permitir que atendimentos realizados sejam registrados no sistema.

3. Implementar um mecanismo de geração automática de pontos de fidelidade.

4. Desenvolver um smart contract responsável pelo registro da emissão e utilização dos pontos.

5. Permitir que clientes consultem seu saldo e histórico de movimentações.

6. Criar um catálogo de recompensas que possam ser obtidas utilizando pontos.

7. Registrar na blockchain as principais transações relacionadas ao programa de fidelidade.

8. Desenvolver uma interface simples que não exija conhecimento prévio sobre criptomoedas ou blockchain.

9. Avaliar a viabilidade da aplicação de blockchain em um programa de fidelidade destinado a pequenos estabelecimentos comerciais.

---

# 8. Justificativa

Programas de fidelidade são amplamente utilizados por empresas com o objetivo de aumentar a retenção de clientes e estimular novas compras.

No setor de beleza, a recorrência é particularmente importante, pois diversos serviços são realizados periodicamente, como cortes de cabelo, coloração, manicure, design de sobrancelhas, hidratação e tratamentos estéticos.

A BellaChain propõe utilizar essa característica para criar um sistema no qual cada atendimento possa gerar benefícios futuros para o cliente.

A escolha da blockchain se justifica principalmente pela possibilidade de criação de um histórico verificável das movimentações realizadas dentro do programa de fidelidade.

Ao contrário de um sistema exclusivamente centralizado, determinados registros podem ser armazenados em uma rede blockchain e posteriormente auditados.

O projeto também apresenta relevância acadêmica por permitir a aplicação prática de diferentes conceitos estudados na área de tecnologia da informação, incluindo:

* desenvolvimento web;
* sistemas distribuídos;
* blockchain;
* smart contracts;
* bancos de dados;
* APIs;
* segurança da informação;
* engenharia de software;
* experiência do usuário;
* modelagem de sistemas.

---

# 9. Descrição da Solução

A **BellaChain** será uma plataforma web de fidelidade destinada inicialmente a um único salão de beleza.

Após realizar um serviço, o cliente receberá pontos proporcionais ao valor gasto.

Por exemplo:

| Serviço        |     Valor |    Pontos |
| -------------- | --------: | --------: |
| Corte feminino |  R$ 80,00 |  8 pontos |
| Escova         |  R$ 60,00 |  6 pontos |
| Hidratação     | R$ 100,00 | 10 pontos |
| Coloração      | R$ 200,00 | 20 pontos |
| Manicure       |  R$ 40,00 |  4 pontos |

A regra inicial poderá ser definida como:

**R$ 10,00 gastos = 1 BellaPoint.**

Assim, uma cliente que realize um serviço de R$ 150,00 receberá:

**15 BellaPoints.**

Os pontos poderão posteriormente ser utilizados para resgatar benefícios.

Exemplo:

| Recompensa          | Pontos necessários |
| ------------------- | -----------------: |
| 10% de desconto     |                 50 |
| Hidratação gratuita |                100 |
| Escova gratuita     |                120 |
| R$ 30 de desconto   |                150 |

---

# 10. Nome dos Pontos

A unidade de fidelidade utilizada dentro da plataforma será denominada:

**BellaPoints — BLP**

Exemplo:

**Saldo: 185 BLP**

Os BellaPoints não serão inicialmente projetados como criptomoeda negociável.

Eles representarão apenas unidades digitais do programa de fidelidade.

Essa decisão reduz a complexidade jurídica, financeira e tecnológica do projeto acadêmico.

---

# 11. Usuários do Sistema

O sistema possuirá inicialmente três tipos de usuários.

## 11.1 Cliente

A cliente poderá:

* acessar sua conta;
* visualizar seu saldo de BellaPoints;
* consultar seu histórico;
* visualizar recompensas disponíveis;
* solicitar resgate de benefícios;
* consultar seus atendimentos anteriores.

## 11.2 Funcionário

O funcionário poderá:

* localizar clientes;
* registrar um atendimento;
* selecionar os serviços realizados;
* confirmar pagamento;
* gerar BellaPoints;
* registrar resgates autorizados.

## 11.3 Administrador

O administrador poderá:

* cadastrar funcionários;
* cadastrar serviços;
* alterar preços;
* configurar regras de pontuação;
* cadastrar recompensas;
* consultar clientes;
* visualizar transações;
* acompanhar pontos emitidos;
* visualizar relatórios.

---

# 12. Escopo do MVP

A primeira versão do BellaChain deverá possuir um escopo reduzido.

Serão implementados:

* cadastro e autenticação;
* cadastro de clientes;
* cadastro de serviços;
* registro de atendimento;
* geração de pontos;
* consulta de saldo;
* histórico de pontos;
* catálogo de recompensas;
* resgate de pontos;
* integração com blockchain;
* painel administrativo básico.

Não serão implementados inicialmente:

* aplicativo móvel nativo;
* marketplace de tokens;
* negociação dos BellaPoints;
* conversão de pontos em dinheiro;
* integração bancária;
* integração com múltiplas blockchains;
* sistema completo de agenda;
* pagamentos em criptomoedas.

Essas funcionalidades poderão ser consideradas como trabalhos futuros.

---

# 13. Requisitos Funcionais

## RF01 — Cadastro de Clientes

O sistema deverá permitir o cadastro de clientes contendo, no mínimo:

* nome;
* e-mail;
* telefone;
* senha.

---

## RF02 — Autenticação

O sistema deverá permitir que usuários realizem autenticação por meio de e-mail e senha.

---

## RF03 — Cadastro de Serviços

O administrador deverá conseguir cadastrar serviços oferecidos pelo salão.

Cada serviço deverá possuir:

* nome;
* descrição;
* valor;
* quantidade de pontos gerados;
* status ativo ou inativo.

---

## RF04 — Registro de Atendimento

O funcionário deverá conseguir registrar um atendimento realizado para uma cliente.

O atendimento deverá conter:

* cliente;
* funcionário;
* serviço;
* valor;
* data;
* status.

---

## RF05 — Geração de Pontos

Após a conclusão de um atendimento válido, o sistema deverá calcular os pontos correspondentes.

Exemplo:

**valor do atendimento / 10 = quantidade de BellaPoints**

---

## RF06 — Registro Blockchain

Sempre que pontos forem gerados, o sistema deverá registrar a movimentação por meio de um smart contract.

---

## RF07 — Consulta de Saldo

A cliente deverá conseguir visualizar seu saldo atual de BellaPoints.

---

## RF08 — Histórico

O sistema deverá exibir o histórico de geração e utilização de pontos.

Exemplo:

| Data  | Operação            | Pontos |
| ----- | ------------------- | -----: |
| 10/08 | Corte               |     +8 |
| 18/08 | Manicure            |     +4 |
| 02/09 | Hidratação          |    +10 |
| 10/09 | Resgate de desconto |    -15 |

---

## RF09 — Cadastro de Recompensas

O administrador deverá conseguir cadastrar recompensas.

Cada recompensa possuirá:

* nome;
* descrição;
* custo em pontos;
* disponibilidade.

---

## RF10 — Resgate de Pontos

O cliente poderá solicitar o resgate de uma recompensa caso possua saldo suficiente.

---

## RF11 — Validação de Saldo

O sistema não deverá permitir que o usuário utilize uma quantidade de pontos superior ao seu saldo.

---

## RF12 — Registro de Resgate

Toda utilização de BellaPoints deverá gerar um registro correspondente na blockchain.

---

## RF13 — Consulta de Transação

O sistema deverá permitir consultar o identificador da transação blockchain associada à movimentação.

---

## RF14 — Painel Administrativo

O administrador deverá possuir acesso a indicadores como:

* número de clientes cadastrados;
* atendimentos realizados;
* quantidade total de pontos emitidos;
* pontos utilizados;
* recompensas resgatadas.

---

# 14. Requisitos Não Funcionais

## RNF01 — Usabilidade

O sistema deverá possuir interface simples e responsiva.

---

## RNF02 — Segurança

As senhas deverão ser armazenadas de forma segura utilizando hash.

---

## RNF03 — Privacidade

Dados pessoais das clientes não deverão ser armazenados diretamente na blockchain.

---

## RNF04 — Integridade

Registros de emissão e resgate de pontos enviados à blockchain não deverão poder ser modificados posteriormente.

---

## RNF05 — Responsividade

A aplicação deverá funcionar adequadamente em computadores, tablets e smartphones.

---

## RNF06 — Desempenho

As principais páginas deverão carregar em poucos segundos em condições normais de conexão.

---

## RNF07 — Disponibilidade

O sistema deverá manter os dados locais disponíveis mesmo quando houver indisponibilidade temporária da rede blockchain.

---

## RNF08 — Auditabilidade

As transações blockchain deverão possuir identificadores que possam ser verificados posteriormente.

---

# 15. Regras de Negócio

## RN01 — Conversão de Pontos

A regra padrão será:

**R$ 10,00 = 1 BellaPoint.**

---

## RN02 — Atendimento Concluído

Somente atendimentos com status **concluído** poderão gerar pontos.

---

## RN03 — Pontuação Única

Um mesmo atendimento não poderá gerar pontos mais de uma vez.

---

## RN04 — Saldo

O saldo da cliente será calculado por:

**Pontos recebidos - Pontos resgatados = saldo disponível.**

---

## RN05 — Resgate

O resgate somente poderá ocorrer quando:

**saldo ≥ custo da recompensa.**

---

## RN06 — Cancelamento

Caso um atendimento seja cancelado antes da geração dos pontos, nenhuma pontuação deverá ser concedida.

---

## RN07 — Privacidade

Informações como nome, telefone e e-mail nunca deverão ser armazenadas publicamente na blockchain.

---

# 16. Arquitetura do Sistema

A arquitetura proposta será composta por quatro elementos principais:

```text
CLIENTE / FUNCIONÁRIO / ADMINISTRADOR
                │
                ▼
          APLICAÇÃO WEB
                │
                ▼
             API/BACKEND
           ┌────┴────┐
           ▼         ▼
       BANCO DE    BLOCKCHAIN
        DADOS          │
                       ▼
                 SMART CONTRACT
```

---

# 17. Arquitetura Híbrida

A BellaChain utilizará uma arquitetura híbrida.

Nem todos os dados serão armazenados na blockchain.

## Banco de dados convencional

Serão armazenados:

* nome;
* telefone;
* e-mail;
* serviços;
* preços;
* informações do salão;
* dados administrativos;
* informações dos atendimentos.

## Blockchain

Serão registrados:

* identificador da cliente;
* quantidade de pontos;
* tipo da operação;
* data;
* identificador da transação.

Essa divisão é importante para garantir privacidade e reduzir custos.

---

# 18. Tecnologias Propostas

Uma possível stack tecnológica é:

| Camada          | Tecnologia                |
| --------------- | ------------------------- |
| Frontend        | React ou Next.js          |
| Interface       | Tailwind CSS              |
| Backend         | Node.js                   |
| API             | REST                      |
| Banco de dados  | PostgreSQL / Supabase     |
| Blockchain      | Polygon ou Base           |
| Smart Contract  | Solidity                  |
| Integração Web3 | ethers.js ou viem         |
| Versionamento   | Git + GitHub              |
| Deploy Web      | Vercel                    |
| Contrato        | Rede de testes blockchain |

Para um projeto acadêmico, recomenda-se utilizar uma **testnet**, evitando custos financeiros reais durante os testes.

---

# 19. Smart Contract

O smart contract será responsável pelo controle lógico das operações de fidelidade registradas em blockchain.

Uma estrutura simplificada poderá ser:

```solidity
struct Transaction {
    address customer;
    uint256 amount;
    TransactionType transactionType;
    uint256 timestamp;
}
```

Os principais métodos poderão ser:

```solidity
addPoints(address customer, uint256 amount)
```

Responsável por adicionar pontos.

```solidity
redeemPoints(address customer, uint256 amount)
```

Responsável por registrar o consumo dos pontos.

```solidity
getBalance(address customer)
```

Responsável por consultar o saldo.

---

# 20. Eventos Blockchain

O contrato poderá emitir eventos.

Exemplo:

```solidity
event PointsAdded(
    address indexed customer,
    uint256 amount,
    uint256 timestamp
);
```

E:

```solidity
event PointsRedeemed(
    address indexed customer,
    uint256 amount,
    uint256 timestamp
);
```

Esses eventos permitem manter um histórico auditável das operações.

---

# 21. Abstração da Blockchain

Um dos princípios da BellaChain será evitar que a utilização da tecnologia blockchain torne o sistema mais complexo para a cliente.

Assim, a interface utilizará termos simples.

Em vez de:

**Hash da transação: 0x093823...**

A interface principal poderá mostrar:

**✓ Seus 15 BellaPoints foram adicionados.**

Em uma área opcional:

**Ver registro blockchain**

serão apresentadas as informações técnicas.

Essa estratégia melhora a experiência do usuário.

---

# 22. Fluxo Principal

O fluxo de utilização será:

```text
Cliente realiza serviço
        ↓
Funcionário registra atendimento
        ↓
Sistema calcula BellaPoints
        ↓
Backend confirma atendimento
        ↓
Smart Contract registra os pontos
        ↓
Blockchain gera transação
        ↓
Banco registra hash da transação
        ↓
Cliente recebe atualização
        ↓
Saldo é atualizado
```

---

# 23. Fluxo de Resgate

```text
Cliente escolhe recompensa
        ↓
Sistema consulta saldo
        ↓
Saldo suficiente?
       / \
     não  sim
     ↓     ↓
  recusa  cria resgate
            ↓
       Smart Contract
            ↓
     registra utilização
            ↓
       atualiza saldo
            ↓
   recompensa liberada
```

---

# 24. Casos de Uso

## UC01 — Registrar Cliente

**Ator:** Funcionário ou cliente.

**Pré-condição:** usuário ainda não cadastrado.

**Fluxo principal:**

1. Usuário acessa cadastro.
2. Informa seus dados.
3. Sistema valida informações.
4. Sistema cria conta.
5. Cadastro é concluído.

---

## UC02 — Registrar Atendimento

**Ator:** Funcionário.

**Pré-condição:** cliente cadastrada.

**Fluxo principal:**

1. Funcionário acessa painel.
2. Seleciona cliente.
3. Seleciona serviço.
4. Informa valor.
5. Confirma atendimento.
6. Sistema registra atendimento.

---

## UC03 — Receber BellaPoints

**Ator:** Cliente.

**Pré-condição:** atendimento concluído.

**Fluxo principal:**

1. Sistema identifica atendimento concluído.
2. Calcula pontos.
3. Envia operação para smart contract.
4. Blockchain registra operação.
5. Sistema atualiza saldo.
6. Cliente visualiza novos pontos.

---

## UC04 — Resgatar Recompensa

**Ator:** Cliente.

**Pré-condição:** possuir pontos suficientes.

**Fluxo principal:**

1. Cliente acessa recompensas.
2. Seleciona recompensa.
3. Sistema verifica saldo.
4. Cliente confirma.
5. Pontos são descontados.
6. Blockchain registra operação.
7. Recompensa é disponibilizada.

---

# 25. Modelo de Banco de Dados

Uma modelagem simplificada poderá utilizar as seguintes tabelas:

### users

```text
id
name
email
phone
password_hash
role
created_at
```

### services

```text
id
name
description
price
points
active
```

### appointments

```text
id
customer_id
employee_id
service_id
value
status
created_at
```

### rewards

```text
id
name
description
points_required
active
```

### loyalty_transactions

```text
id
customer_id
type
points
appointment_id
blockchain_tx_hash
created_at
```

### redemptions

```text
id
customer_id
reward_id
points
status
blockchain_tx_hash
created_at
```

---

# 26. Entidades Principais

O modelo conceitual pode ser representado da seguinte forma:

```text
CLIENTE
   │
   ├── possui → ATENDIMENTOS
   │
   ├── possui → TRANSAÇÕES
   │
   └── realiza → RESGATES

SERVIÇO
   │
   └── pertence → ATENDIMENTO

RECOMPENSA
   │
   └── pertence → RESGATE

TRANSAÇÃO
   │
   └── possui → HASH BLOCKCHAIN
```

---

# 27. Telas do Sistema

O MVP poderá possuir aproximadamente sete telas principais.

## Tela 1 — Login

Contendo:

* logotipo BellaChain;
* e-mail;
* senha;
* opção de cadastro.

---

## Tela 2 — Home da Cliente

Exemplo:

```text
Olá, Marina 👋

Seu saldo

       185 BLP

BellaPoints disponíveis

[ Ver recompensas ]

Últimas movimentações

+ 15 BLP  Coloração
+  8 BLP  Corte
- 50 BLP  Desconto
```

---

## Tela 3 — Recompensas

Exemplo:

```text
🎁 Recompensas

10% de desconto
50 BLP

Hidratação
100 BLP

Escova
120 BLP
```

---

## Tela 4 — Histórico

Exibirá:

* data;
* atendimento;
* quantidade;
* tipo;
* status blockchain.

---

## Tela 5 — Registrar Atendimento

Funcionário selecionará:

* cliente;
* serviço;
* preço;
* pontos calculados.

---

## Tela 6 — Clientes

Permitirá pesquisar e visualizar clientes.

---

## Tela 7 — Dashboard Administrativo

Indicadores:

```text
Clientes             148

Atendimentos         431

BellaPoints
emitidos           8.420

BellaPoints
resgatados         2.180
```

---

# 28. Identidade Visual

A BellaChain deverá possuir identidade visual associada simultaneamente à beleza e à tecnologia.

Sugere-se uma interface:

* minimalista;
* elegante;
* com bastante espaço visual;
* tipografia moderna;
* ícones simples;
* elementos discretos associados a blockchain.

O símbolo poderá combinar visualmente:

**B + corrente/link + elemento de beleza.**

O objetivo é evitar uma aparência excessivamente associada ao mercado de criptomoedas.

A plataforma deve parecer prioritariamente um produto para o setor de beleza.

---

# 29. Segurança

Algumas medidas deverão ser consideradas durante o desenvolvimento.

### Senhas

Nunca deverão ser armazenadas diretamente.

Devem utilizar algoritmos apropriados de hash.

### Smart contract

Apenas usuários ou endereços autorizados deverão conseguir emitir pontos.

### Validação

Todas as requisições deverão ser validadas no backend.

### Blockchain

Transações deverão possuir identificadores únicos.

### Dados pessoais

Nenhum dado pessoal identificável deverá ser publicado na blockchain.

---

# 30. LGPD

Como a aplicação trabalhará com informações de clientes, deverão ser observados princípios relacionados à Lei Geral de Proteção de Dados.

Dados pessoais deverão permanecer no banco de dados tradicional.

Na blockchain deverão ser utilizados identificadores que não exponham diretamente:

* nome;
* CPF;
* telefone;
* e-mail;
* endereço.

Isso é particularmente relevante porque informações gravadas em uma blockchain pública podem ser difíceis ou impossíveis de remover posteriormente.

---

# 31. Por que utilizar Blockchain?

Um ponto importante do trabalho acadêmico é justificar por que não utilizar apenas um banco de dados convencional.

A blockchain pode oferecer:

### Imutabilidade

Um registro confirmado não pode ser facilmente alterado.

### Transparência

Movimentações podem ser posteriormente verificadas.

### Rastreabilidade

Cada operação possui um histórico próprio.

### Auditabilidade

É possível comparar informações armazenadas no sistema com registros da blockchain.

### Expansão futura

O mesmo programa poderá ser utilizado por diferentes estabelecimentos.

---

# 32. Principal Diferencial Futuro

Embora o MVP seja desenvolvido para um único salão, uma evolução interessante seria transformar a BellaChain em uma rede de fidelidade.

Exemplo:

```text
SALÃO BELLA
     │
     │
     ├──── BellaChain ──── CLÍNICA DE ESTÉTICA
     │
     │
LOJA DE COSMÉTICOS ───── MANICURE
```

Nesse cenário, uma cliente poderia:

* ganhar BellaPoints no salão;
* utilizá-los em uma clínica parceira;
* receber pontos comprando cosméticos;
* utilizar benefícios em diferentes estabelecimentos.

Nesse modelo, a blockchain apresenta maior relevância, pois diferentes empresas poderiam compartilhar o mesmo sistema de fidelidade sem depender integralmente de uma única organização.

---

# 33. Metodologia

O desenvolvimento poderá utilizar uma metodologia incremental dividida em etapas.

### Etapa 1 — Levantamento bibliográfico

Pesquisa sobre:

* blockchain;
* smart contracts;
* programas de fidelidade;
* aplicações descentralizadas;
* segurança;
* experiência do usuário.

### Etapa 2 — Levantamento de requisitos

Identificação dos requisitos da plataforma.

### Etapa 3 — Modelagem

Criação de:

* diagramas;
* modelo de dados;
* regras de negócio;
* casos de uso.

### Etapa 4 — Prototipação

Desenvolvimento das telas da aplicação.

### Etapa 5 — Desenvolvimento Backend

Implementação:

* autenticação;
* clientes;
* serviços;
* atendimentos;
* recompensas.

### Etapa 6 — Smart Contract

Criação do contrato responsável pelos BellaPoints.

### Etapa 7 — Integração

Integração entre backend e blockchain.

### Etapa 8 — Testes

Realização de testes funcionais e de integração.

### Etapa 9 — Avaliação

Análise dos resultados obtidos.

---

# 34. Testes

O sistema deverá ser submetido a diferentes tipos de teste.

## Teste de cadastro

Verificar se clientes podem ser cadastrados corretamente.

## Teste de atendimento

Verificar se serviços são registrados corretamente.

## Teste de pontuação

Exemplo:

```text
Valor do atendimento: R$ 100

Regra:
R$ 10 = 1 BLP

Resultado esperado:
10 BLP
```

## Teste de saldo

Verificar se:

```text
saldo anterior + pontos recebidos
```

produz o saldo correto.

## Teste de resgate

Caso:

```text
Saldo = 80 BLP
Recompensa = 50 BLP
```

Resultado:

```text
Novo saldo = 30 BLP
```

## Teste de saldo insuficiente

Caso:

```text
Saldo = 30 BLP
Recompensa = 50 BLP
```

Resultado esperado:

**Operação rejeitada.**

---

# 35. Critérios de Aceitação

O MVP será considerado funcional se for possível executar completamente o seguinte cenário:

1. cadastrar uma cliente;
2. cadastrar um serviço;
3. registrar um atendimento;
4. gerar BellaPoints;
5. registrar a emissão na blockchain;
6. consultar o saldo;
7. visualizar a transação;
8. cadastrar uma recompensa;
9. realizar um resgate;
10. registrar o resgate na blockchain;
11. visualizar o saldo atualizado.

---

# 36. Exemplo de Cenário Completo

Cliente:

**Ana Souza**

Saldo inicial:

**0 BLP**

Ana realiza:

**Coloração — R$ 200**

O sistema calcula:

```text
200 / 10 = 20 BLP
```

Após confirmação:

```text
Saldo anterior: 0 BLP
Crédito:       +20 BLP

Saldo atual:   20 BLP
```

A transação recebe um hash blockchain.

Após novos atendimentos, Ana alcança:

**120 BLP**

Ela escolhe:

**Hidratação gratuita — 100 BLP**

O sistema registra:

```text
Saldo anterior: 120 BLP
Resgate:       -100 BLP

Saldo final:     20 BLP
```

A operação é novamente registrada na blockchain.

---

# 37. Cronograma Sugerido

| Semana | Atividade                         |
| ------ | --------------------------------- |
| 1      | Pesquisa e definição do problema  |
| 2      | Levantamento de requisitos        |
| 3      | Modelagem do banco e casos de uso |
| 4      | Prototipação das telas            |
| 5      | Desenvolvimento do frontend       |
| 6      | Desenvolvimento do backend        |
| 7      | Desenvolvimento do smart contract |
| 8      | Integração blockchain             |
| 9      | Implementação de recompensas      |
| 10     | Testes                            |
| 11     | Correções e melhorias             |
| 12     | Documentação e apresentação       |

---

# 38. Resultados Esperados

Espera-se desenvolver um protótipo funcional capaz de demonstrar a integração entre uma aplicação comercial tradicional e uma infraestrutura blockchain.

O sistema deverá permitir acompanhar todo o ciclo de fidelidade, desde a realização de um atendimento até a geração e utilização dos BellaPoints.

Também se espera demonstrar que tecnologias blockchain podem ser utilizadas sem expor ao usuário toda a complexidade técnica associada às criptomoedas.

---

# 39. Limitações

O protótipo possui algumas limitações.

Entre elas:

* utilização inicial de uma rede blockchain de testes;
* ausência de integração com sistemas reais de pagamento;
* quantidade limitada de usuários durante os testes;
* ausência de aplicativo móvel nativo;
* programa restrito inicialmente a um único estabelecimento.

Essas limitações são aceitáveis para um projeto acadêmico cujo principal objetivo é demonstrar a viabilidade técnica da solução.

---

# 40. Trabalhos Futuros

Como continuidade da BellaChain, poderão ser desenvolvidas funcionalidades como:

* aplicativo para Android e iOS;
* múltiplos salões participantes;
* transferência de pontos entre estabelecimentos;
* QR Code para identificação da cliente;
* integração com pagamentos;
* níveis de fidelidade;
* campanhas promocionais;
* cashback;
* marketplace de recompensas;
* NFTs de benefícios exclusivos;
* integração com sistemas de agendamento;
* mecanismos de governança entre estabelecimentos.

---

# 41. Conclusão

A BellaChain propõe a utilização de blockchain em um cenário cotidiano e de fácil compreensão: programas de fidelidade para salões de beleza.

Ao combinar uma aplicação web tradicional com smart contracts, o projeto busca criar um sistema no qual a geração e utilização de pontos sejam rastreáveis e verificáveis.

A proposta evita exigir conhecimento técnico das clientes e utiliza a blockchain como infraestrutura, e não como elemento central da experiência de uso.

O desenvolvimento do protótipo permite aplicar conceitos de engenharia de software, banco de dados, segurança da informação, desenvolvimento web e sistemas distribuídos em uma solução com potencial de aplicação prática.

Além disso, a arquitetura proposta possibilita uma futura expansão da BellaChain para uma rede de fidelidade envolvendo diferentes empresas do setor de beleza e estética, aumentando a relevância da utilização de blockchain em relação a modelos completamente centralizados.

**BellaChain — Sua beleza gera valor.**
