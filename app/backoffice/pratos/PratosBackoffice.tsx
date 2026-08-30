"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type PratoLista = {
  id: string;
  nome: string;
  seccao: string | null;
  preco: number;
  enriquecido: boolean;
  origem: string;
};

type PratoRevisao = {
  nome: string;
  descricao: string | null;
  seccao: string | null;
  preco: number | null;
  incerto: boolean;
};

export function PratosBackoffice({
  restauranteId,
  pratosIniciais,
}: {
  restauranteId: string;
  pratosIniciais: PratoLista[];
}) {
  const router = useRouter();
  const inputFicheiro = useRef<HTMLInputElement>(null);

  const [aCarregarFoto, setACarregarFoto] = useState(false);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [revisao, setRevisao] = useState<PratoRevisao[] | null>(null);
  const [avisos, setAvisos] = useState<string[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [aConfirmar, setAConfirmar] = useState(false);

  const [manual, setManual] = useState({ nome: "", seccao: "", preco: "" });
  const [aGuardarManual, setAGuardarManual] = useState(false);

  async function carregarFoto(ficheiro: File) {
    setACarregarFoto(true);
    setErro(null);
    try {
      const form = new FormData();
      form.append("restauranteId", restauranteId);
      form.append("ficheiro", ficheiro);
      const resp = await fetch("/api/menu/upload", { method: "POST", body: form });
      const dados = await resp.json();
      if (!resp.ok) throw new Error(dados.erro ?? "Falha ao ler a foto.");
      setUploadId(dados.uploadId);
      setRevisao(dados.extraido.pratos);
      setAvisos(dados.extraido.avisos ?? []);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao ler a foto.");
    } finally {
      setACarregarFoto(false);
    }
  }

  function atualizarLinha(indice: number, campo: keyof PratoRevisao, valor: string) {
    setRevisao((atual) => {
      if (!atual) return atual;
      const copia = [...atual];
      const linha = { ...copia[indice] };
      if (campo === "preco") {
        linha.preco = valor === "" ? null : Number(valor);
      } else {
        (linha as Record<string, unknown>)[campo] = valor || null;
      }
      copia[indice] = linha;
      return copia;
    });
  }

  function removerLinha(indice: number) {
    setRevisao((atual) => atual?.filter((_, i) => i !== indice) ?? atual);
  }

  async function confirmarRevisao() {
    if (!revisao) return;
    setAConfirmar(true);
    setErro(null);
    try {
      const pratosValidos = revisao.filter((p) => p.nome.trim() && p.preco != null);
      const resp = await fetch("/api/menu/confirmar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restauranteId, uploadId, pratos: pratosValidos }),
      });
      const dados = await resp.json();
      if (!resp.ok) throw new Error(dados.erro ?? "Falha ao gravar.");
      setRevisao(null);
      setUploadId(null);
      router.refresh();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao gravar.");
    } finally {
      setAConfirmar(false);
    }
  }

  async function adicionarManual() {
    if (!manual.nome.trim() || !manual.preco) return;
    setAGuardarManual(true);
    setErro(null);
    try {
      const resp = await fetch("/api/pratos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restauranteId,
          nome: manual.nome,
          seccao: manual.seccao || null,
          preco: Number(manual.preco),
        }),
      });
      if (!resp.ok) throw new Error("Falha ao guardar o prato.");
      setManual({ nome: "", seccao: "", preco: "" });
      router.refresh();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao guardar o prato.");
    } finally {
      setAGuardarManual(false);
    }
  }

  return (
    <main className="mx-auto min-h-full max-w-2xl px-6 py-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Menu</h1>
        <a href="/backoffice" className="text-sm text-slate-500 hover:underline">
          ← backoffice
        </a>
      </header>

      {erro && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {erro}
        </p>
      )}

      {!revisao && (
        <section className="mb-8 flex flex-col gap-4 sm:flex-row">
          <div className="flex-1 rounded-xl border border-dashed border-slate-300 p-5 text-center dark:border-slate-700">
            <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
              Foto da carta — a IA lê os pratos por ti.
            </p>
            <input
              ref={inputFicheiro}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && carregarFoto(e.target.files[0])}
            />
            <button
              onClick={() => inputFicheiro.current?.click()}
              disabled={aCarregarFoto}
              className="toque rounded-lg bg-vinho-700 px-4 text-sm font-medium text-white hover:bg-vinho-800 disabled:opacity-50"
            >
              {aCarregarFoto ? "A ler a foto…" : "Carregar foto do menu"}
            </button>
          </div>

          <div className="flex-1 rounded-xl border border-slate-200 p-5 dark:border-slate-800">
            <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
              Ou adiciona um prato de cada vez.
            </p>
            <div className="flex flex-col gap-2">
              <input
                value={manual.nome}
                onChange={(e) => setManual({ ...manual, nome: e.target.value })}
                placeholder="Nome do prato"
                className="toque rounded-lg border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
              />
              <div className="flex gap-2">
                <input
                  value={manual.seccao}
                  onChange={(e) => setManual({ ...manual, seccao: e.target.value })}
                  placeholder="Secção"
                  className="toque flex-1 rounded-lg border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
                <input
                  value={manual.preco}
                  onChange={(e) => setManual({ ...manual, preco: e.target.value })}
                  placeholder="Preço"
                  inputMode="decimal"
                  className="toque w-24 rounded-lg border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>
              <button
                onClick={adicionarManual}
                disabled={aGuardarManual}
                className="toque rounded-lg border border-vinho-700 text-sm font-medium text-vinho-700 hover:bg-vinho-50 disabled:opacity-50 dark:hover:bg-vinho-950/30"
              >
                {aGuardarManual ? "A guardar…" : "Adicionar referência"}
              </button>
            </div>
          </div>
        </section>
      )}

      {revisao && (
        <section className="mb-8 rounded-xl border border-vinho-200 p-5 dark:border-vinho-900">
          <h2 className="mb-1 font-medium">Confirma o que a IA leu</h2>
          <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
            Corrige o que estiver errado. Nada é gravado sem esta confirmação.
          </p>
          {avisos.length > 0 && (
            <ul className="mb-4 list-disc rounded-lg bg-amber-50 px-6 py-2 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
              {avisos.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          )}
          <div className="flex flex-col gap-2">
            {revisao.map((p, i) => (
              <div
                key={i}
                className={`flex flex-wrap items-center gap-2 rounded-lg p-2 ${
                  p.incerto ? "bg-amber-50 dark:bg-amber-950/30" : "bg-slate-50 dark:bg-slate-900"
                }`}
              >
                <input
                  value={p.nome}
                  onChange={(e) => atualizarLinha(i, "nome", e.target.value)}
                  className="min-w-40 flex-1 rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950"
                />
                <input
                  value={p.seccao ?? ""}
                  onChange={(e) => atualizarLinha(i, "seccao", e.target.value)}
                  placeholder="Secção"
                  className="w-28 rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950"
                />
                <input
                  value={p.preco ?? ""}
                  onChange={(e) => atualizarLinha(i, "preco", e.target.value)}
                  placeholder="Preço"
                  inputMode="decimal"
                  className="w-20 rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950"
                />
                <button
                  onClick={() => removerLinha(i)}
                  className="toque px-2 text-slate-400 hover:text-vinho-700"
                  aria-label="Remover"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={confirmarRevisao}
              disabled={aConfirmar}
              className="toque flex-1 rounded-lg bg-vinho-700 text-sm font-medium text-white hover:bg-vinho-800 disabled:opacity-50"
            >
              {aConfirmar ? "A gravar e a analisar…" : `Confirmar ${revisao.length} pratos`}
            </button>
            <button
              onClick={() => {
                setRevisao(null);
                setUploadId(null);
              }}
              className="toque rounded-lg border border-slate-300 px-4 text-sm dark:border-slate-700"
            >
              Cancelar
            </button>
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-slate-500">
          {pratosIniciais.length} pratos
        </h2>
        <ul className="divide-y divide-slate-200 dark:divide-slate-800">
          {pratosIniciais.map((p) => (
            <li key={p.id} className="flex items-center justify-between py-2.5 text-sm">
              <div>
                <p className="font-medium">{p.nome}</p>
                <p className="text-xs text-slate-500">
                  {p.seccao ?? "sem secção"} · {p.origem === "FOTO" ? "por foto" : "manual"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-600 dark:text-slate-400">{p.preco.toFixed(2)} €</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    p.enriquecido
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  {p.enriquecido ? "Analisado" : "Pendente"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
