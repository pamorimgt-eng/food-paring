import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sincronizarRestaurante } from "@/lib/orquestracao";

export const maxDuration = 300;

const Corpo = z.object({
  restauranteId: z.string(),
  uploadId: z.string().optional(),
  vinhos: z.array(
    z.object({
      nome: z.string().min(1),
      produtor: z.string().nullable().optional(),
      ano: z.number().int().nullable().optional(),
      regiao: z.string().nullable().optional(),
      preco: z.number().nonnegative(),
    }),
  ),
});

/**
 * Grava os vinhos confirmados no catálogo partilhado + na carta deste
 * restaurante. Um vinho com o mesmo nome/produtor/ano já existente é
 * reutilizado — é o que evita reintroduzir fichas técnicas repetidas.
 */
export async function POST(request: Request) {
  const corpo = Corpo.parse(await request.json());

  for (const v of corpo.vinhos) {
    // Upsert por chave composta não serve aqui: SQL nunca considera NULL
    // igual a NULL, e produtor/ano ficam muitas vezes por preencher numa
    // extração por foto. Por isso a procura é explícita.
    const vinhoCatalogo =
      (await prisma.vinhoCatalogo.findFirst({
        where: { nome: v.nome, produtor: v.produtor ?? null, ano: v.ano ?? null },
      })) ??
      (await prisma.vinhoCatalogo.create({
        data: {
          nome: v.nome,
          produtor: v.produtor ?? null,
          ano: v.ano ?? null,
          regiao: v.regiao ?? null,
          castas: [],
        },
      }));

    await prisma.cartaVinho.upsert({
      where: {
        restauranteId_vinhoCatalogoId: {
          restauranteId: corpo.restauranteId,
          vinhoCatalogoId: vinhoCatalogo.id,
        },
      },
      update: { preco: v.preco, disponivel: true },
      create: {
        restauranteId: corpo.restauranteId,
        vinhoCatalogoId: vinhoCatalogo.id,
        preco: v.preco,
        stock: 1,
        origem: "FOTO",
      },
    });
  }

  if (corpo.uploadId) {
    await prisma.cartaUpload.update({
      where: { id: corpo.uploadId },
      data: { estado: "CONFIRMADO" },
    });
  }

  try {
    await sincronizarRestaurante(corpo.restauranteId);
  } catch (erro) {
    console.error("[vinhos/confirmar] falha ao sincronizar:", erro);
    return NextResponse.json({
      criados: corpo.vinhos.length,
      aviso:
        "Vinhos guardados, mas a pesquisa da ficha técnica falhou. Tenta novamente no backoffice.",
    });
  }

  return NextResponse.json({ criados: corpo.vinhos.length });
}
