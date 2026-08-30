import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sincronizarRestaurante } from "@/lib/orquestracao";

export const maxDuration = 300;

const Corpo = z.object({
  restauranteId: z.string(),
  uploadId: z.string().optional(),
  pratos: z.array(
    z.object({
      nome: z.string().min(1),
      descricao: z.string().nullable().optional(),
      seccao: z.string().nullable().optional(),
      preco: z.number().nonnegative(),
    }),
  ),
});

/**
 * Grava os pratos só depois de o gerente confirmar o ecrã de revisão — nunca
 * a partir da extração da IA diretamente. Depois enriquece e gera o pairing;
 * é síncrono neste pedido, o que é aceitável para o volume de um onboarding.
 */
export async function POST(request: Request) {
  const corpo = Corpo.parse(await request.json());

  await prisma.prato.createMany({
    data: corpo.pratos.map((p) => ({
      restauranteId: corpo.restauranteId,
      nome: p.nome,
      descricao: p.descricao ?? null,
      seccao: p.seccao ?? null,
      preco: p.preco,
      origem: "FOTO" as const,
    })),
  });

  if (corpo.uploadId) {
    await prisma.cartaUpload.update({
      where: { id: corpo.uploadId },
      data: { estado: "CONFIRMADO" },
    });
  }

  try {
    await sincronizarRestaurante(corpo.restauranteId);
  } catch (erro) {
    // Os pratos já ficaram gravados; o enriquecimento pode ser repetido.
    console.error("[menu/confirmar] falha ao sincronizar:", erro);
    return NextResponse.json({
      criados: corpo.pratos.length,
      aviso: "Pratos guardados, mas o enriquecimento por IA falhou. Tenta novamente no backoffice.",
    });
  }

  return NextResponse.json({ criados: corpo.pratos.length });
}
