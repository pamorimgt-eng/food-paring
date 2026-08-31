import { PrismaClient } from "@prisma/client";
import { semearMenuTeste } from "../lib/dadosTeste";

const prisma = new PrismaClient();

/**
 * Menu e carta de teste, sem depender da IA (ver lib/dadosTeste.ts). Uso por
 * terminal — quando não houver acesso a terminal (ex: consola do Easypanel
 * indisponível), a mesma função corre via POST /api/backoffice/seed-teste.
 */
async function main() {
  const restaurante = await prisma.restaurante.findUniqueOrThrow({ where: { slug: "demo" } });
  console.log("A semear e a gerar o pairing pelo motor de regras (sem IA, instantâneo)...");
  const resultado = await semearMenuTeste(restaurante.id);
  console.log(`Concluído: +${resultado.pratosCriados} pratos, +${resultado.vinhosCriados} vinhos.`);
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
