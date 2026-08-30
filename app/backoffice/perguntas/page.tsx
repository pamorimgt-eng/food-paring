import { getRestauranteAtual } from "@/lib/restaurante";
import { prisma } from "@/lib/prisma";
import { PerguntasBackoffice } from "./PerguntasBackoffice";

export const dynamic = "force-dynamic";

export default async function PerguntasPage() {
  const restaurante = await getRestauranteAtual();
  const perguntas = await prisma.pergunta.findMany({
    where: { restauranteId: restaurante.id, estado: "ABERTA" },
    orderBy: { criadoEm: "asc" },
  });

  return (
    <PerguntasBackoffice
      perguntasIniciais={perguntas.map((p) => ({
        id: p.id,
        pergunta: p.pergunta,
        opcoes: (p.opcoes as string[] | null) ?? [],
      }))}
    />
  );
}
