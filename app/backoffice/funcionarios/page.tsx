import { getRestauranteAtual } from "@/lib/restaurante";
import { prisma } from "@/lib/prisma";
import { exigirPapel } from "@/lib/auth";
import { FuncionariosBackoffice } from "./FuncionariosBackoffice";

export const dynamic = "force-dynamic";

export default async function FuncionariosPage() {
  await exigirPapel(["ADMIN"]);
  const restaurante = await getRestauranteAtual();
  const funcionarios = await prisma.utilizador.findMany({
    where: { restauranteId: restaurante.id },
    orderBy: { criadoEm: "asc" },
  });

  return (
    <FuncionariosBackoffice
      restauranteId={restaurante.id}
      funcionariosIniciais={funcionarios.map((f) => ({
        id: f.id,
        nome: f.nome,
        papel: f.papel,
        temPin: f.pinHash != null,
      }))}
    />
  );
}
