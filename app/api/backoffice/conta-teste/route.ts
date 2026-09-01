import { NextResponse } from "next/server";
import { getRestauranteAtual } from "@/lib/restaurante";
import { calcularHashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Cria (ou atualiza a password de) uma conta de gestão de teste. Existe pela
 * mesma razão que /api/backoffice/seed-teste: sem acesso a terminal no
 * servidor, isto é a forma de preparar dados sem mexer na base de dados à
 * mão. Idempotente — chamar outra vez só atualiza a password.
 */
export async function POST(request: Request) {
  const { email, password, nome } = await request.json();
  if (!email || !password) {
    return NextResponse.json({ erro: "Falta email ou password." }, { status: 400 });
  }

  const restaurante = await getRestauranteAtual();
  const passwordHash = calcularHashPassword(password);

  const utilizador = await prisma.utilizador.upsert({
    where: { restauranteId_email: { restauranteId: restaurante.id, email } },
    update: { passwordHash },
    create: {
      restauranteId: restaurante.id,
      nome: nome ?? "Conta de teste",
      email,
      papel: "ADMIN",
      passwordHash,
    },
  });

  return NextResponse.json({ id: utilizador.id, email: utilizador.email });
}
