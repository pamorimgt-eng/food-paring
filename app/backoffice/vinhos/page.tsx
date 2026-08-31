import { getRestauranteAtual } from "@/lib/restaurante";
import { prisma } from "@/lib/prisma";
import { exigirPapel } from "@/lib/auth";
import { VinhosBackoffice } from "./VinhosBackoffice";

export const dynamic = "force-dynamic";

export default async function VinhosPage() {
  await exigirPapel(["ADMIN"]);
  const restaurante = await getRestauranteAtual();
  const cartas = await prisma.cartaVinho.findMany({
    where: { restauranteId: restaurante.id },
    orderBy: { criadoEm: "desc" },
    include: { vinho: true },
  });

  return (
    <VinhosBackoffice
      restauranteId={restaurante.id}
      vinhosIniciais={cartas.map((c) => ({
        cartaVinhoId: c.id,
        nome: c.vinho.nome,
        produtor: c.vinho.produtor,
        ano: c.vinho.ano,
        tipo: c.vinho.tipo,
        confianca: c.vinho.confianca,
        enriquecido: c.vinho.enriquecidoEm != null,
        preco: Number(c.preco),
        origem: c.origem,
      }))}
    />
  );
}
