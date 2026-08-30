import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EstadoPedido } from "@prisma/client";

const ESTADOS_COZINHA: EstadoPedido[] = ["ENVIADO", "PREPARACAO", "PRONTO"];

/** Lista os pedidos ativos para o ecrã de cozinha. Consumido por polling. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const restauranteId = searchParams.get("restauranteId");
  if (!restauranteId) {
    return NextResponse.json({ erro: "Falta restauranteId." }, { status: 400 });
  }

  const pedidos = await prisma.pedido.findMany({
    where: { restauranteId, estado: { in: ESTADOS_COZINHA } },
    orderBy: { criadoEm: "asc" },
    include: { mesa: true, itens: { include: { prato: true } } },
  });

  return NextResponse.json({
    pedidos: pedidos.map((p) => ({
      id: p.id,
      estado: p.estado,
      mesa: p.mesa.numero,
      criadoEm: p.criadoEm,
      itens: p.itens.map((i) => ({
        id: i.id,
        nome: i.prato.nome,
        quantidade: i.quantidade,
        notas: i.notas,
        estado: i.estado,
      })),
    })),
  });
}
