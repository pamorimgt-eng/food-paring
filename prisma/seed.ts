import { PrismaClient } from "@prisma/client";
import { createHmac } from "crypto";

const prisma = new PrismaClient();

// Duplicado de lib/auth.ts de propósito: aquele ficheiro importa "next/headers",
// que não faz sentido carregar num script standalone corrido com tsx.
const SEGREDO = process.env.SESSAO_SEGREDO ?? "alfa-nao-usar-em-producao";
function calcularHashPin(pin: string): string {
  return createHmac("sha256", SEGREDO).update(pin).digest("hex");
}

/**
 * Um restaurante de demonstração com mesas e funcionários já criados, para
 * testar sala/cozinha/backoffice sem configurar nada primeiro. Os PINs
 * abaixo são só para a demo — na gestão de funcionários do backoffice
 * define-se um novo para cada pessoa real.
 */
async function main() {
  const restaurante = await prisma.restaurante.upsert({
    where: { slug: "demo" },
    update: {},
    create: { nome: "Tasca do Demo", slug: "demo" },
  });

  const FUNCIONARIOS = [
    { nome: "Gerente", email: "gerente@demo.pt", papel: "ADMIN" as const, pin: "1234" },
    { nome: "Empregado", email: "sala@demo.pt", papel: "SALA" as const, pin: "1111" },
    { nome: "Cozinha", email: "cozinha@demo.pt", papel: "COZINHA" as const, pin: "2222" },
  ];

  for (const f of FUNCIONARIOS) {
    await prisma.utilizador.upsert({
      where: { restauranteId_email: { restauranteId: restaurante.id, email: f.email } },
      update: { pinHash: calcularHashPin(f.pin) },
      create: {
        restauranteId: restaurante.id,
        nome: f.nome,
        email: f.email,
        papel: f.papel,
        pinHash: calcularHashPin(f.pin),
      },
    });
  }

  for (const numero of ["1", "2", "3", "4", "5", "6"]) {
    await prisma.mesa.upsert({
      where: { restauranteId_numero: { restauranteId: restaurante.id, numero } },
      update: {},
      create: { restauranteId: restaurante.id, numero, capacidade: 4 },
    });
  }

  console.log(`Restaurante "demo" pronto (id ${restaurante.id}).`);
  console.log("PINs: Backoffice 1234 · Sala 1111 · Cozinha 2222");
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
