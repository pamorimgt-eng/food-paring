import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { claude, EFEITO_INGESTAO, MODELO } from "./cliente";
import {
  CartaVinhosExtraida,
  MenuExtraido,
  type TCartaVinhosExtraida,
  type TMenuExtraido,
} from "./esquemas";

/**
 * Nada do que sai daqui é gravado sem passar pelo ecrã de revisão. Cartas
 * reais têm caligrafia, colunas, reflexos e manchas — o `incerto` existe para
 * o gerente saber onde olhar primeiro.
 */
const REGRAS_LEITURA = `
És um assistente que lê cartas de restaurante em português de Portugal.

Regras:
- Transcreve exatamente o que está escrito. Não corrijas nem embelezes nomes.
- Não inventes itens. Se não consegues ler, marca "incerto": true.
- Não inventes preços. Preço ilegível é null, nunca um palpite.
- Ignora cabeçalhos, rodapés, moradas, horários e texto decorativo.
- Se a foto estiver cortada, tremida ou com reflexos, di-lo em "avisos".
`.trim();

function blocoImagem(imagemUrl: string) {
  return {
    type: "image" as const,
    source: { type: "url" as const, url: imagemUrl },
  };
}

/** Lê uma foto do menu e devolve os pratos, para revisão humana. */
export async function extrairMenu(imagemUrl: string): Promise<TMenuExtraido> {
  const resposta = await claude.messages.parse({
    model: MODELO,
    max_tokens: 16000,
    system: REGRAS_LEITURA,
    output_config: {
      format: zodOutputFormat(MenuExtraido),
      effort: EFEITO_INGESTAO,
    },
    messages: [
      {
        role: "user",
        content: [
          blocoImagem(imagemUrl),
          {
            type: "text",
            text: "Extrai todos os pratos desta carta, com secção e preço.",
          },
        ],
      },
    ],
  });

  if (!resposta.parsed_output) {
    throw new Error("Não foi possível ler a carta. Tenta uma foto mais nítida.");
  }
  return resposta.parsed_output;
}

/** Lê uma foto da carta de vinhos. A ficha técnica vem depois, no enriquecimento. */
export async function extrairCartaVinhos(
  imagemUrl: string,
): Promise<TCartaVinhosExtraida> {
  const resposta = await claude.messages.parse({
    model: MODELO,
    max_tokens: 16000,
    system: REGRAS_LEITURA,
    output_config: {
      format: zodOutputFormat(CartaVinhosExtraida),
      effort: EFEITO_INGESTAO,
    },
    messages: [
      {
        role: "user",
        content: [
          blocoImagem(imagemUrl),
          {
            type: "text",
            text:
              "Extrai todos os vinhos desta carta: nome, produtor, ano, região e preço. " +
              "Não deduzas castas nem características — isso é pesquisado depois.",
          },
        ],
      },
    ],
  });

  if (!resposta.parsed_output) {
    throw new Error(
      "Não foi possível ler a carta de vinhos. Tenta uma foto mais nítida.",
    );
  }
  return resposta.parsed_output;
}
