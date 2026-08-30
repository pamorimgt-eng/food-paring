-- Pesquisa insensível a acentos no autocomplete de pratos (ver ARQUITETURA.md §3.6):
-- "arroz" tem de encontrar "Arroz de Pato" mesmo a meio da frase.
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- CreateEnum
CREATE TYPE "Papel" AS ENUM ('ADMIN', 'SALA', 'COZINHA');

-- CreateEnum
CREATE TYPE "TipoCarta" AS ENUM ('MENU', 'VINHOS');

-- CreateEnum
CREATE TYPE "EstadoUpload" AS ENUM ('PROCESSANDO', 'REVISAO', 'CONFIRMADO', 'ERRO');

-- CreateEnum
CREATE TYPE "Origem" AS ENUM ('FOTO', 'MANUAL');

-- CreateEnum
CREATE TYPE "TipoVinho" AS ENUM ('TINTO', 'BRANCO', 'ROSE', 'ESPUMANTE', 'FORTIFICADO', 'LARANJA');

-- CreateEnum
CREATE TYPE "Confianca" AS ENUM ('ALTA', 'MEDIA', 'BAIXA');

-- CreateEnum
CREATE TYPE "AlvoPergunta" AS ENUM ('PRATO', 'VINHO');

-- CreateEnum
CREATE TYPE "EstadoPergunta" AS ENUM ('ABERTA', 'RESPONDIDA', 'IGNORADA');

-- CreateEnum
CREATE TYPE "EstadoPedido" AS ENUM ('ABERTO', 'ENVIADO', 'PREPARACAO', 'PRONTO', 'ENTREGUE', 'FECHADO');

-- CreateEnum
CREATE TYPE "EstadoItem" AS ENUM ('PENDENTE', 'PREPARACAO', 'PRONTO');

-- CreateEnum
CREATE TYPE "Banda" AS ENUM ('ECONOMICO', 'MEDIO', 'PREMIUM');

-- CreateTable
CREATE TABLE "restaurantes" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "restaurantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utilizadores" (
    "id" TEXT NOT NULL,
    "restaurante_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "pin_hash" TEXT,
    "papel" "Papel" NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "utilizadores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mesas" (
    "id" TEXT NOT NULL,
    "restaurante_id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "capacidade" INTEGER NOT NULL DEFAULT 2,

    CONSTRAINT "mesas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cartas_upload" (
    "id" TEXT NOT NULL,
    "restaurante_id" TEXT NOT NULL,
    "tipo" "TipoCarta" NOT NULL,
    "imagem_url" TEXT NOT NULL,
    "estado" "EstadoUpload" NOT NULL DEFAULT 'PROCESSANDO',
    "extraido" JSONB,
    "erro" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cartas_upload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pratos" (
    "id" TEXT NOT NULL,
    "restaurante_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "seccao" TEXT,
    "preco" DECIMAL(10,2) NOT NULL,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,
    "origem" "Origem" NOT NULL DEFAULT 'MANUAL',
    "atributos" JSONB,
    "enriquecido_em" TIMESTAMP(3),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pratos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vinhos_catalogo" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "produtor" TEXT,
    "ano" INTEGER,
    "regiao" TEXT,
    "pais" TEXT,
    "castas" TEXT[],
    "tipo" "TipoVinho",
    "atributos" JSONB,
    "fontes" JSONB,
    "confianca" "Confianca" NOT NULL DEFAULT 'BAIXA',
    "enriquecido_em" TIMESTAMP(3),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vinhos_catalogo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carta_vinhos" (
    "id" TEXT NOT NULL,
    "restaurante_id" TEXT NOT NULL,
    "vinho_catalogo_id" TEXT NOT NULL,
    "preco" DECIMAL(10,2) NOT NULL,
    "custo" DECIMAL(10,2),
    "stock" INTEGER NOT NULL DEFAULT 0,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,
    "origem" "Origem" NOT NULL DEFAULT 'MANUAL',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "carta_vinhos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perguntas" (
    "id" TEXT NOT NULL,
    "restaurante_id" TEXT NOT NULL,
    "alvo_tipo" "AlvoPergunta" NOT NULL,
    "alvo_id" TEXT NOT NULL,
    "campo" TEXT NOT NULL,
    "pergunta" TEXT NOT NULL,
    "opcoes" JSONB,
    "resposta" TEXT,
    "estado" "EstadoPergunta" NOT NULL DEFAULT 'ABERTA',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondido_em" TIMESTAMP(3),

    CONSTRAINT "perguntas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pairings" (
    "id" TEXT NOT NULL,
    "prato_id" TEXT NOT NULL,
    "carta_vinho_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "argumentos" JSONB NOT NULL,
    "gerado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pairings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id" TEXT NOT NULL,
    "restaurante_id" TEXT NOT NULL,
    "mesa_id" TEXT NOT NULL,
    "utilizador_id" TEXT,
    "estado" "EstadoPedido" NOT NULL DEFAULT 'ABERTO',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedido_itens" (
    "id" TEXT NOT NULL,
    "pedido_id" TEXT NOT NULL,
    "prato_id" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "notas" TEXT,
    "estado" "EstadoItem" NOT NULL DEFAULT 'PENDENTE',

    CONSTRAINT "pedido_itens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedido_sugestoes" (
    "id" TEXT NOT NULL,
    "pedido_id" TEXT NOT NULL,
    "carta_vinho_id" TEXT NOT NULL,
    "banda" "Banda" NOT NULL,
    "argumentos" JSONB NOT NULL,
    "aceite" BOOLEAN,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pedido_sugestoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "restaurantes_slug_key" ON "restaurantes"("slug");

-- CreateIndex
CREATE INDEX "utilizadores_restaurante_id_idx" ON "utilizadores"("restaurante_id");

-- CreateIndex
CREATE UNIQUE INDEX "utilizadores_restaurante_id_email_key" ON "utilizadores"("restaurante_id", "email");

-- CreateIndex
CREATE INDEX "mesas_restaurante_id_idx" ON "mesas"("restaurante_id");

-- CreateIndex
CREATE UNIQUE INDEX "mesas_restaurante_id_numero_key" ON "mesas"("restaurante_id", "numero");

-- CreateIndex
CREATE INDEX "cartas_upload_restaurante_id_estado_idx" ON "cartas_upload"("restaurante_id", "estado");

-- CreateIndex
CREATE INDEX "pratos_restaurante_id_disponivel_idx" ON "pratos"("restaurante_id", "disponivel");

-- CreateIndex
CREATE INDEX "vinhos_catalogo_tipo_idx" ON "vinhos_catalogo"("tipo");

-- CreateIndex
CREATE UNIQUE INDEX "vinhos_catalogo_nome_produtor_ano_key" ON "vinhos_catalogo"("nome", "produtor", "ano");

-- CreateIndex
CREATE INDEX "carta_vinhos_restaurante_id_disponivel_idx" ON "carta_vinhos"("restaurante_id", "disponivel");

-- CreateIndex
CREATE UNIQUE INDEX "carta_vinhos_restaurante_id_vinho_catalogo_id_key" ON "carta_vinhos"("restaurante_id", "vinho_catalogo_id");

-- CreateIndex
CREATE INDEX "perguntas_restaurante_id_estado_idx" ON "perguntas"("restaurante_id", "estado");

-- CreateIndex
CREATE INDEX "perguntas_alvo_tipo_alvo_id_idx" ON "perguntas"("alvo_tipo", "alvo_id");

-- CreateIndex
CREATE INDEX "pairings_prato_id_score_idx" ON "pairings"("prato_id", "score");

-- CreateIndex
CREATE UNIQUE INDEX "pairings_prato_id_carta_vinho_id_key" ON "pairings"("prato_id", "carta_vinho_id");

-- CreateIndex
CREATE INDEX "pedidos_restaurante_id_estado_idx" ON "pedidos"("restaurante_id", "estado");

-- CreateIndex
CREATE INDEX "pedidos_mesa_id_estado_idx" ON "pedidos"("mesa_id", "estado");

-- CreateIndex
CREATE INDEX "pedido_itens_pedido_id_idx" ON "pedido_itens"("pedido_id");

-- CreateIndex
CREATE INDEX "pedido_sugestoes_pedido_id_idx" ON "pedido_sugestoes"("pedido_id");

-- AddForeignKey
ALTER TABLE "utilizadores" ADD CONSTRAINT "utilizadores_restaurante_id_fkey" FOREIGN KEY ("restaurante_id") REFERENCES "restaurantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mesas" ADD CONSTRAINT "mesas_restaurante_id_fkey" FOREIGN KEY ("restaurante_id") REFERENCES "restaurantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cartas_upload" ADD CONSTRAINT "cartas_upload_restaurante_id_fkey" FOREIGN KEY ("restaurante_id") REFERENCES "restaurantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pratos" ADD CONSTRAINT "pratos_restaurante_id_fkey" FOREIGN KEY ("restaurante_id") REFERENCES "restaurantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carta_vinhos" ADD CONSTRAINT "carta_vinhos_restaurante_id_fkey" FOREIGN KEY ("restaurante_id") REFERENCES "restaurantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carta_vinhos" ADD CONSTRAINT "carta_vinhos_vinho_catalogo_id_fkey" FOREIGN KEY ("vinho_catalogo_id") REFERENCES "vinhos_catalogo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perguntas" ADD CONSTRAINT "perguntas_restaurante_id_fkey" FOREIGN KEY ("restaurante_id") REFERENCES "restaurantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pairings" ADD CONSTRAINT "pairings_prato_id_fkey" FOREIGN KEY ("prato_id") REFERENCES "pratos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pairings" ADD CONSTRAINT "pairings_carta_vinho_id_fkey" FOREIGN KEY ("carta_vinho_id") REFERENCES "carta_vinhos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_restaurante_id_fkey" FOREIGN KEY ("restaurante_id") REFERENCES "restaurantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_mesa_id_fkey" FOREIGN KEY ("mesa_id") REFERENCES "mesas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_utilizador_id_fkey" FOREIGN KEY ("utilizador_id") REFERENCES "utilizadores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_itens" ADD CONSTRAINT "pedido_itens_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_itens" ADD CONSTRAINT "pedido_itens_prato_id_fkey" FOREIGN KEY ("prato_id") REFERENCES "pratos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_sugestoes" ADD CONSTRAINT "pedido_sugestoes_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_sugestoes" ADD CONSTRAINT "pedido_sugestoes_carta_vinho_id_fkey" FOREIGN KEY ("carta_vinho_id") REFERENCES "carta_vinhos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- unaccent() do Postgres é STABLE, não IMMUTABLE — não pode ser usado
-- diretamente num índice funcional. Este wrapper marca-o IMMUTABLE porque o
-- dicionário 'unaccent' que usamos não muda em runtime. Schema qualificado
-- explicitamente: o motor de migrations do Prisma corre com um search_path
-- que não se pode assumir incluir "public".
CREATE OR REPLACE FUNCTION imutavel_unaccent(text)
RETURNS text AS
$$
  SELECT public.unaccent($1)
$$ LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT;

-- Autocomplete de pratos insensível a acentos e a maiúsculas/minúsculas
-- (ver ARQUITETURA.md §3.6).
CREATE INDEX "pratos_nome_trgm_idx" ON "pratos"
  USING gin (imutavel_unaccent(lower("nome")) gin_trgm_ops);
