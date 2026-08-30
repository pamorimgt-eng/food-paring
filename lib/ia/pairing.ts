import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { claude, EFEITO_INGESTAO, MODELO } from "./cliente";
import {
  ResultadoPairing,
  type TAtributosPrato,
  type TResultadoPairing,
} from "./esquemas";

export type VinhoParaPairing = {
  /** Id da linha em carta_vinhos. */
  id: string;
  nome: string;
  produtor?: string | null;
  ano?: number | null;
  regiao?: string | null;
  castas: string[];
  tipo: string | null;
  atributos: unknown;
  preco: number;
};

const INSTRUCOES = `
És um escanção a preparar argumentos para empregados de mesa que não percebem
de vinho.

Para cada vinho que valha a pena sugerir, dá:
- um score de 0 a 100 para a harmonização com o prato;
- 2 a 3 argumentos curtos, prontos a dizer ao cliente.

Os argumentos:
- explicam PORQUÊ funciona com este prato ("a acidez corta a gordura do
  bacalhau"), nunca elogios genéricos ("um excelente vinho");
- usam linguagem de quem está à mesa, sem jargão de prova;
- só afirmam o que consta da ficha do vinho. Se a ficha não diz que estagiou em
  barrica, não menciones barrica. Um argumento errado dito a um cliente que
  percebe de vinho custa a venda e a credibilidade.

Devolve apenas vinhos com score >= 50. Se nenhum servir, devolve lista vazia.
`.trim();

/**
 * Gera a linha da matriz para um prato contra a carta toda.
 *
 * Corre em background depois do enriquecimento, nunca durante o serviço: à
 * mesa isto já é só um SELECT. Ver ARQUITETURA.md §1.
 */
export async function gerarPairingsDoPrato(
  prato: { nome: string; descricao?: string | null; atributos: TAtributosPrato },
  vinhos: VinhoParaPairing[],
): Promise<TResultadoPairing> {
  if (vinhos.length === 0) return { pares: [] };

  // A carta é igual para todos os pratos do restaurante: fica em cache e só o
  // bloco do prato varia. Ordenada por id para o prefixo ser byte-a-byte
  // estável entre chamadas — sem isso, o cache nunca acertava.
  const carta = [...vinhos]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((v) =>
      JSON.stringify({
        id: v.id,
        nome: v.nome,
        produtor: v.produtor,
        ano: v.ano,
        regiao: v.regiao,
        castas: v.castas,
        tipo: v.tipo,
        atributos: v.atributos,
      }),
    )
    .join("\n");

  const resposta = await claude.messages.parse({
    model: MODELO,
    max_tokens: 16000,
    system: [
      { type: "text", text: INSTRUCOES },
      {
        type: "text",
        text: `Carta de vinhos desta casa:\n${carta}`,
        cache_control: { type: "ephemeral" },
      },
    ],
    output_config: {
      format: zodOutputFormat(ResultadoPairing),
      effort: EFEITO_INGESTAO,
    },
    messages: [
      {
        role: "user",
        content: `Prato: ${prato.nome}${
          prato.descricao ? `\nDescrição: ${prato.descricao}` : ""
        }\nAnálise: ${JSON.stringify(prato.atributos)}`,
      },
    ],
  });

  if (!resposta.parsed_output) {
    throw new Error(`Não foi possível gerar pairings para "${prato.nome}".`);
  }

  // O modelo pode devolver um id que não existe na carta; nunca gravar isso.
  const idsValidos = new Set(vinhos.map((v) => v.id));
  return {
    pares: resposta.parsed_output.pares.filter((p) => idsValidos.has(p.vinhoId)),
  };
}
