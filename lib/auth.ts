import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import type { Papel } from "@prisma/client";

const COOKIE = "sessao_utilizador";

/**
 * PIN de 4 dígitos, não password — login rápido para quem está a meio de
 * turno (ARQUITETURA.md §3.5). Não é força de segurança de produção: para
 * uma alfa de equipa de confiança, HMAC com um segredo do servidor chega.
 * Antes de dados de clientes reais, isto merece bcrypt/argon2 e uma sessão
 * assinada em vez de um id de utilizador em claro na cookie.
 */
const SEGREDO = process.env.SESSAO_SEGREDO ?? "alfa-nao-usar-em-producao";

export function calcularHashPin(pin: string): string {
  return createHmac("sha256", SEGREDO).update(pin).digest("hex");
}

export function pinCorresponde(pin: string, hash: string): boolean {
  const calculado = Buffer.from(calcularHashPin(pin));
  const guardado = Buffer.from(hash);
  return calculado.length === guardado.length && timingSafeEqual(calculado, guardado);
}

export async function iniciarSessao(utilizadorId: string) {
  const store = await cookies();
  store.set(COOKIE, utilizadorId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 14, // um turno alargado
    path: "/",
  });
}

export async function terminarSessao() {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function getUtilizadorAtual() {
  const store = await cookies();
  const id = store.get(COOKIE)?.value;
  if (!id) return null;
  return prisma.utilizador.findUnique({ where: { id } });
}

/**
 * Desliga a exigência de PIN sem tirar o código do sítio — só para o
 * período de teste em que entrar com código está a atrapalhar mais do que
 * ajudar. Voltar a exigir login é mudar isto para "false" (ou remover a
 * variável de ambiente), nada mais.
 */
const LOGIN_DESATIVADO = process.env.DESATIVAR_LOGIN === "true";

/** Usa no topo de uma página de servidor. Manda para /login se não servir. */
export async function exigirPapel(papeis: Papel[]) {
  if (LOGIN_DESATIVADO) {
    const substituto = await prisma.utilizador.findFirst({
      where: { papel: { in: papeis } },
      orderBy: { criadoEm: "asc" },
    });
    if (substituto) return substituto;
    // Sem nenhum funcionário com este papel ainda — cai para o fluxo normal.
  }

  const utilizador = await getUtilizadorAtual();
  if (!utilizador || !papeis.includes(utilizador.papel)) {
    redirect("/login");
  }
  return utilizador;
}
