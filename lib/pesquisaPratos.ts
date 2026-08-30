import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

export type PratoResumo = {
  id: string;
  nome: string;
  descricao: string | null;
  seccao: string | null;
  preco: number;
};

/**
 * Autocomplete de pratos, insensível a acentos e a maiúsculas: "arroz"
 * encontra "Arroz de Pato" a meio da frase. Ver ARQUITETURA.md §3.6 e o
 * índice trigram criado na migration inicial.
 */
export async function pesquisarPratos(
  restauranteId: string,
  termo: string,
): Promise<PratoResumo[]> {
  const termoLimpo = termo.trim();
  if (!termoLimpo) {
    const recentes = await prisma.prato.findMany({
      where: { restauranteId, disponivel: true },
      orderBy: { criadoEm: "desc" },
      take: 15,
      select: { id: true, nome: true, descricao: true, seccao: true, preco: true },
    });
    return recentes.map((p) => ({ ...p, preco: Number(p.preco) }));
  }

  const linhas = await prisma.$queryRaw<
    { id: string; nome: string; descricao: string | null; seccao: string | null; preco: Prisma.Decimal }[]
  >`
    SELECT id, nome, descricao, seccao, preco
    FROM pratos
    WHERE restaurante_id = ${restauranteId}
      AND disponivel = true
      AND imutavel_unaccent(lower(nome)) ILIKE imutavel_unaccent(lower(${"%" + termoLimpo + "%"}))
    ORDER BY similarity(imutavel_unaccent(lower(nome)), imutavel_unaccent(lower(${termoLimpo}))) DESC
    LIMIT 15
  `;

  return linhas.map((p) => ({ ...p, preco: Number(p.preco) }));
}
