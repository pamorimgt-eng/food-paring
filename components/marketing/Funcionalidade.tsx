import type { ReactNode } from "react";

export function Funcionalidade({
  id,
  etiqueta,
  titulo,
  descricao,
  pontos,
  visual,
  invertido = false,
  escuro = false,
}: {
  id?: string;
  etiqueta: string;
  titulo: string;
  descricao: string;
  pontos: string[];
  visual: ReactNode;
  invertido?: boolean;
  escuro?: boolean;
}) {
  return (
    <section
      id={id}
      className={escuro ? "bg-marca-preto text-white" : "bg-marca-creme"}
    >
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div
          className={`grid gap-12 md:grid-cols-2 md:items-center ${
            invertido ? "md:[&>*:first-child]:order-2" : ""
          }`}
        >
          <div className={escuro ? "rounded-2xl bg-white/5 p-2" : ""}>{visual}</div>

          <div>
            <p
              className={`mb-3 text-xs font-bold uppercase tracking-widest ${
                escuro ? "text-marca-300" : "text-marca-500"
              }`}
            >
              {etiqueta}
            </p>
            <h2
              className={`text-2xl font-extrabold uppercase leading-tight tracking-tight sm:text-3xl ${
                escuro ? "text-white" : "text-marca-preto"
              }`}
            >
              {titulo}
            </h2>
            <p className={`mt-4 leading-relaxed ${escuro ? "text-white/70" : "text-marca-preto/70"}`}>
              {descricao}
            </p>
            <ul className="mt-6 space-y-3">
              {pontos.map((p, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      escuro ? "bg-marca-500 text-white" : "bg-marca-500 text-white"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className={escuro ? "text-white/80" : "text-marca-preto/80"}>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
