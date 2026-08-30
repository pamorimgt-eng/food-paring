"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type PratoResumo = { id: string; nome: string; descricao: string | null; seccao: string | null; preco: number };
type Item = { id: string; pratoId: string; nome: string; quantidade: number; notas: string | null; estado: string; preco: number };
type Sugestao = {
  banda: "ECONOMICO" | "MEDIO" | "PREMIUM";
  cartaVinhoId: string;
  nome: string;
  produtor: string | null;
  ano: number | null;
  preco: number;
  score: number;
  argumentos: string[];
};

const NOME_BANDA: Record<Sugestao["banda"], string> = {
  ECONOMICO: "Económico",
  MEDIO: "Médio",
  PREMIUM: "Premium",
};

export function ComandaMesa({
  restauranteId,
  mesaId,
  numeroMesa,
}: {
  restauranteId: string;
  mesaId: string;
  numeroMesa: string;
}) {
  const router = useRouter();
  const [pedidoId, setPedidoId] = useState<string | null>(null);
  const [itens, setItens] = useState<Item[]>([]);
  const [termo, setTermo] = useState("");
  const [resultados, setResultados] = useState<PratoResumo[]>([]);
  const [sugestoes, setSugestoes] = useState<Sugestao[]>([]);
  const [avisoMesa, setAvisoMesa] = useState<string | null>(null);
  const [aCarregarSugestao, setACarregarSugestao] = useState(false);
  const [aEnviar, setAEnviar] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregarPedido = useCallback(async () => {
    const resp = await fetch(`/api/pedidos/mesa/${mesaId}?restauranteId=${restauranteId}`);
    const dados = await resp.json();
    setPedidoId(dados.pedido.id);
    setItens(dados.pedido.itens);
  }, [mesaId, restauranteId]);

  useEffect(() => {
    carregarPedido();
  }, [carregarPedido]);

  // Sugestão recalcula sempre que os pratos da mesa mudam — é um SELECT sobre
  // a matriz já calculada, por isso é seguro correr a cada alteração.
  useEffect(() => {
    if (itens.length === 0) {
      setSugestoes([]);
      setAvisoMesa(null);
      return;
    }
    setACarregarSugestao(true);
    const pratoIds = itens.map((i) => i.pratoId).join(",");
    fetch(`/api/sugestao?restauranteId=${restauranteId}&pratoIds=${pratoIds}`)
      .then((r) => r.json())
      .then((d) => {
        setSugestoes(d.sugestoes ?? []);
        setAvisoMesa(d.aviso ?? null);
      })
      .finally(() => setACarregarSugestao(false));
  }, [itens, restauranteId]);

  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    if (!termo.trim()) {
      setResultados([]);
      return;
    }
    debounce.current = setTimeout(async () => {
      const resp = await fetch(
        `/api/pratos?restauranteId=${restauranteId}&q=${encodeURIComponent(termo)}`,
      );
      const dados = await resp.json();
      setResultados(dados.pratos ?? []);
    }, 200);
  }, [termo, restauranteId]);

  async function adicionarPrato(prato: PratoResumo) {
    if (!pedidoId) return;
    setTermo("");
    setResultados([]);
    await fetch(`/api/pedidos/${pedidoId}/itens`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pratoId: prato.id, quantidade: 1 }),
    });
    await carregarPedido();
  }

  async function removerItem(itemId: string) {
    await fetch(`/api/pedidos/${pedidoId}/itens/${itemId}`, { method: "DELETE" });
    await carregarPedido();
  }

  async function enviarParaCozinha() {
    if (!pedidoId || itens.length === 0) return;
    setAEnviar(true);
    setErro(null);
    try {
      await fetch(`/api/pedidos/${pedidoId}/enviar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sugestoesEscolhidas: sugestoes.map((s) => ({
            cartaVinhoId: s.cartaVinhoId,
            banda: s.banda,
            argumentos: s.argumentos,
          })),
        }),
      });
      router.push("/sala");
    } catch {
      setErro("Não foi possível enviar o pedido. Tenta novamente.");
    } finally {
      setAEnviar(false);
    }
  }

  const total = itens.reduce((soma, i) => soma + i.preco * i.quantidade, 0);

  return (
    <main className="mx-auto min-h-full max-w-md px-6 py-8 pb-32">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Mesa {numeroMesa}</h1>
        <a href="/sala" className="text-sm text-slate-500 hover:underline">
          ← mesas
        </a>
      </header>

      <section className="relative mb-6">
        <input
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Procurar prato… (ex: arroz)"
          className="toque w-full rounded-lg border border-slate-300 px-4 text-base dark:border-slate-700 dark:bg-slate-900"
        />
        {resultados.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
            {resultados.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => adicionarPrato(p)}
                  className="toque flex w-full items-center justify-between px-4 py-2 text-left hover:bg-vinho-50 dark:hover:bg-slate-800"
                >
                  <span>
                    {p.nome}
                    {p.seccao && (
                      <span className="ml-2 text-xs text-slate-500">{p.seccao}</span>
                    )}
                  </span>
                  <span className="text-sm text-slate-500">{p.preco.toFixed(2)} €</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-slate-500">
          Pedido
        </h2>
        {itens.length === 0 ? (
          <p className="text-sm text-slate-500">Ainda sem pratos. Procura acima para adicionar.</p>
        ) : (
          <ul className="divide-y divide-slate-200 dark:divide-slate-800">
            {itens.map((item) => (
              <li key={item.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="font-medium">
                    {item.quantidade}× {item.nome}
                  </p>
                  <p className="text-xs text-slate-500">{item.preco.toFixed(2)} €</p>
                </div>
                <button
                  onClick={() => removerItem(item.id)}
                  className="toque px-2 text-sm text-slate-400 hover:text-vinho-700"
                  aria-label="Remover"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
        {itens.length > 0 && (
          <p className="mt-2 text-right text-sm font-medium">Total: {total.toFixed(2)} €</p>
        )}
      </section>

      {itens.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-slate-500">
            Sugestão de vinho
          </h2>
          {aCarregarSugestao && <p className="text-sm text-slate-500">A calcular…</p>}
          {avisoMesa && (
            <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
              {avisoMesa}
            </p>
          )}
          {!aCarregarSugestao && sugestoes.length === 0 && !avisoMesa && (
            <p className="text-sm text-slate-500">
              Sem sugestão disponível — os pratos ou a carta ainda não têm ficha suficiente.
            </p>
          )}
          <div className="flex flex-col gap-3">
            {sugestoes.map((s) => (
              <div
                key={s.cartaVinhoId}
                className="rounded-xl border border-vinho-200 bg-vinho-50 p-3 dark:border-vinho-900 dark:bg-vinho-950/30"
              >
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-vinho-700 dark:text-vinho-300">
                    {NOME_BANDA[s.banda]}
                  </span>
                  <span className="text-sm font-medium">{s.preco.toFixed(2)} €</span>
                </div>
                <p className="font-medium">
                  {s.nome}
                  {s.produtor && <span className="text-slate-600 dark:text-slate-400"> — {s.produtor}</span>}
                  {s.ano && <span className="text-slate-500"> {s.ano}</span>}
                </p>
                <ul className="mt-1 list-disc pl-4 text-sm text-slate-700 dark:text-slate-300">
                  {s.argumentos.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {erro && <p className="mb-3 text-sm text-red-600">{erro}</p>}

      <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 p-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <button
          onClick={enviarParaCozinha}
          disabled={itens.length === 0 || aEnviar}
          className="toque mx-auto block w-full max-w-md rounded-lg bg-vinho-700 font-medium text-white transition-colors hover:bg-vinho-800 disabled:opacity-40"
        >
          {aEnviar ? "A enviar…" : "Enviar para a cozinha"}
        </button>
      </div>
    </main>
  );
}
