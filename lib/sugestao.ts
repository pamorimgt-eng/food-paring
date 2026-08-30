import { prisma } from "./prisma";

export type Banda = "ECONOMICO" | "MEDIO" | "PREMIUM";

export type Sugestao = {
  banda: Banda;
  cartaVinhoId: string;
  nome: string;
  produtor: string | null;
  ano: number | null;
  preco: number;
  score: number;
  argumentos: string[];
};

export type ResultadoSugestao = {
  sugestoes: Sugestao[];
  /** Mostrado ao empregado quando a mesa não tem um vinho único que sirva. */
  aviso: string | null;
};

const ORDEM_INTENSIDADE = { leve: 0, media: 1, intensa: 2 } as const;

function intensidade(atributos: unknown): number {
  const valor = (atributos as { intensidade?: string } | null)?.intensidade;
  return ORDEM_INTENSIDADE[valor as keyof typeof ORDEM_INTENSIDADE] ?? 1;
}

function proteinas(atributos: unknown): string[] {
  return (atributos as { proteinas?: string[] } | null)?.proteinas ?? [];
}

const PEIXE = /peixe|bacalhau|polvo|lula|camar|marisc|amêijoa|ameijoa|sardinh|robalo|dourada|atum/i;
const CARNE = /vaca|novilho|vitela|porco|cordeiro|borrego|cabrito|pato|frango|coelho|javali|alheira/i;

/**
 * Uma mesa com peixe e carne não tem um vinho único que sirva bem os dois.
 * Vale mais dizê-lo ao empregado do que fingir que há uma resposta certa.
 */
function detetarMesaDividida(listaProteinas: string[][]): boolean {
  const texto = listaProteinas.flat().join(" ");
  return PEIXE.test(texto) && CARNE.test(texto);
}

/**
 * Sugere 3 vinhos para os pratos de uma mesa.
 *
 * Consulta a matriz já calculada: instantâneo, sem custo por pedido e sempre
 * igual para o mesmo prato. Toda a IA aconteceu no carregamento.
 */
export async function sugerirVinhos(
  restauranteId: string,
  pratoIds: string[],
): Promise<ResultadoSugestao> {
  if (pratoIds.length === 0) return { sugestoes: [], aviso: null };

  const pratos = await prisma.prato.findMany({
    where: { id: { in: pratoIds }, restauranteId },
    select: { id: true, atributos: true },
  });
  if (pratos.length === 0) return { sugestoes: [], aviso: null };

  // O prato mais intenso manda: um tinto encorpado arruína o peixe grelhado,
  // mas um branco leve não aguenta o pato.
  const dominante = pratos.reduce((a, b) =>
    intensidade(b.atributos) > intensidade(a.atributos) ? b : a,
  );

  const dividida = detetarMesaDividida(pratos.map((p) => proteinas(p.atributos)));

  const candidatos = await prisma.pairing.findMany({
    where: {
      pratoId: dominante.id,
      cartaVinho: { restauranteId, disponivel: true, stock: { gt: 0 } },
    },
    orderBy: { score: "desc" },
    include: {
      cartaVinho: {
        select: {
          id: true,
          preco: true,
          vinho: { select: { nome: true, produtor: true, ano: true } },
        },
      },
    },
  });

  if (candidatos.length === 0) {
    return {
      sugestoes: [],
      aviso: dividida ? avisoMesaDividida() : null,
    };
  }

  // As bandas são relativas a esta carta: 30 € é premium numa casa e económico
  // noutra. Tercis sobre os candidatos, calculados agora e não guardados.
  const precos = candidatos
    .map((c) => Number(c.cartaVinho.preco))
    .sort((a, b) => a - b);
  const p33 = precos[Math.floor(precos.length / 3)];
  const p66 = precos[Math.floor((precos.length * 2) / 3)];

  const bandaDe = (preco: number): Banda =>
    preco <= p33 ? "ECONOMICO" : preco <= p66 ? "MEDIO" : "PREMIUM";

  // O melhor de cada banda — já vêm ordenados por score.
  const escolhidos = new Map<Banda, (typeof candidatos)[number]>();
  for (const c of candidatos) {
    const banda = bandaDe(Number(c.cartaVinho.preco));
    if (!escolhidos.has(banda)) escolhidos.set(banda, c);
  }

  const ordem: Banda[] = ["ECONOMICO", "MEDIO", "PREMIUM"];
  const sugestoes = ordem.flatMap((banda) => {
    const c = escolhidos.get(banda);
    if (!c) return [];
    return [
      {
        banda,
        cartaVinhoId: c.cartaVinho.id,
        nome: c.cartaVinho.vinho.nome,
        produtor: c.cartaVinho.vinho.produtor,
        ano: c.cartaVinho.vinho.ano,
        preco: Number(c.cartaVinho.preco),
        score: c.score,
        argumentos: (c.argumentos as string[]) ?? [],
      },
    ];
  });

  return { sugestoes, aviso: dividida ? avisoMesaDividida() : null };
}

function avisoMesaDividida(): string {
  return (
    "Esta mesa tem peixe e carne. Sugere duas garrafas (um branco e um tinto) " +
    "ou pergunta ao cliente qual dos pratos quer acompanhar."
  );
}
