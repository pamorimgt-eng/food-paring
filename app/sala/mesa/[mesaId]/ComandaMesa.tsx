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

/** Pedidos especiais mais comuns — um toque em vez de escrever sempre o mesmo. */
const NOTAS_RAPIDAS = [
  "Sem batata frita",
  "Sem cebola",
  "Sem glúten",
  "Bem passado",
  "Mal passado",
  "Molho à parte",
];

export function ComandaMesa({
  restauranteId,
  mesaId,
  numeroMesa,
  utilizadorId,
}: {
  restauranteId: string;
  mesaId: string;
  numeroMesa: string;
  utilizadorId: string;
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
  const [itemNotaAberta, setItemNotaAberta] = useState<string | null>(null);
  const [notaRascunho, setNotaRascunho] = useState("");

  const carregarPedido = useCallback(async () => {
    const resp = await fetch(
      `/api/pedidos/mesa/${mesaId}?restauranteId=${restauranteId}&utilizadorId=${utilizadorId}`,
    );
    const dados = await resp.json();
    setPedidoId(dados.pedido.id);
    setItens(dados.pedido.itens);
  }, [mesaId, restauranteId, utilizadorId]);

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
    setItens((atual) => atual.filter((i) => i.id !== itemId));
    await fetch(`/api/pedidos/${pedidoId}/itens/${itemId}`, { method: "DELETE" });
  }

  /** Otimista: o botão reage já, a chamada à API confirma em segundo plano. */
  async function alterarQuantidade(itemId: string, delta: number) {
    const atual = itens.find((i) => i.id === itemId);
    if (!atual) return;
    const quantidade = atual.quantidade + delta;
    if (quantidade < 1) return removerItem(itemId);

    setItens((lista) => lista.map((i) => (i.id === itemId ? { ...i, quantidade } : i)));
    await fetch(`/api/pedidos/${pedidoId}/itens/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantidade }),
    });
  }

  function abrirNota(item: Item) {
    setItemNotaAberta(item.id);
    setNotaRascunho(item.notas ?? "");
  }

  async function guardarNota(itemId: string, notas: string) {
    const valor = notas.trim() || null;
    setItens((lista) => lista.map((i) => (i.id === itemId ? { ...i, notas: valor } : i)));
    setItemNotaAberta(null);
    await fetch(`/api/pedidos/${pedidoId}/itens/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notas: valor }),
    });
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
                  className="toque flex w-full items-center justify-between px-4 py-2 text-left hover:bg-marca-50 dark:hover:bg-slate-800"
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
              <li key={item.id} className="py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.nome}</p>
                    <p className="text-xs text-slate-500">{item.preco.toFixed(2)} € cada</p>
                    {item.notas && itemNotaAberta !== item.id && (
                      <p className="mt-0.5 text-xs italic text-marca-500 dark:text-marca-200">
                        {item.notas}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => alterarQuantidade(item.id, -1)}
                      className="toque w-9 text-lg text-slate-600 hover:text-marca-500 dark:text-slate-300"
                      aria-label="Diminuir quantidade"
                    >
                      −
                    </button>
                    <span className="w-5 text-center font-medium tabular-nums">
                      {item.quantidade}
                    </span>
                    <button
                      onClick={() => alterarQuantidade(item.id, 1)}
                      className="toque w-9 text-lg text-slate-600 hover:text-marca-500 dark:text-slate-300"
                      aria-label="Aumentar quantidade"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => (itemNotaAberta === item.id ? setItemNotaAberta(null) : abrirNota(item))}
                    className={`toque px-2 text-sm ${
                      item.notas ? "text-marca-500 dark:text-marca-200" : "text-slate-400 hover:text-marca-500"
                    }`}
                    aria-label="Pedido especial"
                    title="Pedido especial (ex: sem batata frita)"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => removerItem(item.id)}
                    className="toque px-1 text-sm text-slate-400 hover:text-red-600"
                    aria-label="Remover"
                  >
                    ✕
                  </button>
                </div>

                {itemNotaAberta === item.id && (
                  <div className="mt-2 rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {NOTAS_RAPIDAS.map((nota) => (
                        <button
                          key={nota}
                          onClick={() => setNotaRascunho((atual) => (atual ? `${atual}, ${nota}` : nota))}
                          className="rounded-full border border-slate-300 px-2.5 py-1 text-xs hover:border-marca-500 hover:text-marca-500 dark:border-slate-600"
                        >
                          {nota}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={notaRascunho}
                        onChange={(e) => setNotaRascunho(e.target.value)}
                        placeholder="Pedido especial…"
                        className="toque flex-1 rounded-lg border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
                        autoFocus
                      />
                      <button
                        onClick={() => guardarNota(item.id, notaRascunho)}
                        className="toque rounded-lg bg-marca-500 px-4 text-sm font-medium text-white hover:bg-marca-600"
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                )}
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
                className="rounded-xl border border-marca-100 bg-marca-50 p-3 dark:border-marca-700 dark:bg-marca-800/30"
              >
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-marca-500 dark:text-marca-200">
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
          className="toque mx-auto block w-full max-w-md rounded-lg bg-marca-500 font-medium text-white transition-colors hover:bg-marca-600 disabled:opacity-40"
        >
          {aEnviar ? "A enviar…" : "Enviar para a cozinha"}
        </button>
      </div>
    </main>
  );
}
