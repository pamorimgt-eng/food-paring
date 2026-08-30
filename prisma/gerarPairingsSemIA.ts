import { PrismaClient } from "@prisma/client";
import { regenerarPairingsSemIA } from "../lib/orquestracao";

const prisma = new PrismaClient();

/**
 * Preenche a matriz de pairing com o motor de regras (sem IA) — útil quando
 * não há crédito/chave disponível. Não substitui o enriquecimento por IA dos
 * pratos e vinhos, que já tem de estar feito antes de correr isto.
 */
async function main() {
  const restaurante = await prisma.restaurante.findUniqueOrThrow({ where: { slug: "demo" } });
  await regenerarPairingsSemIA(restaurante.id);
  console.log("Pairing (sem IA) gerado.");
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
