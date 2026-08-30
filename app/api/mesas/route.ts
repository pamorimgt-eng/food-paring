import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Mesas do restaurante, com o estado derivado de terem ou não pedido aberto. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const restauranteId = searchParams.get("restauranteId");
  if (!restauranteId) {
    return NextResponse.json({ erro: "Falta restauranteId." }, { status: 400 });
  }

  const mesas = await prisma.mesa.findMany({
    where: { restauranteId },
    orderBy: { numero: "asc" },
    include: {
      pedidos: {
        where: { estado: { not: "FECHADO" } },
        select: { id: true, estado: true },
      },
    },
  });

  return NextResponse.json({
    mesas: mesas.map((m) => ({
      id: m.id,
      numero: m.numero,
      capacidade: m.capacidade,
      ocupada: m.pedidos.length > 0,
      pedidoId: m.pedidos[0]?.id ?? null,
    })),
  });
}
