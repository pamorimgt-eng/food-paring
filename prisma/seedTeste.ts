import { PrismaClient } from "@prisma/client";
import { sincronizarRestaurante } from "../lib/orquestracao";

const prisma = new PrismaClient();

/**
 * Menu e carta de teste para a versão alfa — só para exercitar o produto
 * com dados variados (proteínas, gorduras, intensidades diferentes) e ver o
 * motor de pairing a trabalhar em condições realistas. Não é o seed base
 * (prisma/seed.ts): corre à parte, sob pedido.
 */
const PRATOS = [
  { nome: "Bacalhau à Lagareiro", seccao: "Principais", preco: 18.5 },
  { nome: "Polvo à Lagareiro", seccao: "Principais", preco: 21.0 },
  { nome: "Robalo Grelhado com Legumes", seccao: "Principais", preco: 19.5 },
  { nome: "Francesinha", seccao: "Principais", preco: 12.5 },
  { nome: "Cabrito Assado no Forno", seccao: "Principais", preco: 20.0 },
  { nome: "Salada de Polvo", seccao: "Entradas", preco: 14.0 },
  { nome: "Queijo da Serra com Compota", seccao: "Entradas", preco: 9.5 },
];

const VINHOS = [
  { nome: "Vinho Verde", produtor: "Casa de Vila Verde", ano: 2022, preco: 14.0 },
  { nome: "Alvarinho", produtor: "Quinta da Aveleda", ano: 2022, preco: 19.0 },
  { nome: "Reserva Branco", produtor: "Esporão", ano: 2021, preco: 24.0 },
  { nome: "Vinha da Defesa", produtor: "Herdade do Esporão", ano: 2020, preco: 22.0 },
  { nome: "LBV", produtor: "Taylor's", ano: 2018, preco: 26.0 },
];

async function main() {
  const restaurante = await prisma.restaurante.findUniqueOrThrow({
    where: { slug: "demo" },
  });

  for (const p of PRATOS) {
    const existe = await prisma.prato.findFirst({
      where: { restauranteId: restaurante.id, nome: p.nome },
    });
    if (existe) continue;
    await prisma.prato.create({
      data: { restauranteId: restaurante.id, ...p, origem: "MANUAL" },
    });
    console.log(`+ prato: ${p.nome}`);
  }

  for (const v of VINHOS) {
    let vinhoCatalogo = await prisma.vinhoCatalogo.findFirst({
      where: { nome: v.nome, produtor: v.produtor, ano: v.ano },
    });
    if (!vinhoCatalogo) {
      vinhoCatalogo = await prisma.vinhoCatalogo.create({
        data: { nome: v.nome, produtor: v.produtor, ano: v.ano, castas: [] },
      });
    }
    const jaNaCarta = await prisma.cartaVinho.findFirst({
      where: { restauranteId: restaurante.id, vinhoCatalogoId: vinhoCatalogo.id },
    });
    if (jaNaCarta) continue;
    await prisma.cartaVinho.create({
      data: {
        restauranteId: restaurante.id,
        vinhoCatalogoId: vinhoCatalogo.id,
        preco: v.preco,
        stock: 12,
        origem: "MANUAL",
      },
    });
    console.log(`+ vinho: ${v.produtor} ${v.nome} ${v.ano}`);
  }

  console.log("A enriquecer e a gerar o pairing — isto demora vários minutos...");
  await sincronizarRestaurante(restaurante.id);
  console.log("Concluído.");
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
