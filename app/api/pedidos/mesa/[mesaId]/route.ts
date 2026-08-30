import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Devolve o pedido em aberto desta mesa, criando um se não existir. É o
 * ponto de entrada da sala: selecionar mesa começa (ou continua) sempre um
 * único pedido ABERTO.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ mesaId: string }> },
) {
  const { mesaId } = await params;
  const { searchParams } = new URL(request.url);
  const restauranteId = searchParams.get("restauranteId");
  if (!restauranteId) {
    return NextResponse.json({ erro: "Falta restauranteId." }, { status: 400 });
  }

  let pedido = await prisma.pedido.findFirst({
    where: { mesaId, estado: "ABERTO" },
    include: { itens: { include: { prato: true } }, mesa: true },
  });

  if (!pedido) {
    pedido = await prisma.pedido.create({
      data: { restauranteId, mesaId, estado: "ABERTO" },
      include: { itens: { include: { prato: true } }, mesa: true },
    });
  }

  return NextResponse.json({ pedido: serializar(pedido) });
}

function serializar(pedido: {
  id: string;
  estado: string;
  mesa: { numero: string };
  itens: { id: string; quantidade: number; notas: string | null; estado: string; prato: { id: string; nome: string; preco: unknown } }[];
}) {
  return {
    id: pedido.id,
    estado: pedido.estado,
    mesa: pedido.mesa.numero,
    itens: pedido.itens.map((i) => ({
      id: i.id,
      quantidade: i.quantidade,
      notas: i.notas,
      estado: i.estado,
      pratoId: i.prato.id,
      nome: i.prato.nome,
      preco: Number(i.prato.preco),
    })),
  };
}
