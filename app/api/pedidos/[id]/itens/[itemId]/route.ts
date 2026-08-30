import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const Corpo = z.object({ estado: z.enum(["PENDENTE", "PREPARACAO", "PRONTO"]) });

/** A cozinha avança o estado de um item. Quando todos ficam prontos, o pedido segue-os. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  const { id, itemId } = await params;
  const { estado } = Corpo.parse(await request.json());

  await prisma.pedidoItem.update({ where: { id: itemId }, data: { estado } });

  const itens = await prisma.pedidoItem.findMany({ where: { pedidoId: id } });
  const todosProntos = itens.length > 0 && itens.every((i) => i.estado === "PRONTO");

  const pedido = await prisma.pedido.findUnique({ where: { id } });
  if (todosProntos && pedido?.estado === "PREPARACAO") {
    await prisma.pedido.update({ where: { id }, data: { estado: "PRONTO" } });
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
