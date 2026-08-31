import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getRestauranteAtual } from "@/lib/restaurante";
import { iniciarSessao, pinCorresponde } from "@/lib/auth";

const Corpo = z.object({ pin: z.string().min(4).max(4) });

export async function POST(request: Request) {
  const { pin } = Corpo.parse(await request.json());
  const restaurante = await getRestauranteAtual();

  const candidatos = await prisma.utilizador.findMany({
    where: { restauranteId: restaurante.id, pinHash: { not: null } },
  });
  const utilizador = candidatos.find((u) => u.pinHash && pinCorresponde(pin, u.pinHash));

  if (!utilizador) {
    return NextResponse.json({ erro: "PIN incorreto." }, { status: 401 });
  }

  await iniciarSessao(utilizador.id);
  return NextResponse.json({ nome: utilizador.nome, papel: utilizador.papel });
}
