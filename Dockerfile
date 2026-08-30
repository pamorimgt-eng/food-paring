# Imagem para deploy em VPS via Easypanel. Ver README.md > Deploy.

# ---- dependências --------------------------------------------------------
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- build ----------------------------------------------------------------
FROM node:20-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Placeholders — só para o build conseguir carregar o schema; os valores
# reais entram em runtime pelas variáveis de ambiente do Easypanel.
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/db"
ENV DIRECT_URL="postgresql://user:pass@localhost:5432/db"
RUN npx prisma generate
RUN npm run build

# ---- runtime ----------------------------------------------------------------
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# O tracer de dependências do Next não apanha o motor do Prisma (binário
# nativo, carregado em runtime, não importado estaticamente) — copiado à parte.
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/prisma ./prisma

# As fotos carregadas ficam aqui — monta um volume persistente do Easypanel
# neste caminho, ou perdem-se a cada deploy.
RUN mkdir -p /app/uploads && chown nextjs:nodejs /app/uploads

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Aplica migrations pendentes antes de arrancar — idempotente, seguro em
# cada deploy.
CMD ["sh", "-c", "node node_modules/prisma/build/index.js migrate deploy && node server.js"]
