import { prisma } from "./prisma";

/**
 * Esta primeira versão fixa-se num único restaurante de demonstração — ainda
 * não há login. A entrada por PIN descrita em ARQUITETURA.md §3.5 é o próximo
 * passo; por agora todas as páginas partem daqui.
 */
export async function getRestauranteAtual() {
  return prisma.restaurante.findUniqueOrThrow({ where: { slug: "demo" } });
}
