# Comanda Digital com Motor de Sugestão de Vinhos (Wine Pairing)

## 1. Problema identificado
- Vender vinho em restaurantes é difícil, sobretudo por **falta de formação dos funcionários**, não só preço.
- Sem conhecimento de harmonizações, o empregado não sabe sugerir vinho ao cliente → perde-se venda cruzada (cross-selling).
- Processo de pedidos ainda é manual (papel), o que gera erros, lentidão e desorganização entre sala e cozinha.

## 2. Ideia de solução
Uma aplicação web (mobile/tablet) para uso dos **funcionários de sala**, que substitui a comanda em papel e, no momento do pedido, sugere automaticamente vinhos para harmonizar com os pratos escolhidos.

## 3. Funcionalidades principais

### 3.1 Comanda digital (pedidos)
- Interface por mesa, usada em telemóvel ou tablet.
- Menu do dia pré-carregado na base de dados.
- Autocomplete/pesquisa inteligente: ao escrever "arroz" aparecem logo os pratos do menu que começam por "arroz" (ex: arroz de pato).
- Ao confirmar o pedido, a cozinha recebe alerta instantâneo num tablet/computador próprio (elimina papel).

### 3.2 Motor de sugestão de vinhos (o diferencial)
- Depois de escolhidos os pratos, o sistema sugere automaticamente **3 vinhos** (tipo "bom-melhor-óptimo"):
  - Um vinho económico
  - Um vinho médio
  - Um vinho premium/caro
- Cada sugestão vem acompanhada de **2-3 argumentos de venda**, gerados a partir da ficha técnica do vinho (casta, região, estilo, acidez, estágio em barrica, etc.), cruzada com as características do prato.
  - Exemplo — Arroz de pato: vinho tinto de casta encorpada do Alentejo, boa estrutura para equilibrar a gordura do pato.
  - Exemplo — Peixe grelhado: branco leve, elegante, boa acidez.
  - Exemplo — Bacalhau: branco reserva com estágio em barrica, harmoniza com a gordura do bacalhau e do azeite.

### 3.3 Base de dados / backoffice
- Cadastro de todos os pratos do menu (por restaurante, atualizável por época/dia).
- Cadastro de todos os vinhos da carta, com ficha técnica (casta, região, teor alcoólico, acidez, taninos, estágio em madeira, perfil aromático, preço).
- Lógica/algoritmo de matching prato-vinho (regras baseadas em ficha técnica, podendo evoluir para modelo mais "inteligente"/IA no futuro).

## 4. Fluxo de utilização (resumo)
1. Empregado abre app no telemóvel/tablet.
2. Seleciona mesa → regista pedido de comida (com autocomplete do menu).
3. Pedido é enviado automaticamente para a cozinha (alerta em tempo real).
4. Sistema sugere 3 vinhos com argumentos de venda personalizados aos pratos pedidos.
5. Empregado usa a sugestão para fazer upsell de vinho ao cliente.

## 5. Proposta de valor para o restaurante
- Elimina papel e erros de comunicação sala-cozinha.
- Processo de pedidos mais rápido e organizado.
- Funciona como "formação automática" do empregado (não precisa de ser sommelier).
- Aumenta a venda de vinho (cross-selling) sem depender do conhecimento individual da equipa.
- Baixo custo de implementação (usa hardware que já existe — telemóveis/tablets).

## 6. Modelo de negócio (a validar)
- SaaS por restaurante (mensalidade), possivelmente com custo de setup inicial (carregamento de menu e carta de vinhos).
- Distribuição online (site + anúncios/LinkedIn Ads) direcionada a donos de restaurante.

## 7. Concorrência já existente (pesquisa rápida)
Já existem soluções no mercado que cobrem partes desta ideia, mas nenhuma junta as duas coisas (comanda + pairing):
- **Winevizer** — sommelier virtual, sugere vinhos a partir de pratos do menu do restaurante, cruzado com o stock de cave.
- **My Wine Guide** — listas de vinho digitais para tablet/iPad, sincronizadas com POS e inventário, com notas de prova.
- **AiSommelier / Pocket Sommelier / WineScore / Sommo** — apps de sugestão de vinho por IA, mas viradas para o consumidor final (não para o funcionário do restaurante nem integradas com o sistema de pedidos).

### Diferenciação a explorar
- Nenhum concorrente identificado combina **comanda digital (substituição do papel)** + **motor de pairing** no mesmo fluxo de trabalho do empregado. Essa integração (um único ecrã, um único gesto) é o argumento de venda mais forte.
- Foco no **empregado como "vendedor assistido"**, não no cliente final — proposta de posicionamento diferente da maioria dos concorrentes.

## 8. Próximos passos técnicos (para desenvolvimento com Claude Code)
1. Definir MVP: começar só pela comanda digital + alertas de cozinha, ou já incluir o motor de pairing na v1?
2. Modelo de dados: tabelas de `pratos`, `vinhos` (com ficha técnica), `mesas`, `pedidos`, `regras_de_harmonização`.
3. Lógica de matching prato-vinho: definir regras iniciais (baseadas em tipo de prato, proteína, molho, método de confeção) antes de evoluir para algo mais sofisticado.
4. Interface mobile-first (PWA ou app web responsiva) para sala + interface simples para cozinha (KDS - kitchen display system).
5. Painel de backoffice para o restaurante gerir menu, carta de vinhos e ver relatórios de vendas de vinho.
6. Validar com 1-2 restaurantes reais antes de escalar para venda online generalizada.
