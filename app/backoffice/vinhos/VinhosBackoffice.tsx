"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type VinhoLista = {
  cartaVinhoId: string;
  nome: string;
  produtor: string | null;
  ano: number | null;
  tipo: string | null;
  confianca: string;
  enriquecido: boolean;
  preco: number;
  origem: string;
};

type VinhoRevisao = {
  nome: string;
  produtor: string | null;
  ano: number | null;
  regiao: string | null;
  preco: number | null;
  incerto: boolean;
};

const ROTULO_CONFIANCA: Record<string, string> = {
  ALTA: "Confiança alta",
  MEDIA: "Confiança média",
  BAIXA: "Verificar",
};

export function VinhosBackoffice({
  restauranteId,
  vinhosIniciais,
}: {
  restauranteId: string;
  vinhosIniciais: VinhoLista[];
}) {
  const router = useRouter();
  const inputFicheiro = useRef<HTMLInputElement>(null);

  const [aCarregarFoto, setACarregarFoto] = useState(false);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [revisao, setRevisao] = useState<VinhoRevisao[] | null>(null);
  const [avisos, setAvisos] = useState<string[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [aConfirmar, setAConfirmar] = useState(false);

  const [manual, setManual] = useState({ nome: "", produtor: "", ano: "", preco: "" });
  const [aGuardarManual, setAGuardarManual] = useState(false);

  async function carregarFoto(ficheiro: File) {
    setACarregarFoto(true);
    setErro(null);
    try {
      const form = new FormData();
      form.append("restauranteId", restauranteId);
      form.append("ficheiro", ficheiro);
      const resp = await fetch("/api/vinhos/upload", { method: "POST", body: form });
      const dados = await resp.json();
      if (!resp.ok) throw new Error(dados.erro ?? "Falha ao ler a foto.");
      setUploadId(dados.uploadId);
      setRevisao(dados.extraido.vinhos);
      setAvisos(dados.extraido.avisos ?? []);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao ler a foto.");
    } finally {
      setACarregarFoto(false);
    }
  }

  function atualizarLinha(indice: number, campo: keyof VinhoRevisao, valor: string) {
    setRevisao((atual) => {
      if (!atual) return atual;
      const copia = [...atual];
      const linha = { ...copia[indice] } as Record<string, unknown>;
      if (campo === "preco") linha.preco = valor === "" ? null : Number(valor);
      else if (campo === "ano") linha.ano = valor === "" ? null : Number(valor);
      else linha[campo] = valor || null;
      copia[indice] = linha as unknown as VinhoRevisao;
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
      const vinhosValidos = revisao.filter((v) => v.nome.trim() && v.preco != null);
      const resp = await fetch("/api/vinhos/confirmar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restauranteId, uploadId, vinhos: vinhosValidos }),
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
      const resp = await fetch("/api/vinhos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restauranteId,
          nome: manual.nome,
          produtor: manual.produtor || null,
          ano: manual.ano ? Number(manual.ano) : null,
          preco: Number(manual.preco),
        }),
      });
      if (!resp.ok) throw new Error("Falha ao guardar o vinho.");
      setManual({ nome: "", produtor: "", ano: "", preco: "" });
      router.refresh();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao guardar o vinho.");
    } finally {
      setAGuardarManual(false);
    }
  }

  return (
    <main className="mx-auto min-h-full max-w-2xl px-6 py-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Carta de vinhos</h1>
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
              Foto da carta — a IA identifica os vinhos e pesquisa a ficha técnica.
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
              className="toque rounded-lg bg-marca-500 px-4 text-sm font-medium text-white hover:bg-marca-600 disabled:opacity-50"
            >
              {aCarregarFoto ? "A ler a foto…" : "Carregar foto da carta"}
            </button>
          </div>

          <div className="flex-1 rounded-xl border border-slate-200 p-5 dark:border-slate-800">
            <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
              Ou adiciona um vinho de cada vez.
            </p>
            <div className="flex flex-col gap-2">
              <input
                value={manual.nome}
                onChange={(e) => setManual({ ...manual, nome: e.target.value })}
                placeholder="Nome do vinho"
                className="toque rounded-lg border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
              />
              <div className="flex gap-2">
                <input
                  value={manual.produtor}
                  onChange={(e) => setManual({ ...manual, produtor: e.target.value })}
                  placeholder="Produtor"
                  className="toque flex-1 rounded-lg border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
                <input
                  value={manual.ano}
                  onChange={(e) => setManual({ ...manual, ano: e.target.value })}
                  placeholder="Ano"
                  inputMode="numeric"
                  className="toque w-20 rounded-lg border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
                <input
                  value={manual.preco}
                  onChange={(e) => setManual({ ...manual, preco: e.target.value })}
                  placeholder="Preço"
                  inputMode="decimal"
                  className="toque w-20 rounded-lg border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>
              <button
                onClick={adicionarManual}
                disabled={aGuardarManual}
                className="toque rounded-lg border border-marca-500 text-sm font-medium text-marca-500 hover:bg-marca-50 disabled:opacity-50 dark:hover:bg-marca-800/30"
              >
                {aGuardarManual ? "A guardar…" : "Adicionar referência"}
              </button>
            </div>
          </div>
        </section>
      )}

      {revisao && (
        <section className="mb-8 rounded-xl border border-marca-100 p-5 dark:border-marca-700">
          <h2 className="mb-1 font-medium">Confirma o que a IA leu</h2>
          <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
            A ficha técnica (castas, corpo, acidez…) é pesquisada a seguir, depois de confirmares.
          </p>
          {avisos.length > 0 && (
            <ul className="mb-4 list-disc rounded-lg bg-amber-50 px-6 py-2 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
              {avisos.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          )}
          <div className="flex flex-col gap-2">
            {revisao.map((v, i) => (
              <div
                key={i}
                className={`flex flex-wrap items-center gap-2 rounded-lg p-2 ${
                  v.incerto ? "bg-amber-50 dark:bg-amber-950/30" : "bg-slate-50 dark:bg-slate-900"
                }`}
              >
                <input
                  value={v.nome}
                  onChange={(e) => atualizarLinha(i, "nome", e.target.value)}
                  className="min-w-40 flex-1 rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950"
                />
                <input
                  value={v.produtor ?? ""}
                  onChange={(e) => atualizarLinha(i, "produtor", e.target.value)}
                  placeholder="Produtor"
                  className="w-32 rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950"
                />
                <input
                  value={v.ano ?? ""}
                  onChange={(e) => atualizarLinha(i, "ano", e.target.value)}
                  placeholder="Ano"
                  inputMode="numeric"
                  className="w-16 rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950"
                />
                <input
                  value={v.preco ?? ""}
                  onChange={(e) => atualizarLinha(i, "preco", e.target.value)}
                  placeholder="Preço"
                  inputMode="decimal"
                  className="w-20 rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950"
                />
                <button
                  onClick={() => removerLinha(i)}
                  className="toque px-2 text-slate-400 hover:text-marca-500"
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
              className="toque flex-1 rounded-lg bg-marca-500 text-sm font-medium text-white hover:bg-marca-600 disabled:opacity-50"
            >
              {aConfirmar ? "A gravar e a pesquisar…" : `Confirmar ${revisao.length} vinhos`}
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
          {vinhosIniciais.length} vinhos
        </h2>
        <ul className="divide-y divide-slate-200 dark:divide-slate-800">
          {vinhosIniciais.map((v) => (
            <li key={v.cartaVinhoId} className="flex items-center justify-between py-2.5 text-sm">
              <div>
                <p className="font-medium">
                  {v.nome}
                  {v.ano && <span className="text-slate-500"> {v.ano}</span>}
                </p>
                <p className="text-xs text-slate-500">
                  {v.produtor ?? "produtor desconhecido"} · {v.tipo ?? "tipo por confirmar"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-600 dark:text-slate-400">{v.preco.toFixed(2)} €</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    v.confianca === "ALTA"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : v.confianca === "MEDIA"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  {v.enriquecido ? ROTULO_CONFIANCA[v.confianca] : "Pendente"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
