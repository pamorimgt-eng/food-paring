import { z } from "zod";

// ---------------------------------------------------------------------------
// Extração a partir de foto da carta
// ---------------------------------------------------------------------------

export const PratoExtraido = z.object({
  nome: z.string(),
  descricao: z.string().nullable(),
  seccao: z.string().nullable().describe("Entradas, principais, sobremesas..."),
  preco: z.number().nullable(),
  /// Marcado quando a foto está ilegível nesse ponto. O ecrã de revisão
  /// destaca estes itens primeiro.
  incerto: z.boolean(),
});

export const MenuExtraido = z.object({
  pratos: z.array(PratoExtraido),
  /// Avisos para mostrar ao gerente: "coluna direita cortada", "preços ilegíveis".
  avisos: z.array(z.string()),
});

export const VinhoExtraido = z.object({
  nome: z.string(),
  produtor: z.string().nullable(),
  ano: z.number().int().nullable(),
  regiao: z.string().nullable(),
  preco: z.number().nullable(),
  incerto: z.boolean(),
});

export const CartaVinhosExtraida = z.object({
  vinhos: z.array(VinhoExtraido),
  avisos: z.array(z.string()),
});

// ---------------------------------------------------------------------------
// Enriquecimento — análise do prato
// ---------------------------------------------------------------------------

const Nivel = z.enum(["baixa", "media", "alta"]);

export const AtributosPrato = z.object({
  proteinas: z.array(z.string()).describe("bacalhau, pato, novilho, grão..."),
  metodosConfecao: z.array(z.string()).describe("grelhado, estufado, frito..."),
  condimentos: z.array(z.string()).describe("alho, coentros, pimentão, açafrão..."),
  intensidade: z.enum(["leve", "media", "intensa"]),
  gordura: Nivel,
  acidez: Nivel,
  picante: z.enum(["nenhum", "ligeiro", "medio", "intenso"]),
  doce: z.enum(["nenhum", "ligeiro", "medio", "alto"]),
  textura: z.string().describe("macia, estaladiça, cremosa, fibrosa..."),
  notas: z.string().describe("Uma frase sobre o que define o prato à boca."),
});

// ---------------------------------------------------------------------------
// Enriquecimento — ficha técnica do vinho
// ---------------------------------------------------------------------------

export const AtributosVinho = z.object({
  corpo: z.enum(["leve", "medio", "encorpado"]),
  acidez: Nivel,
  taninos: z
    .enum(["baixos", "medios", "altos", "nao_aplicavel"])
    .describe("nao_aplicavel em brancos e espumantes"),
  doceza: z.enum(["seco", "meio_seco", "meio_doce", "doce"]),
  estagioBarrica: z.boolean().nullable(),
  mesesBarrica: z.number().int().nullable(),
  teorAlcoolico: z.number().nullable(),
  perfilAromatico: z.array(z.string()),
  temperaturaServico: z.string().nullable(),
  notas: z.string(),
});

export const FichaVinho = z.object({
  castas: z.array(z.string()),
  regiao: z.string().nullable(),
  pais: z.string().nullable(),
  tipo: z
    .enum(["TINTO", "BRANCO", "ROSE", "ESPUMANTE", "FORTIFICADO", "LARANJA"])
    .nullable()
    .describe("null apenas se genuinamente não for possível determinar."),
  atributos: AtributosVinho,
  /// URLs consultados, para o gerente poder verificar o que foi afirmado.
  fontes: z.array(z.string()),
  confianca: z.enum(["ALTA", "MEDIA", "BAIXA"]),
  /// Campos que a pesquisa não conseguiu confirmar. Cada um vira uma pergunta
  /// curta ao gerente — nunca um palpite silencioso. Ver ARQUITETURA.md §2.
  camposIncertos: z.array(z.string()),
});

// ---------------------------------------------------------------------------
// Pairing
// ---------------------------------------------------------------------------

export const ParPratoVinho = z.object({
  vinhoId: z.string(),
  score: z.number().int().min(0).max(100),
  /// 2 a 3 frases curtas, prontas a dizer ao cliente. Sem jargão.
  argumentos: z.array(z.string()).min(2).max(3),
});

export const ResultadoPairing = z.object({
  pares: z.array(ParPratoVinho),
});

export type TMenuExtraido = z.infer<typeof MenuExtraido>;
export type TCartaVinhosExtraida = z.infer<typeof CartaVinhosExtraida>;
export type TAtributosPrato = z.infer<typeof AtributosPrato>;
export type TFichaVinho = z.infer<typeof FichaVinho>;
export type TResultadoPairing = z.infer<typeof ResultadoPairing>;
