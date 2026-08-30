const TIPO_POR_TEXTO: Record<string, string> = {
  tinto: "TINTO",
  branco: "BRANCO",
  rosé: "ROSE",
  rose: "ROSE",
  espumante: "ESPUMANTE",
  fortificado: "FORTIFICADO",
  laranja: "LARANJA",
};

const VALOR_POR_TEXTO: Record<string, string> = {
  leve: "leve",
  médio: "medio",
  medio: "medio",
  encorpado: "encorpado",
  baixos: "baixos",
  médios: "medios",
  medios: "medios",
  altos: "altos",
  baixa: "baixa",
  média: "media",
  alta: "alta",
  seco: "seco",
  "meio-seco": "meio_seco",
  "meio-doce": "meio_doce",
  doce: "doce",
  sim: "true",
  não: "false",
  nao: "false",
};

export type EfeitoResposta =
  | { tipo: "ignorar" }
  | { tipo: "atualizarTipoVinho"; valor: string }
  | { tipo: "atualizarCastas"; valor: string[] }
  | { tipo: "atualizarAtributo"; campo: string; valor: unknown };

/**
 * Traduz a resposta do gerente (texto curto, escolhido de poucas opções ou
 * escrito à mão) para uma alteração concreta na ficha do vinho.
 *
 * "Não sei" nunca é tratado como erro — é sempre um resultado válido que
 * apenas deixa de preencher o campo. Ver ARQUITETURA.md §2.
 */
export function interpretarResposta(campo: string, resposta: string): EfeitoResposta {
  const normalizado = resposta.trim().toLowerCase();
  if (normalizado === "não sei" || normalizado === "nao sei" || normalizado === "") {
    return { tipo: "ignorar" };
  }

  if (campo === "tipo") {
    const valor = TIPO_POR_TEXTO[normalizado];
    return valor ? { tipo: "atualizarTipoVinho", valor } : { tipo: "ignorar" };
  }

  if (campo === "castas") {
    const castas = resposta
      .split(/[,;]/)
      .map((c) => c.trim())
      .filter(Boolean);
    return castas.length > 0 ? { tipo: "atualizarCastas", valor: castas } : { tipo: "ignorar" };
  }

  if (campo === "teorAlcoolico") {
    const valor = Number.parseFloat(normalizado.replace(",", "."));
    return Number.isFinite(valor) ? { tipo: "atualizarAtributo", campo, valor } : { tipo: "ignorar" };
  }

  if (campo === "estagioBarrica") {
    const valor = VALOR_POR_TEXTO[normalizado];
    return valor ? { tipo: "atualizarAtributo", campo, valor: valor === "true" } : { tipo: "ignorar" };
  }

  const valor = VALOR_POR_TEXTO[normalizado];
  return valor ? { tipo: "atualizarAtributo", campo, valor } : { tipo: "ignorar" };
}
