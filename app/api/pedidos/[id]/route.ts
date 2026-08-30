import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const Corpo = z.object({
  estado: z.enum(["ABERTO", "ENVIADO", "PREPARACAO", "PRONTO", "ENTREGUE", "FECHADO"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { estado } = Corpo.parse(await request.json());
  const pedido = await prisma.pedido.update({ where: { id }, data: { estado } });
  return NextResponse.json({ pedido });
}
