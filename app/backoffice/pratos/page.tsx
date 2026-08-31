import { getRestauranteAtual } from "@/lib/restaurante";
import { prisma } from "@/lib/prisma";
import { exigirPapel } from "@/lib/auth";
import { PratosBackoffice } from "./PratosBackoffice";

export const dynamic = "force-dynamic";

export default async function PratosPage() {
  await exigirPapel(["ADMIN"]);
  const restaurante = await getRestauranteAtual();
  const pratos = await prisma.prato.findMany({
    where: { restauranteId: restaurante.id },
    orderBy: { criadoEm: "desc" },
  });

  return (
    <PratosBackoffice
      restauranteId={restaurante.id}
      pratosIniciais={pratos.map((p) => ({
        id: p.id,
        nome: p.nome,
        seccao: p.seccao,
        preco: Number(p.preco),
        enriquecido: p.enriquecidoEm != null,
        origem: p.origem,
      }))}
    />
  );
}
