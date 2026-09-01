"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Pergunta = { id: string; pergunta: string; opcoes: string[] };

/**
 * "Não sei" está sempre entre as opções, mesmo quando a ficha só sugeriu
 * outras — nunca pode ser um beco sem saída. Ver ARQUITETURA.md §2.
 */
function comNaoSei(opcoes: string[]): string[] {
  return opcoes.some((o) => o.toLowerCase().includes("não sei"))
    ? opcoes
    : [...opcoes, "Não sei"];
}

export function PerguntasBackoffice({
  perguntasIniciais,
}: {
  perguntasIniciais: Pergunta[];
}) {
  const router = useRouter();
  const [perguntas, setPerguntas] = useState(perguntasIniciais);
  const [textoLivre, setTextoLivre] = useState<Record<string, string>>({});
  const [aResponder, setAResponder] = useState<string | null>(null);

  async function responder(id: string, resposta: string) {
    setAResponder(id);
    try {
      await fetch(`/api/perguntas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resposta }),
      });
      setPerguntas((atual) => atual.filter((p) => p.id !== id));
      router.refresh();
    } finally {
      setAResponder(null);
    }
  }

  return (
    <main className="mx-auto min-h-full max-w-2xl px-6 py-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Perguntas</h1>
        <a href="/backoffice" className="text-sm text-slate-500 hover:underline">
          ← backoffice
        </a>
      </header>

      {perguntas.length === 0 ? (
        <p className="text-sm text-slate-500">
          Sem perguntas em aberto. A IA conseguiu confirmar tudo o que pesquisou.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {perguntas.map((p) => {
            const opcoes = comNaoSei(p.opcoes);
            const usaOpcoes = opcoes.length > 1;
            return (
              <li
                key={p.id}
                className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"
              >
                <p className="mb-3">{p.pergunta}</p>
                {usaOpcoes ? (
                  <div className="flex flex-wrap gap-2">
                    {opcoes.map((opcao) => (
                      <button
                        key={opcao}
                        onClick={() => responder(p.id, opcao)}
                        disabled={aResponder === p.id}
                        className={`toque rounded-lg border px-4 text-sm font-medium disabled:opacity-40 ${
                          opcao.toLowerCase().includes("não sei")
                            ? "border-slate-300 text-slate-500 dark:border-slate-700"
                            : "border-marca-500 text-marca-500 hover:bg-marca-50 dark:hover:bg-marca-800/30"
                        }`}
                      >
                        {opcao}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={textoLivre[p.id] ?? ""}
                      onChange={(e) =>
                        setTextoLivre((atual) => ({ ...atual, [p.id]: e.target.value }))
                      }
                      placeholder="Resposta"
                      className="toque flex-1 rounded-lg border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                    />
                    <button
                      onClick={() => responder(p.id, textoLivre[p.id] ?? "")}
                      disabled={aResponder === p.id || !textoLivre[p.id]?.trim()}
                      className="toque rounded-lg bg-marca-500 px-4 text-sm font-medium text-white disabled:opacity-40"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => responder(p.id, "Não sei")}
                      disabled={aResponder === p.id}
                      className="toque rounded-lg border border-slate-300 px-4 text-sm text-slate-500 disabled:opacity-40 dark:border-slate-700"
                    >
                      Não sei
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
