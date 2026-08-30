import type { TAtributosPrato } from "./ia/esquemas";
import type { VinhoParaPairing } from "./ia/pairing";

export type ParRegra = { vinhoId: string; score: number; argumentos: string[] };

const PEIXE = /peixe|bacalhau|polvo|lula|camar|marisc|amêijoa|ameijoa|sardinh|robalo|dourada|atum/i;
const CARNE = /vaca|novilho|vitela|porco|cordeiro|borrego|cabrito|pato|frango|coelho|javali|alheira|secretos|lagarto|pluma|bife/i;
const QUEIJO = /queijo/i;

type AtributosVinho = {
  corpo?: "leve" | "medio" | "encorpado";
  acidez?: "baixa" | "media" | "alta";
  taninos?: "baixos" | "medios" | "altos" | "nao_aplicavel";
  doceza?: "seco" | "meio_seco" | "meio_doce" | "doce";
  estagioBarrica?: boolean | null;
};

/**
 * Pairing determinístico, sem IA — usa os atributos que a análise por IA já
 * gravou (ARQUITETURA.md §1: enriquecimento e serviço são fases separadas).
 * Serve de fallback quando não há crédito ou chave disponível: mais rígido
 * que o motor por IA, mas não depende de nenhuma chamada externa.
 */
export function pontuarParRegras(
  nomePrato: string,
  atributosPrato: TAtributosPrato,
  vinho: VinhoParaPairing,
): ParRegra {
  const av = (vinho.atributos as AtributosVinho | null) ?? {};
  const tipo = vinho.tipo;
  const textoProteinas = atributosPrato.proteinas.join(" ") + " " + nomePrato;
  const ehPeixe = PEIXE.test(textoProteinas);
  const ehCarne = CARNE.test(textoProteinas);
  const ehQueijo = QUEIJO.test(nomePrato);

  let score = 50;
  const motivos: string[] = [];

  // Peixe/marisco vs. tipo e corpo do vinho. Um tinto de corpo médio não é
  // erro tão óbvio como um encorpado, mas ainda assim não é a escolha certa
  // — só um tinto muito leve escapa à penalização.
  if (ehPeixe) {
    if (tipo === "TINTO" && av.corpo === "leve") {
      score += 20;
      motivos.push("A leveza do vinho não ofusca o peixe.");
    } else if (tipo === "TINTO") {
      score -= av.corpo === "encorpado" ? 30 : 20;
    } else if (tipo === "BRANCO" || tipo === "ESPUMANTE") {
      score += 20;
      motivos.push("A leveza do vinho não ofusca o peixe.");
    }
  }

  // Carne vs. corpo do vinho. Um branco com carne vermelha intensa é o erro
  // clássico a evitar — mesmo um branco encorpado não substitui a estrutura
  // de um tinto para cabrito, borrego ou vaca.
  if (ehCarne && !ehPeixe) {
    if (atributosPrato.intensidade === "intensa" && tipo === "TINTO" && av.corpo === "encorpado") {
      score += 20;
      motivos.push("O corpo encorpado do tinto acompanha a intensidade da carne.");
    } else if (tipo === "BRANCO" || tipo === "ESPUMANTE") {
      score -= atributosPrato.intensidade === "intensa" ? 25 : 15;
    }
  }

  // Intensidade do prato vs. corpo do vinho.
  const escalaIntensidade = { leve: 0, media: 1, intensa: 2 } as const;
  const escalaCorpo = { leve: 0, medio: 1, encorpado: 2 } as const;
  if (av.corpo) {
    const diferenca = Math.abs(
      escalaIntensidade[atributosPrato.intensidade] - escalaCorpo[av.corpo],
    );
    if (diferenca === 0) {
      score += 12;
      motivos.push("O corpo do vinho está equilibrado com a intensidade do prato.");
    } else if (diferenca === 2) {
      score -= 15;
    }
  }

  // Gordura do prato vs. acidez do vinho.
  if (atributosPrato.gordura === "alta") {
    if (av.acidez === "alta") {
      score += 15;
      motivos.push("A acidez do vinho corta a gordura do prato.");
    } else if (av.acidez === "baixa") {
      score -= 10;
    }
  }

  // Picante vs. taninos e doçura.
  if (atributosPrato.picante === "medio" || atributosPrato.picante === "intenso") {
    if (av.taninos === "altos") {
      score -= 15;
    }
    if (av.doceza === "meio_doce" || av.doceza === "doce") {
      score += 10;
      motivos.push("Um toque de doçura equilibra o picante do prato.");
    }
  }

  // Prato doce (sobremesa) vs. doçura do vinho.
  if (atributosPrato.doce === "alto") {
    if (av.doceza === "doce" || av.doceza === "meio_doce" || tipo === "FORTIFICADO") {
      score += 20;
      motivos.push("A doçura do vinho acompanha a sobremesa sem desequilibrar.");
    } else if (av.doceza === "seco") {
      score -= 15;
    }
  }

  // Queijo — combinação clássica com fortificados. Fora de queijo ou
  // sobremesa, um fortificado (tipicamente doce) não serve um prato salgado
  // comum — sem esta exceção, ficava a competir com tintos e brancos em pé
  // de igualdade só por ter estágio em barrica.
  if (ehQueijo && tipo === "FORTIFICADO") {
    score += 15;
    motivos.push("Vinho fortificado é a combinação clássica com queijo.");
  } else if (tipo === "FORTIFICADO" && atributosPrato.doce === "nenhum" && !ehQueijo) {
    score -= 25;
  }

  // Estágio em barrica acompanha untuosidade.
  if (av.estagioBarrica && (atributosPrato.intensidade === "intensa" || atributosPrato.gordura === "alta")) {
    score += 10;
    motivos.push("O estágio em barrica acompanha a untuosidade do prato.");
  }

  score = Math.max(0, Math.min(100, score));

  if (motivos.length < 2) {
    motivos.push(
      `${vinho.nome}${vinho.regiao ? ` (${vinho.regiao})` : ""} é uma escolha segura e equilibrada para este prato.`,
    );
  }

  return { vinhoId: vinho.id, score, argumentos: motivos.slice(0, 3) };
}

/** Aplica pontuarParRegras a toda a carta e devolve só os pares acima do limiar. */
export function gerarParesSemIA(
  nomePrato: string,
  atributosPrato: TAtributosPrato,
  vinhos: VinhoParaPairing[],
): ParRegra[] {
  return vinhos
    .map((v) => pontuarParRegras(nomePrato, atributosPrato, v))
    .filter((p) => p.score >= 50)
    .sort((a, b) => b.score - a.score);
}
