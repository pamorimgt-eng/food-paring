import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const Corpo = z.object({
  estado: z.enum(["PENDENTE", "PREPARACAO", "PRONTO"]).optional(),
  notas: z.string().nullable().optional(),
  quantidade: z.number().int().min(1).max(20).optional(),
});

/**
 * Edição de um item do pedido. Serve dois consumidores diferentes:
 * a cozinha manda `estado`, a sala manda `notas` (pedidos especiais, ex:
 * "sem batata frita") e `quantidade`.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  const { id, itemId } = await params;
  const corpo = Corpo.parse(await request.json());

  await prisma.pedidoItem.update({
    where: { id: itemId },
    data: {
      ...(corpo.estado !== undefined && { estado: corpo.estado }),
      ...(corpo.notas !== undefined && { notas: corpo.notas }),
      ...(corpo.quantidade !== undefined && { quantidade: corpo.quantidade }),
    },
  });

  // Só faz sentido fechar o pedido por estado dos itens quando é a cozinha a
  // chamar isto — uma edição de nota/quantidade não deve mexer no estado do
  // pedido.
  if (corpo.estado !== undefined) {
    const itens = await prisma.pedidoItem.findMany({ where: { pedidoId: id } });
    const todosProntos = itens.length > 0 && itens.every((i) => i.estado === "PRONTO");

    const pedido = await prisma.pedido.findUnique({ where: { id } });
    if (todosProntos && pedido?.estado === "PREPARACAO") {
      await prisma.pedido.update({ where: { id }, data: { estado: "PRONTO" } });
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ itemId: string }> },
) {
  const { itemId } = await params;
  await prisma.pedidoItem.delete({ where: { id: itemId } });
  return NextResponse.json({ ok: true });
}
