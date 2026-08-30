import { NextResponse } from "next/server";
import { z } from "zod";
import { pesquisarPratos } from "@/lib/pesquisaPratos";
import { prisma } from "@/lib/prisma";
import { sincronizarRestaurante } from "@/lib/orquestracao";

export const maxDuration = 120;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const restauranteId = searchParams.get("restauranteId");
  const q = searchParams.get("q") ?? "";
  if (!restauranteId) {
    return NextResponse.json({ erro: "Falta restauranteId." }, { status: 400 });
  }
  const pratos = await pesquisarPratos(restauranteId, q);
  return NextResponse.json({ pratos });
}

const Corpo = z.object({
  restauranteId: z.string(),
  nome: z.string().min(1),
  descricao: z.string().nullable().optional(),
  seccao: z.string().nullable().optional(),
  preco: z.number().nonnegative(),
});

/** "Adicionar referência" — um prato de cada vez, sem passar pela foto. */
export async function POST(request: Request) {
  const corpo = Corpo.parse(await request.json());

  const prato = await prisma.prato.create({
    data: {
      restauranteId: corpo.restauranteId,
      nome: corpo.nome,
      descricao: corpo.descricao ?? null,
      seccao: corpo.seccao ?? null,
      preco: corpo.preco,
      origem: "MANUAL",
    },
  });

  try {
    await sincronizarRestaurante(corpo.restauranteId);
  } catch (erro) {
    console.error("[pratos] falha ao sincronizar:", erro);
  }

  return NextResponse.json({ prato });
}
