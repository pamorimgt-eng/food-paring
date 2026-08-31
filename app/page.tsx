import Link from "next/link";
import { redirect } from "next/navigation";
import { getUtilizadorAtual } from "@/lib/auth";

const DESTINO_POR_PAPEL: Record<string, string> = {
  ADMIN: "/backoffice",
  SALA: "/sala",
  COZINHA: "/cozinha",
};

const ACESSOS = [
  { href: "/sala", titulo: "Sala", descricao: "Registar pedidos por mesa e sugerir vinho ao cliente." },
  { href: "/cozinha", titulo: "Cozinha", descricao: "Ecrã de pedidos em tempo real." },
  { href: "/backoffice", titulo: "Backoffice", descricao: "Carregar o menu e a carta de vinhos, ver relatórios." },
];

export const dynamic = "force-dynamic";

/**
 * Sem ecrã intermédio: quem já tem sessão vai direto para a sua área, quem
 * não tem vai para o login. Um pedido a mais no meio não ajuda ninguém a
 * meio de um turno.
 *
 * Com DESATIVAR_LOGIN=true (ver lib/auth.ts), mostra antes um menu de
 * escolha — sem sessão para saber para onde mandar sozinho.
 */
export default async function Home() {
  if (process.env.DESATIVAR_LOGIN === "true") {
    return (
      <main className="mx-auto flex min-h-full max-w-md flex-col justify-center gap-8 px-6 py-16">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight">Comanda Digital</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Pedidos sem papel, com o vinho certo sugerido na mesma mesa.
          </p>
        </header>
        <nav className="flex flex-col gap-3">
          {ACESSOS.map(({ href, titulo, descricao }) => (
            <Link
              key={href}
              href={href}
              className="toque rounded-xl border border-slate-200 px-5 py-4 transition-colors hover:border-vinho-700 hover:bg-vinho-50 dark:border-slate-800 dark:hover:border-vinho-500 dark:hover:bg-slate-900"
            >
              <span className="block font-medium">{titulo}</span>
              <span className="mt-0.5 block text-sm text-slate-600 dark:text-slate-400">
                {descricao}
              </span>
            </Link>
          ))}
        </nav>
      </main>
    );
  }

  const utilizador = await getUtilizadorAtual();
  redirect(utilizador ? (DESTINO_POR_PAPEL[utilizador.papel] ?? "/login") : "/login");
}
