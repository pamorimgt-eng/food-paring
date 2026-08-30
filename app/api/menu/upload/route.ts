import { NextResponse } from "next/server";
import { extrairMenu } from "@/lib/ia/extracao";
import { prisma } from "@/lib/prisma";
import { ehMediaTypeAceite, guardarImagem } from "@/lib/uploads";

export const maxDuration = 60;

/**
 * Recebe a foto do menu, guarda-a e devolve o que a IA leu — para revisão,
 * nunca gravado diretamente. Ver ARQUITETURA.md §2.
 */
export async function POST(request: Request) {
  const form = await request.formData();
  const restauranteId = form.get("restauranteId");
  const ficheiro = form.get("ficheiro");

  if (typeof restauranteId !== "string" || !(ficheiro instanceof File)) {
    return NextResponse.json({ erro: "Falta o restaurante ou o ficheiro." }, { status: 400 });
  }
  if (!ehMediaTypeAceite(ficheiro.type)) {
    return NextResponse.json({ erro: "Formato de imagem não suportado." }, { status: 400 });
  }

  const base64 = Buffer.from(await ficheiro.arrayBuffer()).toString("base64");
  const imagemUrl = await guardarImagem(restauranteId, base64, ficheiro.type);

  const upload = await prisma.cartaUpload.create({
    data: { restauranteId, tipo: "MENU", imagemUrl, estado: "PROCESSANDO" },
  });

  try {
    const extraido = await extrairMenu({ base64, mediaType: ficheiro.type });
    await prisma.cartaUpload.update({
      where: { id: upload.id },
      data: { estado: "REVISAO", extraido },
    });
    return NextResponse.json({ uploadId: upload.id, extraido });
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : "Erro desconhecido.";
    await prisma.cartaUpload.update({
      where: { id: upload.id },
      data: { estado: "ERRO", erro: mensagem },
    });
    return NextResponse.json({ erro: mensagem }, { status: 502 });
  }
}
