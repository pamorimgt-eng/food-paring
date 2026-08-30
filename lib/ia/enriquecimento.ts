import type Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { claude, EFEITO_INGESTAO, MODELO } from "./cliente";
import {
  AtributosPrato,
  FichaVinho,
  type TAtributosPrato,
  type TFichaVinho,
} from "./esquemas";

// ---------------------------------------------------------------------------
// Pratos
// ---------------------------------------------------------------------------

const ANALISE_PRATO = `
És um chef que descreve pratos portugueses em termos úteis para harmonizar vinho.

Analisa a composição: proteína, gordura, método de confeção, condimentos,
acidez, picante, doçura e textura. Interessa o que o prato faz à boca, não a
receita.

Se o nome do prato for ambíguo, assume a versão tradicional portuguesa.
`.trim();

export async function analisarPrato(prato: {
  nome: string;
  descricao?: string | null;
}): Promise<TAtributosPrato> {
  const resposta = await claude.messages.parse({
    model: MODELO,
    max_tokens: 8000,
    system: ANALISE_PRATO,
    output_config: {
      format: zodOutputFormat(AtributosPrato),
      effort: EFEITO_INGESTAO,
    },
    messages: [
      {
        role: "user",
        content: prato.descricao
          ? `Prato: ${prato.nome}\nDescrição da carta: ${prato.descricao}`
          : `Prato: ${prato.nome}`,
      },
    ],
  });

  if (!resposta.parsed_output) {
    throw new Error(`Não foi possível analisar o prato "${prato.nome}".`);
  }
  return resposta.parsed_output;
}

// ---------------------------------------------------------------------------
// Vinhos — pesquisa web, depois estruturação
// ---------------------------------------------------------------------------

const PESQUISA_VINHO = `
Pesquisa a ficha técnica deste vinho em fontes fiáveis: site do produtor,
Comissões Vitivinícolas Regionais, revistas de vinho, lojas especializadas.

Regras rígidas:
- Relata apenas o que encontraste escrito. NÃO deduzas a partir da região ou
  das castas típicas.
- Para cada característica, diz onde a viste.
- Se não encontrares algo, diz explicitamente "não encontrado". Um argumento de
  venda factualmente errado é pior do que um argumento em falta.
- Indica claramente se encontraste o vinho e a colheita exatos, ou apenas o
  produtor / outra colheita.
`.trim();

/**
 * Server tools podem devolver `pause_turn` a meio de uma pesquisa longa. Sem
 * isto, a resposta vinha truncada em silêncio — sem erro e sem aviso.
 */
async function pesquisarAteConcluir(
  params: Anthropic.MessageCreateParamsNonStreaming,
  maxRetomas = 4,
): Promise<Anthropic.Message> {
  const mensagens = [...params.messages];
  let resposta = await claude.messages.create({ ...params, messages: mensagens });

  for (let i = 0; i < maxRetomas && resposta.stop_reason === "pause_turn"; i++) {
    mensagens.push({ role: "assistant", content: resposta.content });
    resposta = await claude.messages.create({ ...params, messages: mensagens });
  }
  return resposta;
}

function textoDe(resposta: Anthropic.Message): string {
  return resposta.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}

export async function investigarVinho(vinho: {
  nome: string;
  produtor?: string | null;
  ano?: number | null;
  regiao?: string | null;
}): Promise<TFichaVinho> {
  const identificacao = [vinho.produtor, vinho.nome, vinho.ano, vinho.regiao]
    .filter(Boolean)
    .join(" ");

  // Passo 1 — pesquisa aberta, com fontes.
  const pesquisa = await pesquisarAteConcluir({
    model: MODELO,
    max_tokens: 16000,
    system: PESQUISA_VINHO,
    tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 6 }],
    messages: [{ role: "user", content: `Ficha técnica de: ${identificacao}` }],
  });

  // Passo 2 — estrutura o que foi encontrado. Entrada pequena, chamada barata.
  const ficha = await claude.messages.parse({
    model: MODELO,
    max_tokens: 8000,
    system:
      "Estrutura os resultados da pesquisa. Tudo o que não foi confirmado por " +
      "uma fonte entra em camposIncertos, e a confiança desce em conformidade. " +
      "Nunca preencher um campo por dedução.",
    output_config: {
      format: zodOutputFormat(FichaVinho),
      effort: EFEITO_INGESTAO,
    },
    messages: [
      {
        role: "user",
        content: `Vinho: ${identificacao}\n\nResultados da pesquisa:\n${textoDe(pesquisa)}`,
      },
    ],
  });

  if (!ficha.parsed_output) {
    throw new Error(`Não foi possível montar a ficha de "${identificacao}".`);
  }
  return ficha.parsed_output;
}

// ---------------------------------------------------------------------------
// Perguntas ao gerente
// ---------------------------------------------------------------------------

const PERGUNTAS_POR_CAMPO: Record<string, { pergunta: string; opcoes: string[] }> =
  {
    estagioBarrica: {
      pergunta: "estagiou em madeira?",
      opcoes: ["Sim", "Não", "Não sei"],
    },
    corpo: {
      pergunta: "como descreveria o corpo?",
      opcoes: ["Leve", "Médio", "Encorpado", "Não sei"],
    },
    taninos: {
      pergunta: "como são os taninos?",
      opcoes: ["Baixos", "Médios", "Altos", "Não sei"],
    },
    acidez: {
      pergunta: "como é a acidez?",
      opcoes: ["Baixa", "Média", "Alta", "Não sei"],
    },
    doceza: {
      pergunta: "é seco ou tem doçura?",
      opcoes: ["Seco", "Meio-seco", "Meio-doce", "Doce", "Não sei"],
    },
    castas: {
      pergunta: "que castas leva?",
      opcoes: [],
    },
    teorAlcoolico: {
      pergunta: "qual é o teor alcoólico?",
      opcoes: [],
    },
  };

/**
 * Transforma os campos por confirmar em perguntas curtas e humanas — em vez de
 * um formulário de doze campos, ou de um palpite silencioso.
 *
 * "Não sei" é sempre resposta válida: o vinho continua a ser sugerido, e os
 * argumentos é que evitam esse atributo.
 */
export function perguntasParaVinho(
  nomeVinho: string,
  camposIncertos: string[],
): { campo: string; pergunta: string; opcoes: string[] }[] {
  return camposIncertos
    .filter((campo) => campo in PERGUNTAS_POR_CAMPO)
    .map((campo) => {
      const { pergunta, opcoes } = PERGUNTAS_POR_CAMPO[campo];
      return {
        campo,
        pergunta: `${nomeVinho} — não encontrei se ${pergunta}`,
        opcoes,
      };
    });
}
