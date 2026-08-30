import Link from "next/link";
import { getRestauranteAtual } from "@/lib/restaurante";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BackofficePage() {
  const restaurante = await getRestauranteAtual();
  const [pratos, vinhos, perguntasAbertas] = await Promise.all([
    prisma.prato.count({ where: { restauranteId: restaurante.id } }),
    prisma.cartaVinho.count({ where: { restauranteId: restaurante.id } }),
    prisma.pergunta.count({ where: { restauranteId: restaurante.id, estado: "ABERTA" } }),
  ]);

  const CARTOES = [
    { href: "/backoffice/pratos", titulo: "Menu", valor: pratos, unidade: "pratos" },
    { href: "/backoffice/vinhos", titulo: "Carta de vinhos", valor: vinhos, unidade: "vinhos" },
    {
      href: "/backoffice/perguntas",
      titulo: "Perguntas",
      valor: perguntasAbertas,
      unidade: "por responder",
      destaque: perguntasAbertas > 0,
    },
  ];

  return (
    <main className="mx-auto min-h-full max-w-2xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">Backoffice — {restaurante.nome}</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Carrega o menu e a carta, e responde às perguntas que a IA não conseguiu resolver sozinha.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {CARTOES.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className={`rounded-xl border p-5 transition-colors hover:border-vinho-700 ${
              c.destaque
                ? "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30"
                : "border-slate-200 dark:border-slate-800"
            }`}
          >
            <p className="text-3xl font-semibold">{c.valor}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">{c.unidade}</p>
            <p className="mt-2 font-medium">{c.titulo}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
