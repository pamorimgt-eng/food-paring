import { getRestauranteAtual } from "@/lib/restaurante";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ComandaMesa } from "./ComandaMesa";

export const dynamic = "force-dynamic";

export default async function MesaPage({
  params,
}: {
  params: Promise<{ mesaId: string }>;
}) {
  const { mesaId } = await params;
  const restaurante = await getRestauranteAtual();
  const mesa = await prisma.mesa.findFirst({
    where: { id: mesaId, restauranteId: restaurante.id },
  });
  if (!mesa) notFound();

  return (
    <ComandaMesa restauranteId={restaurante.id} mesaId={mesa.id} numeroMesa={mesa.numero} />
  );
}
