# Comanda Digital com Wine Pairing

Comanda digital para restaurantes que substitui o papel e sugere o vinho certo
para os pratos pedidos — com argumentos de venda prontos a dizer ao cliente,
para que o empregado não precise de ser escanção.

> **Nome do produto por definir.** O repositório e o `package.json` usam
> `food-pairing` como nome provisório.

- **Ideia e contexto de negócio:** [`ideia-comanda-digital-wine-pairing.md`](./ideia-comanda-digital-wine-pairing.md)
- **Decisões técnicas e modelo de dados:** [`ARQUITETURA.md`](./ARQUITETURA.md)

## Como funciona

A IA corre no **carregamento**, não no serviço. É a decisão que faz o produto
funcionar num restaurante a sério:

1. **Ingestão** — o gerente tira foto ao menu e à carta de vinhos, ou adiciona
   referências à mão. A IA lê, e um ecrã de revisão deixa corrigir antes de
   gravar.
2. **Enriquecimento** — em background, a IA analisa a composição de cada prato,
   pesquisa a ficha técnica de cada vinho na web (com fontes citadas) e gera a
   matriz de pairing prato × vinho, com os argumentos já escritos. O que não
   conseguir confirmar, **pergunta** ao gerente em linguagem normal.
3. **Serviço** — à mesa, a sugestão é um `SELECT` na matriz. Instantâneo, sem
   custo por pedido e sempre igual para o mesmo prato.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 16 (App Router) + Tailwind 4, mobile-first / PWA |
| Backend | Next.js API routes e Server Actions |
| Base de dados | PostgreSQL via Prisma 6 |
| Tempo real | Polling no KDS (a cada 4s) |
| IA | Claude `claude-opus-5` — visão, pesquisa web, structured outputs |
| Deploy | Docker num VPS, gerido via [Easypanel](https://easypanel.io) |

## Correr localmente

Precisas de Node 20+ e de um Postgres — local, ou o que correr no VPS de
produção (ver [Deploy](#deploy)).

```bash
npm install
```

Copia o ficheiro de ambiente e preenche-o:

```bash
cp .env.example .env
```

```bash
DATABASE_URL="postgresql://<utilizador>:<password>@localhost:5432/food_pairing"
DIRECT_URL="postgresql://<utilizador>:<password>@localhost:5432/food_pairing"
```

Cria a base de dados antes de migrar: `createdb food_pairing` (ou `CREATE
DATABASE food_pairing;` no `psql`). As extensões `unaccent` e `pg_trgm` são
criadas automaticamente pela primeira migration. `DATABASE_URL` e
`DIRECT_URL` são a mesma ligação — só há distinção quando há um pooler
(pgBouncer) entre a app e a BD, o que não é o caso aqui.

Preenche também:

| Variável | Onde obter |
|---|---|
| `ANTHROPIC_API_KEY` | console.anthropic.com › API Keys. Sem isto, tudo corre exceto a leitura de fotos e o enriquecimento por IA — cai automaticamente no motor de regras (`lib/pairingRegras.ts`). |

Cria o esquema, semeia um restaurante de demonstração e arranca:

```bash
npm run db:migrate
npm run db:seed
npm run dev
```

Fica em http://localhost:3000. O seed cria o restaurante "Tasca do Demo" com
6 mesas — usa `/backoffice` para carregar pratos e vinhos antes de testar a
sala.

### Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run db:migrate` | Aplica migrations em desenvolvimento |
| `npm run db:studio` | Abre o Prisma Studio para ver a base de dados |
| `npm run db:generate` | Regenera o cliente Prisma após mudar o schema |

## Deploy

VPS com [Easypanel](https://easypanel.io) já instalado. A app corre em Docker
(`Dockerfile` na raiz, build multi-stage com output `standalone` do Next.js);
o Postgres corre como serviço à parte no mesmo servidor.

### 1. Base de dados

No painel Easypanel: **+ Service › Postgres**. Um clique, sem configuração.
Depois de criado, abre o serviço e copia a **connection string interna**
(algo como `postgres://postgres:<password>@nome-do-servico:5432/postgres`) —
os serviços no mesmo projeto Easypanel falam entre si pelo nome, não por IP.

### 2. Aplicação

**+ Service › App**, aponta ao repositório
[`pamorimgt-eng/food-paring`](https://github.com/pamorimgt-eng/food-paring) na
branch `main`. O Easypanel deteta o `Dockerfile` sozinho.

Em **Environment**, define:

| Variável | Valor |
|---|---|
| `DATABASE_URL` | A connection string do passo 1 |
| `DIRECT_URL` | A mesma string (não há pooler neste setup) |
| `ANTHROPIC_API_KEY` | A tua chave — console.anthropic.com › API Keys |

Em **Mounts** (ou "Volumes"), adiciona um volume persistente em `/app/uploads`
— sem isto, as fotos carregadas desaparecem a cada novo deploy.

Em **Domain**, por agora sem domínio configurado: a app fica acessível pelo
IP do servidor na porta que expuseres (mapeia a porta do container, `3000`,
para uma porta do host em **Advanced**). Quando houveres um domínio, o
Easypanel trata do SSL automaticamente via Let's Encrypt.

Faz **Deploy**. As migrations correm sozinhas no arranque do container
(`prisma migrate deploy`, dentro do `CMD` do Dockerfile) — não é preciso
correr nada à mão.

> `ANTHROPIC_API_KEY` nunca deve ter o prefixo `NEXT_PUBLIC_` — isso
> exporia a chave no browser. As variáveis acima já estão corretas assim.

### Redeploy

Cada push a `main` não atualiza sozinho — no Easypanel, ativa **auto-deploy**
nas definições do serviço, ou clica **Deploy** manualmente depois de um push.

## Estrutura

```
app/
  sala/              Comanda por mesa: autocomplete, sugestão, envio à cozinha
  cozinha/           KDS — polling a cada 4s, com fallback se o Realtime cair
  backoffice/        Upload de fotos, revisão, "Adicionar referência", perguntas
  api/                Rotas que ligam as páginas à camada de dados e de IA
lib/
  prisma.ts          Cliente Prisma (singleton)
  restaurante.ts      Restaurante atual — fixo no "demo" até haver login
  pesquisaPratos.ts  Autocomplete insensível a acentos (unaccent + pg_trgm)
  sugestao.ts        Motor de sugestão à mesa — só consulta, sem IA
  orquestracao.ts    Liga extração → enriquecimento → pairing
  uploads.ts         Guarda as fotos carregadas em disco (/uploads)
  pairingRegras.ts   Pairing por regras — fallback sem IA (ver ARQUITETURA.md)
  ia/
    cliente.ts       Cliente Claude e modelo usado
    esquemas.ts      Schemas Zod dos structured outputs
    extracao.ts      Foto da carta → itens, para revisão
    enriquecimento.ts Análise de pratos, pesquisa de vinhos, perguntas
    respostas.ts     Traduz a resposta do gerente numa alteração à ficha
    pairing.ts       Geração da matriz prato × vinho
prisma/
  schema.prisma      Modelo de dados
  seed.ts            Restaurante de demonstração com 6 mesas
```

## Estado

Fluxo ponta a ponta a funcionar: carregar pratos e vinhos no backoffice
(foto ou manual), pedir à mesa com autocomplete e sugestão de vinho, enviar
para a cozinha e avançar o estado do pedido. Testado localmente.

Por fazer antes de um piloto real:

- **Login por PIN** (ARQUITETURA.md §3.5) — a app está fixa a um único
  restaurante de demonstração, sem autenticação.
- **Backups da base de dados** — self-hosted significa que os backups são
  responsabilidade nossa. O Easypanel tem a opção de backups automáticos do
  serviço Postgres; vale a pena ativar antes de dados reais entrarem.
- **WebSockets/SSE no KDS** — o polling a cada 4s funciona bem para o volume
  de um restaurante, mas tem uma janela de latência que um canal em tempo
  real eliminaria.
- **Domínio + SSL** — por agora a app fica só no IP do servidor.
