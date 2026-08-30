import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Um restaurante de demonstração com mesas já criadas, para poder testar a
 * sala e a cozinha sem ter de configurar nada primeiro. Pratos e vinhos
 * entram pelo backoffice (foto ou "Adicionar referência") — é esse o fluxo
 * que queremos exercitar.
 */
async function main() {
  const restaurante = await prisma.restaurante.upsert({
    where: { slug: "demo" },
    update: {},
    create: { nome: "Tasca do Demo", slug: "demo" },
  });

  await prisma.utilizador.upsert({
    where: { restauranteId_email: { restauranteId: restaurante.id, email: "gerente@demo.pt" } },
    update: {},
    create: {
      restauranteId: restaurante.id,
      nome: "Gerente",
      email: "gerente@demo.pt",
      papel: "ADMIN",
    },
  });

  for (const numero of ["1", "2", "3", "4", "5", "6"]) {
    await prisma.mesa.upsert({
      where: { restauranteId_numero: { restauranteId: restaurante.id, numero } },
      update: {},
      create: { restauranteId: restaurante.id, numero, capacidade: 4 },
    });
  }

  console.log(`Restaurante "demo" pronto (id ${restaurante.id}).`);
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
