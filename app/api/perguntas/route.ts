import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const restauranteId = searchParams.get("restauranteId");
  if (!restauranteId) {
    return NextResponse.json({ erro: "Falta restauranteId." }, { status: 400 });
  }

  const perguntas = await prisma.pergunta.findMany({
    where: { restauranteId, estado: "ABERTA" },
    orderBy: { criadoEm: "asc" },
  });

  // O nome do vinho/prato não está na Pergunta — vai embutido no texto já
  // pronto (ver lib/ia/enriquecimento.ts::perguntasParaVinho), por isso não é
  // preciso um join aqui.
  return NextResponse.json({ perguntas });
}
