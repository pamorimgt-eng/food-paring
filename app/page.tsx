import { redirect } from "next/navigation";
import { getUtilizadorAtual } from "@/lib/auth";

const DESTINO_POR_PAPEL: Record<string, string> = {
  ADMIN: "/backoffice",
  SALA: "/sala",
  COZINHA: "/cozinha",
};

export const dynamic = "force-dynamic";

/**
 * Sem ecrã intermédio: quem já tem sessão vai direto para a sua área, quem
 * não tem vai para o login. Um pedido a mais no meio não ajuda ninguém a
 * meio de um turno.
 */
export default async function Home() {
  const utilizador = await getUtilizadorAtual();
  redirect(utilizador ? (DESTINO_POR_PAPEL[utilizador.papel] ?? "/login") : "/login");
}
