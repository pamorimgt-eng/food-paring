"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Funcionario = { id: string; nome: string; papel: string; temPin: boolean };

const ROTULO_PAPEL: Record<string, string> = {
  ADMIN: "Backoffice",
  SALA: "Sala",
  COZINHA: "Cozinha",
};

export function FuncionariosBackoffice({
  restauranteId,
  funcionariosIniciais,
}: {
  restauranteId: string;
  funcionariosIniciais: Funcionario[];
}) {
  const router = useRouter();
  const [novo, setNovo] = useState({ nome: "", papel: "SALA", pin: "" });
  const [erro, setErro] = useState<string | null>(null);
  const [aGuardar, setAGuardar] = useState(false);

  async function adicionar() {
    if (!novo.nome.trim() || novo.pin.length !== 4) {
      setErro("Preenche o nome e um PIN de 4 dígitos.");
      return;
    }
    setAGuardar(true);
    setErro(null);
    try {
      const resp = await fetch("/api/funcionarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restauranteId, ...novo }),
      });
      if (!resp.ok) throw new Error("Falha ao criar o funcionário.");
      setNovo({ nome: "", papel: "SALA", pin: "" });
      router.refresh();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao criar o funcionário.");
    } finally {
      setAGuardar(false);
    }
  }

  async function remover(id: string) {
    if (!confirm("Remover este funcionário? Deixa de conseguir entrar com o PIN dele.")) return;
    await fetch(`/api/funcionarios/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <main className="mx-auto min-h-full max-w-2xl px-6 py-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Funcionários</h1>
        <a href="/backoffice" className="text-sm text-slate-500 hover:underline">
          ← backoffice
        </a>
      </header>

      {erro && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {erro}
        </p>
      )}

      <section className="mb-8 rounded-xl border border-slate-200 p-5 dark:border-slate-800">
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">Novo funcionário</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={novo.nome}
            onChange={(e) => setNovo({ ...novo, nome: e.target.value })}
            placeholder="Nome"
            className="toque flex-1 rounded-lg border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
          <select
            value={novo.papel}
            onChange={(e) => setNovo({ ...novo, papel: e.target.value })}
            className="toque rounded-lg border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="SALA">Sala</option>
            <option value="COZINHA">Cozinha</option>
            <option value="ADMIN">Backoffice</option>
          </select>
          <input
            value={novo.pin}
            onChange={(e) => setNovo({ ...novo, pin: e.target.value.replace(/\D/g, "").slice(0, 4) })}
            placeholder="PIN (4 dígitos)"
            inputMode="numeric"
            className="toque w-36 rounded-lg border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
          <button
            onClick={adicionar}
            disabled={aGuardar}
            className="toque rounded-lg bg-marca-500 px-4 text-sm font-medium text-white hover:bg-marca-600 disabled:opacity-50"
          >
            {aGuardar ? "A guardar…" : "Adicionar"}
          </button>
        </div>
      </section>

      <section>
        <ul className="divide-y divide-slate-200 dark:divide-slate-800">
          {funcionariosIniciais.map((f) => (
            <li key={f.id} className="flex items-center justify-between py-2.5 text-sm">
              <div>
                <p className="font-medium">{f.nome}</p>
                <p className="text-xs text-slate-500">
                  {ROTULO_PAPEL[f.papel] ?? f.papel} · {f.temPin ? "com PIN" : "sem PIN — não consegue entrar"}
                </p>
              </div>
              <button
                onClick={() => remover(f.id)}
                className="toque px-2 text-slate-400 hover:text-red-600"
                aria-label="Remover"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
