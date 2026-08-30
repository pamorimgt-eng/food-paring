# Arquitetura — Comanda Digital com Wine Pairing por IA

> Documento de decisões técnicas. O resumo do produto está em
> [`ideia-comanda-digital-wine-pairing.md`](./ideia-comanda-digital-wine-pairing.md).

## 1. Princípio central: a IA corre no carregamento, não no serviço

A decisão estruturante deste projeto.

Se o pairing fosse uma chamada de IA no momento em que o empregado está à mesa,
teríamos 3–10 segundos de espera, custo por cada pedido e respostas que variam
entre chamadas idênticas. Inviável em serviço real.

Por isso o trabalho pesado acontece **uma vez, no onboarding**, e o serviço à
mesa é uma consulta à base de dados:

| Fase | Quando | Custo/latência | O que acontece |
|---|---|---|---|
| **1. Ingestão** | Onboarding e mudanças de menu | Segundos, com revisão humana | Foto da carta → IA extrai itens → gerente confirma |
| **2. Enriquecimento** | Background, após confirmação | Minutos, alguns euros | IA analisa pratos, pesquisa vinhos na web, gera a matriz de pairing |
| **3. Serviço** | A cada pedido, à mesa | **Instantâneo, custo zero** | `SELECT` na matriz já calculada |

## 2. Fluxo de ingestão (user-friendly em primeiro lugar)

Para **pratos** e para **vinhos**, existem sempre dois caminhos. O gerente nunca
fica preso a um só:

- **Foto da carta** — importação em massa. Tira foto ou faz upload, a IA extrai
  tudo, e um **ecrã de revisão obrigatório** deixa corrigir o que foi mal lido.
  Menus têm caligrafia, colunas e manchas: nada é gravado sem confirmação humana.
- **"Adicionar referência"** — um item de cada vez, à mão. Para o prato do dia,
  o vinho que acabou de entrar, ou uma correção pontual.

### Quando a IA não sabe, pergunta

Se a pesquisa web não devolver informação fiável sobre um vinho (produtor
pequeno, vinho local), o sistema **não inventa e não despeja um formulário de 12
campos**. Faz perguntas curtas, em linguagem normal:

```
Quinta do Vale Reserva 2019 — não encontrei se estagiou em madeira.
   [ Sim ]   [ Não ]   [ Não sei ]
```

`Não sei` é sempre uma resposta válida. O vinho continua a ser sugerido; apenas
os argumentos de venda evitam esse atributo. Nenhum vinho fica bloqueado à
espera de um campo.

### Fiabilidade dos dados de vinho

Um argumento de venda factualmente errado, dito a um cliente que percebe de
vinho, é pior do que não sugerir nada. Por isso:

- A pesquisa web é obrigatória e as **fontes ficam citadas** em `fontes`.
- Cada ficha tem um nível de `confianca`.
- Vinhos com confiança baixa aparecem **sinalizados** no backoffice para
  validação do gerente.

## 3. Correções ao desenho original

Falhas identificadas na revisão e como foram resolvidas:

1. **Momento da sugestão.** O fluxo original sugeria o vinho *depois* de enviar
   o pedido para a cozinha — altura em que o empregado já saiu da mesa. Correto:
   registar pratos → **sugestão no mesmo ecrã** → upsell → confirmar pedido
   (comida + vinho) → cozinha. Um gesto, um ecrã. É o argumento de
   diferenciação do produto.

2. **Catálogo de vinhos partilhado.** Cada restaurante reintroduzir a ficha
   técnica completa de cada vinho é trabalho duplicado — e é exatamente o custo
   de setup que trava a venda. Separámos `vinhos_catalogo` (global, ficha
   técnica, partilhado) de `carta_vinhos` (por restaurante: preço, custo,
   stock). Restaurante novo escolhe da lista e mete preços.

3. **`faixa_preco` não é um campo guardado.** "Económico/médio/premium" é
   relativo à carta de cada casa — 30 € é premium num sítio e económico noutro.
   Calcula-se em runtime por tercis dos preços da carta.

4. **Mesa com vários pratos.** O caso normal (4 pessoas, 4 pratos) não estava
   coberto. O motor pontua contra o prato de **maior intensidade** da mesa e
   sinaliza quando a mesa está dividida entre peixe e carne, sugerindo então
   duas garrafas ou um vinho-ponte.

5. **Login por PIN.** Empregado a meio de turno, telemóvel numa mão. PIN de 4
   dígitos por funcionário no dispositivo já associado ao restaurante.
   Email/password apenas no backoffice.

6. **Autocomplete insensível a acentos.** Em português, `bacalhau a bras` tem de
   encontrar *Bacalhau à Brás*, e `arroz` tem de encontrar *Arroz de Pato* a
   meio da frase. Postgres com `unaccent` + `pg_trgm`, não `LIKE 'arroz%'`.

7. **Campo `custo` na carta.** O restaurante não quer vender o vinho mais caro
   — quer vender o de maior margem. Um campo, diferencial comercial real.

8. **`mesas.estado` derivado.** Era denormalizado e ia dessincronizar-se. Passa
   a ser calculado a partir dos pedidos abertos.

9. **KDS com fallback por polling.** Wi-Fi de restaurante cai. O ecrã de cozinha
   não pode depender só do Realtime.

## 4. Stack

| Camada | Escolha | Porquê |
|---|---|---|
| Frontend | Next.js (App Router) + Tailwind, PWA | Um framework para sala, KDS e backoffice; instalável sem loja de apps |
| Backend | Next.js API routes / Server Actions | Um deployment em vez de dois |
| BD | PostgreSQL (Supabase) | Postgres + Auth + Realtime + Storage no mesmo sítio |
| ORM | Prisma | Migrations versionadas e type-safety |
| Tempo real | Supabase Realtime (+ polling de fallback) | KDS sem gerir WebSockets à mão |
| IA | Claude `claude-opus-5` | Visão (fotos de cartas), `web_search` (fichas de vinho), structured outputs |
| Deploy | Vercel + Supabase | — |

Sem backend Express separado: para este âmbito, dois deployments só acrescentam
trabalho.

## 5. Modelo de dados

```
restaurantes        id, nome, slug, criado_em
utilizadores        id, restaurante_id, nome, email, pin_hash,
                    papel(admin|sala|cozinha)
mesas               id, restaurante_id, numero, capacidade
                    -- estado é derivado dos pedidos abertos

-- INGESTÃO ------------------------------------------------------------
cartas_upload       id, restaurante_id, tipo(menu|vinhos), imagem_url,
                    estado(processando|revisao|confirmado|erro),
                    extraido (jsonb), erro, criado_em

-- PRATOS --------------------------------------------------------------
pratos              id, restaurante_id, nome, descricao, seccao, preco,
                    disponivel, origem(foto|manual),
                    atributos (jsonb), enriquecido_em

-- VINHOS --------------------------------------------------------------
vinhos_catalogo     id, nome, produtor, ano, regiao, pais, castas[],
                    tipo, atributos (jsonb), fontes (jsonb),
                    confianca(alta|media|baixa), enriquecido_em
carta_vinhos        id, restaurante_id, vinho_catalogo_id, preco, custo,
                    stock, disponivel, origem(foto|manual)

-- PERGUNTAS EM ABERTO -------------------------------------------------
perguntas           id, restaurante_id, alvo_tipo(prato|vinho), alvo_id,
                    campo, pergunta, opcoes (jsonb),
                    resposta, estado(aberta|respondida|ignorada)

-- PAIRING -------------------------------------------------------------
pairings            id, prato_id, carta_vinho_id, score,
                    argumentos (jsonb), gerado_em

-- SERVIÇO -------------------------------------------------------------
pedidos             id, restaurante_id, mesa_id, utilizador_id,
                    estado(aberto|enviado|preparacao|pronto|entregue|fechado),
                    criado_em, atualizado_em
pedido_itens        id, pedido_id, prato_id, quantidade, notas,
                    estado(pendente|preparacao|pronto)
pedido_sugestoes    id, pedido_id, carta_vinho_id, banda(economico|medio|premium),
                    argumentos (jsonb), aceite
```

`atributos` fica em `jsonb` de propósito: o que a IA extrai de um prato
(proteína, gordura, confeção, condimentos, intensidade, textura) evolui sem
precisar de migration a cada ajuste. Os campos usados no matching são indexados.

`pedido_sugestoes.aceite` dá a métrica que o restaurante quer ver: **quanto
vinho foi vendido por influência do sistema**.

## 6. Segurança

- Multi-tenant com `restaurante_id` e Row Level Security no Postgres.
- Chaves de API só em variáveis de ambiente, nunca no repositório.
- Chamadas ao Claude apenas do servidor — a chave nunca chega ao browser.
