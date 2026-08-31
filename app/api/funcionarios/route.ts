import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { calcularHashPin } from "@/lib/auth";

const Corpo = z.object({
  restauranteId: z.string(),
  nome: z.string().min(1),
  papel: z.enum(["ADMIN", "SALA", "COZINHA"]),
  pin: z.string().length(4).regex(/^\d{4}$/, "O PIN tem de ter 4 dígitos."),
});

export async function POST(request: Request) {
  const corpo = Corpo.parse(await request.json());

  const funcionario = await prisma.utilizador.create({
    data: {
      restauranteId: corpo.restauranteId,
      nome: corpo.nome,
      papel: corpo.papel,
      pinHash: calcularHashPin(corpo.pin),
    },
  });

  return NextResponse.json({ id: funcionario.id });
}
