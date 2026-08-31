# Imagem para deploy em VPS via Easypanel. Ver README.md > Deploy.
#
# Não usa o output "standalone" do Next.js de propósito: copiar só os
# ficheiros que o tracer de dependências apanha partiu duas vezes com o
# Prisma (o motor nativo e, depois, uma dependência transitiva nova do CLI —
# "effect" — que o tracer nunca ia adivinhar). Levar o node_modules completo
# para a imagem final é maior, mas para de partir a cada atualização do
# Prisma.

# ---- dependências --------------------------------------------------------
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package.json package-lock.json ./
# --ignore-scripts: o postinstall corre "prisma generate", mas o schema só é
# copiado no estágio "builder" — sem isto, o install falhava aqui por não
# encontrar prisma/schema.prisma. O "builder" já corre prisma generate
# explicitamente depois de copiar o código todo.
RUN npm ci --ignore-scripts

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

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/prisma ./prisma
RUN chown -R nextjs:nodejs /app/.next

# As fotos carregadas ficam aqui — monta um volume persistente do Easypanel
# neste caminho, ou perdem-se a cada deploy.
RUN mkdir -p /app/uploads && chown nextjs:nodejs /app/uploads

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Migrations e seed correm sozinhos no arranque — ambos idempotentes
# (upsert no seed), seguros de repetir em cada deploy. O seed garante que o
# restaurante de demonstração e os PINs de acesso existem mesmo numa base de
# dados nova (ex: primeiro deploy num VPS).
CMD ["sh", "-c", "npx prisma migrate deploy && npx tsx prisma/seed.ts && npm run start"]
