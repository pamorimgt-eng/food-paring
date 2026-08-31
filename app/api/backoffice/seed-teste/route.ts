import { NextResponse } from "next/server";
import { getRestauranteAtual } from "@/lib/restaurante";
import { semearMenuTeste } from "@/lib/dadosTeste";

export const maxDuration = 60;

/**
 * Popula o menu e a carta de teste sem passar pela IA (lib/dadosTeste.ts).
 * Existe para quando não há acesso a terminal/consola no servidor — chamar
 * isto diretamente substitui `npx tsx prisma/seedMenuCompleto.ts`.
 */
export async function POST() {
  const restaurante = await getRestauranteAtual();
  const resultado = await semearMenuTeste(restaurante.id);
  return NextResponse.json(resultado);
}
