import Anthropic from "@anthropic-ai/sdk";

if (!process.env.ANTHROPIC_API_KEY) {
  // Falha cedo e com uma mensagem clara, em vez de um 401 opaco a meio de um
  // enriquecimento já a decorrer.
  console.warn(
    "[ia] ANTHROPIC_API_KEY não está definida — a ingestão e o enriquecimento vão falhar.",
  );
}

/**
 * Cliente Claude. Só é usado do lado do servidor: a chave nunca chega ao
 * browser (ver `serverExternalPackages` em next.config.ts).
 */
export const claude = new Anthropic();

export const MODELO = "claude-opus-5";

/**
 * Todo o trabalho de IA acontece no carregamento, nunca no serviço à mesa.
 * Ver ARQUITETURA.md §1.
 */
export const EFEITO_INGESTAO = "high" as const;
