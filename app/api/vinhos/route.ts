import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sincronizarRestaurante } from "@/lib/orquestracao";

export const maxDuration = 120;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const restauranteId = searchParams.get("restauranteId");
  if (!restauranteId) {
    return NextResponse.json({ erro: "Falta restauranteId." }, { status: 400 });
  }
  const cartas = await prisma.cartaVinho.findMany({
    where: { restauranteId },
    orderBy: { criadoEm: "desc" },
    include: { vinho: true },
  });
  return NextResponse.json({
    vinhos: cartas.map((c) => ({
      cartaVinhoId: c.id,
      nome: c.vinho.nome,
      produtor: c.vinho.produtor,
      ano: c.vinho.ano,
      regiao: c.vinho.regiao,
      tipo: c.vinho.tipo,
      confianca: c.vinho.confianca,
      enriquecido: c.vinho.enriquecidoEm != null,
      preco: Number(c.preco),
      disponivel: c.disponivel,
    })),
  });
}

const Corpo = z.object({
  restauranteId: z.string(),
  nome: z.string().min(1),
  produtor: z.string().nullable().optional(),
  ano: z.number().int().nullable().optional(),
  regiao: z.string().nullable().optional(),
  preco: z.number().nonnegative(),
});

/** "Adicionar referência" — um vinho de cada vez, sem passar pela foto. */
export async function POST(request: Request) {
  const corpo = Corpo.parse(await request.json());

  // Ver nota em app/api/vinhos/confirmar/route.ts: NULL != NULL em SQL, por
  // isso a procura por produtor/ano em falta tem de ser explícita.
  const vinhoCatalogo =
    (await prisma.vinhoCatalogo.findFirst({
      where: { nome: corpo.nome, produtor: corpo.produtor ?? null, ano: corpo.ano ?? null },
    })) ??
    (await prisma.vinhoCatalogo.create({
      data: {
        nome: corpo.nome,
        produtor: corpo.produtor ?? null,
        ano: corpo.ano ?? null,
        regiao: corpo.regiao ?? null,
        castas: [],
      },
    }));

  const cartaVinho = await prisma.cartaVinho.upsert({
    where: {
      restauranteId_vinhoCatalogoId: {
        restauranteId: corpo.restauranteId,
        vinhoCatalogoId: vinhoCatalogo.id,
      },
    },
    update: { preco: corpo.preco, disponivel: true },
    create: {
      restauranteId: corpo.restauranteId,
      vinhoCatalogoId: vinhoCatalogo.id,
      preco: corpo.preco,
      stock: 1,
      origem: "MANUAL",
    },
  });

  try {
    await sincronizarRestaurante(corpo.restauranteId);
  } catch (erro) {
    console.error("[vinhos] falha ao sincronizar:", erro);
  }

  return NextResponse.json({ cartaVinho });
}
