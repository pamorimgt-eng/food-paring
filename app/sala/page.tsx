import Link from "next/link";
import { getRestauranteAtual } from "@/lib/restaurante";
import { prisma } from "@/lib/prisma";

// A ocupação das mesas muda a cada pedido — teria de ser dinâmica de qualquer
// forma; sem isto o Next gerava a página uma vez, no build, e ficava presa
// ao estado dessa altura.
export const dynamic = "force-dynamic";

export default async function SalaPage() {
  const restaurante = await getRestauranteAtual();
  const mesas = await prisma.mesa.findMany({
    where: { restauranteId: restaurante.id },
    orderBy: { numero: "asc" },
    include: { pedidos: { where: { estado: { not: "FECHADO" } }, select: { id: true } } },
  });

  return (
    <main className="mx-auto min-h-full max-w-md px-6 py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Sala</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Escolhe a mesa para registar o pedido.
        </p>
      </header>

      <div className="grid grid-cols-3 gap-3">
        {mesas.map((mesa) => {
          const ocupada = mesa.pedidos.length > 0;
          return (
            <Link
              key={mesa.id}
              href={`/sala/mesa/${mesa.id}`}
              className={`toque flex aspect-square flex-col items-center justify-center rounded-xl border text-lg font-semibold transition-colors ${
                ocupada
                  ? "border-vinho-700 bg-vinho-50 text-vinho-800 dark:border-vinho-500 dark:bg-vinho-950/40 dark:text-vinho-200"
                  : "border-slate-200 text-slate-700 hover:border-slate-400 dark:border-slate-800 dark:text-slate-300"
              }`}
            >
              {mesa.numero}
              <span className="mt-1 text-[10px] font-normal uppercase tracking-wide">
                {ocupada ? "Em curso" : "Livre"}
              </span>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
