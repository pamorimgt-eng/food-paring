import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const Corpo = z.object({
  sugestoesEscolhidas: z
    .array(
      z.object({
        cartaVinhoId: z.string(),
        banda: z.enum(["ECONOMICO", "MEDIO", "PREMIUM"]),
        argumentos: z.array(z.string()),
      }),
    )
    .default([]),
});

/**
 * Envia o pedido para a cozinha e regista as sugestões mostradas ao
 * empregado — é o que dá a métrica de vinho vendido por influência do
 * sistema (PedidoSugestao.aceite, atualizado depois ao fechar a mesa).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { sugestoesEscolhidas } = Corpo.parse(await request.json());

  await prisma.$transaction([
    prisma.pedido.update({ where: { id }, data: { estado: "ENVIADO" } }),
    ...(sugestoesEscolhidas.length > 0
      ? [
          prisma.pedidoSugestao.createMany({
            data: sugestoesEscolhidas.map((s) => ({
              pedidoId: id,
              cartaVinhoId: s.cartaVinhoId,
              banda: s.banda,
              argumentos: s.argumentos,
            })),
          }),
        ]
      : []),
  ]);

  return NextResponse.json({ ok: true });
}
