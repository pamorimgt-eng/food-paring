import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const Corpo = z.object({
  pratoId: z.string(),
  quantidade: z.number().int().min(1).default(1),
  notas: z.string().nullable().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const corpo = Corpo.parse(await request.json());

  const item = await prisma.pedidoItem.create({
    data: {
      pedidoId: id,
      pratoId: corpo.pratoId,
      quantidade: corpo.quantidade,
      notas: corpo.notas ?? null,
    },
  });

  return NextResponse.json({ item });
}
