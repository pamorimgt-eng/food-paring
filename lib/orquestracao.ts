import { prisma } from "./prisma";
import { analisarPrato, investigarVinho, perguntasParaVinho } from "./ia/enriquecimento";
import { gerarPairingsDoPrato, type VinhoParaPairing } from "./ia/pairing";
import type { TAtributosPrato } from "./ia/esquemas";

/**
 * Analisa um prato e guarda os atributos. Chamado depois de o prato ser
 * criado — por confirmação de foto ou por "Adicionar referência".
 */
export async function enriquecerPrato(pratoId: string): Promise<void> {
  const prato = await prisma.prato.findUniqueOrThrow({ where: { id: pratoId } });
  const atributos = await analisarPrato({ nome: prato.nome, descricao: prato.descricao });
  await prisma.prato.update({
    where: { id: pratoId },
    data: { atributos, enriquecidoEm: new Date() },
  });
}

/**
 * Pesquisa a ficha técnica do vinho na web e guarda-a no catálogo partilhado.
 * O que não for confirmado por uma fonte vira uma pergunta ao gerente, em vez
 * de um palpite silencioso. Ver ARQUITETURA.md §2.
 */
export async function enriquecerVinho(cartaVinhoId: string): Promise<void> {
  const cartaVinho = await prisma.cartaVinho.findUniqueOrThrow({
    where: { id: cartaVinhoId },
    include: { vinho: true },
  });

  const ficha = await investigarVinho({
    nome: cartaVinho.vinho.nome,
    produtor: cartaVinho.vinho.produtor,
    ano: cartaVinho.vinho.ano,
    regiao: cartaVinho.vinho.regiao,
  });

  await prisma.vinhoCatalogo.update({
    where: { id: cartaVinho.vinhoCatalogoId },
    data: {
      castas: ficha.castas,
      regiao: ficha.regiao ?? cartaVinho.vinho.regiao,
      pais: ficha.pais,
      tipo: ficha.tipo,
      atributos: ficha.atributos,
      fontes: ficha.fontes,
      confianca: ficha.confianca,
      enriquecidoEm: new Date(),
    },
  });

  const perguntas = perguntasParaVinho(cartaVinho.vinho.nome, ficha.camposIncertos);
  for (const p of perguntas) {
    const jaExiste = await prisma.pergunta.findFirst({
      where: {
        restauranteId: cartaVinho.restauranteId,
        alvoTipo: "VINHO",
        alvoId: cartaVinho.vinhoCatalogoId,
        campo: p.campo,
        estado: "ABERTA",
      },
    });
    if (jaExiste) continue;

    await prisma.pergunta.create({
      data: {
        restauranteId: cartaVinho.restauranteId,
        alvoTipo: "VINHO",
        alvoId: cartaVinho.vinhoCatalogoId,
        campo: p.campo,
        pergunta: p.pergunta,
        opcoes: p.opcoes,
      },
    });
  }
}

/**
 * Regenera a matriz de pairing do restaurante inteiro. Corre depois de
 * qualquer alteração ao menu ou à carta — pratos ou vinhos novos, ou uma
 * pergunta respondida que mudou um atributo.
 *
 * À mesa isto nunca corre: é sempre um SELECT sobre o que aqui se gera.
 */
export async function regenerarPairings(restauranteId: string): Promise<void> {
  // Filtro "atributos preenchidos" feito em JS: o Prisma trata null em campos
  // Json de forma especial (Prisma.JsonNull vs. ausência de valor), pelo que
  // um filtro no WHERE aqui seria mais frágil do que este `!= null`.
  const [todosPratos, cartaVinhos] = await Promise.all([
    prisma.prato.findMany({ where: { restauranteId, disponivel: true } }),
    prisma.cartaVinho.findMany({
      where: { restauranteId, disponivel: true },
      include: { vinho: true },
    }),
  ]);
  const pratos = todosPratos.filter((p) => p.atributos != null);

  const vinhosProntos: VinhoParaPairing[] = cartaVinhos
    .filter((cv) => cv.vinho.atributos != null)
    .map((cv) => ({
      id: cv.id,
      nome: cv.vinho.nome,
      produtor: cv.vinho.produtor,
      ano: cv.vinho.ano,
      regiao: cv.vinho.regiao,
      castas: cv.vinho.castas,
      tipo: cv.vinho.tipo,
      atributos: cv.vinho.atributos,
      preco: Number(cv.preco),
    }));

  if (vinhosProntos.length === 0) return;

  for (const prato of pratos) {
    if (!prato.atributos) continue;

    const resultado = await gerarPairingsDoPrato(
      {
        nome: prato.nome,
        descricao: prato.descricao,
        atributos: prato.atributos as unknown as TAtributosPrato,
      },
      vinhosProntos,
    );

    await prisma.$transaction([
      prisma.pairing.deleteMany({ where: { pratoId: prato.id } }),
      ...(resultado.pares.length > 0
        ? [
            prisma.pairing.createMany({
              data: resultado.pares.map((p) => ({
                pratoId: prato.id,
                cartaVinhoId: p.vinhoId,
                score: p.score,
                argumentos: p.argumentos,
              })),
            }),
          ]
        : []),
    ]);
  }
}

/**
 * Orquestra o ciclo completo depois de uma alteração ao menu ou à carta:
 * enriquece o que ainda não tem atributos e regenera o pairing.
 *
 * Corre de forma síncrona no pedido HTTP — para o volume de um onboarding
 * (dezenas de itens) é aceitável; para cargas maiores isto passaria para uma
 * fila em background.
 */
export async function sincronizarRestaurante(restauranteId: string): Promise<void> {
  const [pratosPorEnriquecer, vinhosPorEnriquecer] = await Promise.all([
    prisma.prato.findMany({
      where: { restauranteId, enriquecidoEm: null },
      select: { id: true },
    }),
    prisma.cartaVinho.findMany({
      where: { restauranteId, vinho: { enriquecidoEm: null } },
      select: { id: true },
    }),
  ]);

  for (const { id } of pratosPorEnriquecer) {
    await enriquecerPrato(id);
  }
  for (const { id } of vinhosPorEnriquecer) {
    await enriquecerVinho(id);
  }

  await regenerarPairings(restauranteId);
}
