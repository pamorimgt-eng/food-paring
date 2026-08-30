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
| Base de dados | PostgreSQL (Supabase) via Prisma 6 |
| Tempo real | Supabase Realtime, com polling de fallback no KDS |
| IA | Claude `claude-opus-5` — visão, pesquisa web, structured outputs |
| Deploy | Vercel + Supabase |

## Correr localmente

Precisas de Node 20+ e de um Postgres — local ou Supabase.

```bash
npm install
```

Copia o ficheiro de ambiente e preenche-o:

```bash
cp .env.example .env
```

**Opção A — Postgres local (mais rápido para experimentar):**

```bash
DATABASE_URL="postgresql://<utilizador>:<password>@localhost:5432/food_pairing"
DIRECT_URL="postgresql://<utilizador>:<password>@localhost:5432/food_pairing"
```

Cria a base de dados antes de migrar: `createdb food_pairing` (ou `CREATE
DATABASE food_pairing;` no `psql`). As extensões `unaccent` e `pg_trgm` são
criadas automaticamente pela primeira migration.

**Opção B — Supabase (o que o deploy usa):**

| Variável | Onde obter |
|---|---|
| `DATABASE_URL` | Supabase › Project Settings › Database › Connection pooling (porta 6543) |
| `DIRECT_URL` | A mesma ligação, mas direta (porta 5432). As migrations precisam dela. |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase › Project Settings › API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase › Project Settings › API |
| `SUPABASE_SERVICE_ROLE_KEY` | O mesmo sítio. **Só no servidor** — nunca com prefixo `NEXT_PUBLIC_`. |

Em qualquer dos casos, preenche também:

| Variável | Onde obter |
|---|---|
| `ANTHROPIC_API_KEY` | console.anthropic.com › API Keys. Sem isto, tudo corre exceto a leitura de fotos e o enriquecimento por IA. |

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

**Base de dados — Supabase.** Cria o projeto, copia as duas connection strings
para o `.env` e aplica as migrations com `npx prisma migrate deploy`.

**Aplicação — Vercel.** Liga o repositório, define as mesmas variáveis de
ambiente em Project Settings › Environment Variables e faz deploy. O build
corre `prisma generate` automaticamente através do `postinstall`.

> O `ANTHROPIC_API_KEY` e o `SUPABASE_SERVICE_ROLE_KEY` só podem existir no
> ambiente de servidor. Um `NEXT_PUBLIC_` à frente de qualquer um deles
> expõe-nos no browser.

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
  uploads.ts         Guarda as fotos carregadas (Supabase Storage em produção)
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
- **Supabase Storage** para as fotos carregadas — hoje ficam em disco local
  (`/uploads`, fora do git).
- **Supabase Realtime** no KDS — o polling a cada 4s funciona, mas um canal
  Realtime dava latência menor.
- Ligar a um projeto Anthropic com `ANTHROPIC_API_KEY` real para testar a
  ingestão por foto e o enriquecimento — sem chave, tudo o resto funciona e o
  erro fica isolado a essa chamada.
