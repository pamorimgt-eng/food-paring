import { NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { interpretarResposta } from "@/lib/ia/respostas";
import { regenerarPairings } from "@/lib/orquestracao";

const Corpo = z.object({ resposta: z.string() });

/**
 * Responde a uma pergunta em aberto. "Não sei" fecha a pergunta sem alterar
 * nada — o vinho continua a ser sugerido, só os argumentos evitam esse
 * atributo. Uma resposta concreta atualiza a ficha e regenera o pairing.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { resposta } = Corpo.parse(await request.json());

  const pergunta = await prisma.pergunta.findUniqueOrThrow({ where: { id } });
  const efeito = interpretarResposta(pergunta.campo, resposta);

  if (pergunta.alvoTipo === "VINHO") {
    const vinho = await prisma.vinhoCatalogo.findUnique({ where: { id: pergunta.alvoId } });
    if (vinho) {
      if (efeito.tipo === "atualizarTipoVinho") {
        await prisma.vinhoCatalogo.update({
          where: { id: vinho.id },
          data: { tipo: efeito.valor as never },
        });
      } else if (efeito.tipo === "atualizarCastas") {
        await prisma.vinhoCatalogo.update({
          where: { id: vinho.id },
          data: { castas: efeito.valor },
        });
      } else if (efeito.tipo === "atualizarAtributo") {
        const atributosAtuais = (vinho.atributos as Record<string, unknown>) ?? {};
        const atributosNovos = {
          ...atributosAtuais,
          [efeito.campo]: efeito.valor,
        } as Prisma.InputJsonValue;
        await prisma.vinhoCatalogo.update({
          where: { id: vinho.id },
          data: { atributos: atributosNovos },
        });
      }
    }
  }

  await prisma.pergunta.update({
    where: { id },
    data: {
      resposta,
      estado: efeito.tipo === "ignorar" ? "IGNORADA" : "RESPONDIDA",
      respondidoEm: new Date(),
    },
  });

  if (efeito.tipo !== "ignorar") {
    await regenerarPairings(pergunta.restauranteId);
  }

  return NextResponse.json({ ok: true });
}
