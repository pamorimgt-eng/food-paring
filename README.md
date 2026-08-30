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

Precisas de Node 20+ e de uma conta Supabase.

```bash
npm install
```

Copia o ficheiro de ambiente e preenche-o:

```bash
cp .env.example .env
```

| Variável | Onde obter |
|---|---|
| `DATABASE_URL` | Supabase › Project Settings › Database › Connection pooling (porta 6543) |
| `DIRECT_URL` | A mesma ligação, mas direta (porta 5432). As migrations precisam dela. |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase › Project Settings › API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase › Project Settings › API |
| `SUPABASE_SERVICE_ROLE_KEY` | O mesmo sítio. **Só no servidor** — nunca com prefixo `NEXT_PUBLIC_`. |
| `ANTHROPIC_API_KEY` | console.anthropic.com › API Keys |

Cria o esquema na base de dados e arranca:

```bash
npm run db:migrate
```

```bash
npm run dev
```

Fica em http://localhost:3000.

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
app/                 Rotas: sala, cozinha, backoffice
lib/
  prisma.ts          Cliente Prisma (singleton)
  sugestao.ts        Motor de sugestão à mesa — só consulta, sem IA
  ia/
    cliente.ts       Cliente Claude e modelo usado
    esquemas.ts      Schemas Zod dos structured outputs
    extracao.ts      Foto da carta → itens, para revisão
    enriquecimento.ts Análise de pratos, pesquisa de vinhos, perguntas
    pairing.ts       Geração da matriz prato × vinho
prisma/schema.prisma Modelo de dados
```

## Estado

Fundação assente: modelo de dados, camada de IA e motor de sugestão. As
interfaces de sala, cozinha e backoffice são o passo seguinte.
