import { NextResponse } from "next/server";
import { sugerirVinhos } from "@/lib/sugestao";

/**
 * Consulta a matriz de pairing já calculada. Não chama IA nenhuma — é
 * exatamente o que faz isto ser instantâneo à mesa. Ver ARQUITETURA.md §1.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const restauranteId = searchParams.get("restauranteId");
  const pratoIds = (searchParams.get("pratoIds") ?? "").split(",").filter(Boolean);

  if (!restauranteId) {
    return NextResponse.json({ erro: "Falta restauranteId." }, { status: 400 });
  }

  const resultado = await sugerirVinhos(restauranteId, pratoIds);
  return NextResponse.json(resultado);
}
