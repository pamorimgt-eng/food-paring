import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { iniciarSessao, passwordCorresponde } from "@/lib/auth";

const Corpo = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/**
 * Entrada por email+password — para contas de gestão, ao lado do PIN da
 * equipa de sala/cozinha. `email` não é globalmente único no esquema (é
 * único por restaurante), mas nesta fase de restaurante único isso não é
 * ambíguo na prática.
 */
export async function POST(request: Request) {
  const { email, password } = Corpo.parse(await request.json());

  const utilizador = await prisma.utilizador.findFirst({ where: { email } });
  if (!utilizador?.passwordHash || !passwordCorresponde(password, utilizador.passwordHash)) {
    return NextResponse.json({ erro: "Email ou password incorretos." }, { status: 401 });
  }

  await iniciarSessao(utilizador.id);
  return NextResponse.json({ nome: utilizador.nome, papel: utilizador.papel });
}
