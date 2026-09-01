"use client";

import { useCallback, useEffect, useState } from "react";
import { BotaoSair } from "@/components/BotaoSair";

type ItemPedido = { id: string; nome: string; quantidade: number; notas: string | null; estado: string };
type Pedido = { id: string; estado: string; mesa: string; criadoEm: string; itens: ItemPedido[] };

const ROTULO_ESTADO: Record<string, string> = {
  ENVIADO: "Novo",
  PREPARACAO: "Em preparação",
  PRONTO: "Pronto",
};

/**
 * Polling a cada 4s. É o fallback que a app precisa mesmo depois de ligar o
 * Supabase Realtime — o wi-fi de um restaurante cai, e o ecrã de cozinha não
 * pode ficar parado à espera de reconectar. Ver ARQUITETURA.md §3.9.
 */
const INTERVALO_MS = 4000;

export function CozinhaEcra({
  restauranteId,
  nomeUtilizador,
}: {
  restauranteId: string;
  nomeUtilizador: string;
}) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [ligado, setLigado] = useState(true);

  const carregar = useCallback(async () => {
    try {
      const resp = await fetch(`/api/pedidos?restauranteId=${restauranteId}`);
      const dados = await resp.json();
      setPedidos(dados.pedidos ?? []);
      setLigado(true);
    } catch {
      setLigado(false);
    }
  }, [restauranteId]);

  useEffect(() => {
    carregar();
    const id = setInterval(carregar, INTERVALO_MS);
    return () => clearInterval(id);
  }, [carregar]);

  async function avancarPedido(pedidoId: string, estadoAtual: string) {
    const proximo = estadoAtual === "ENVIADO" ? "PREPARACAO" : "ENTREGUE";
    await fetch(`/api/pedidos/${pedidoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: proximo }),
    });
    carregar();
  }

  async function alternarItem(pedidoId: string, itemId: string, estadoAtual: string) {
    const proximo = estadoAtual === "PRONTO" ? "PENDENTE" : "PRONTO";
    await fetch(`/api/pedidos/${pedidoId}/itens/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: proximo }),
    });
    carregar();
  }

  return (
    <main className="mx-auto min-h-full max-w-6xl px-6 py-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Cozinha</h1>
        <div className="flex items-center gap-3">
          {!ligado && (
            <span className="text-sm text-amber-600">A tentar reconectar…</span>
          )}
          <BotaoSair nome={nomeUtilizador} />
        </div>
      </header>

      {pedidos.length === 0 ? (
        <p className="text-slate-500">Sem pedidos em curso.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pedidos.map((pedido) => (
            <div
              key={pedido.id}
              className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-lg font-semibold">Mesa {pedido.mesa}</span>
                <span className="rounded-full bg-marca-50 px-2.5 py-0.5 text-xs font-medium text-marca-600 dark:bg-marca-800 dark:text-marca-100">
                  {ROTULO_ESTADO[pedido.estado] ?? pedido.estado}
                </span>
              </div>

              <ul className="mb-4 flex flex-col gap-1.5">
                {pedido.itens.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => alternarItem(pedido.id, item.id, item.estado)}
                      className={`toque flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                        item.estado === "PRONTO"
                          ? "bg-emerald-50 text-emerald-800 line-through dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "bg-slate-50 dark:bg-slate-900"
                      }`}
                    >
                      <span>
                        {item.quantidade}× {item.nome}
                        {item.notas && (
                          <span className="ml-1 italic text-slate-500">({item.notas})</span>
                        )}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>

              {pedido.estado !== "PRONTO" && (
                <button
                  onClick={() => avancarPedido(pedido.id, pedido.estado)}
                  className="toque w-full rounded-lg bg-marca-500 text-sm font-medium text-white hover:bg-marca-600"
                >
                  {pedido.estado === "ENVIADO" ? "Iniciar preparação" : "Marcar entregue"}
                </button>
              )}
              {pedido.estado === "PRONTO" && (
                <button
                  onClick={() => avancarPedido(pedido.id, pedido.estado)}
                  className="toque w-full rounded-lg bg-emerald-600 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  Marcar entregue
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
