/** Painéis ilustrativos simples, construídos em CSS — sem imagens externas. */
import type { ReactNode } from "react";

function Cartao({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-black/10 bg-white p-6 shadow-xl shadow-black/5 ${className}`}>
      {children}
    </div>
  );
}

export function VisualMenu() {
  return (
    <Cartao>
      <div className="flex items-center gap-2 border-b border-dashed border-black/10 pb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-marca-creme text-lg">
          📷
        </div>
        <div>
          <p className="text-sm font-semibold text-marca-preto">Foto do menu</p>
          <p className="text-xs text-marca-preto/50">A processar…</p>
        </div>
      </div>
      <ul className="mt-3 space-y-2 text-sm">
        {["Bacalhau à Lagareiro — 18,50 €", "Arroz de Pato — 16,00 €", "Cabrito Assado — 20,00 €"].map(
          (item) => (
            <li key={item} className="flex items-center justify-between rounded-lg bg-marca-creme/50 px-3 py-2">
              <span className="text-marca-preto/80">{item}</span>
              <span className="text-xs font-medium text-emerald-700">✓ lido</span>
            </li>
          ),
        )}
      </ul>
    </Cartao>
  );
}

export function VisualPedidos() {
  return (
    <Cartao>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-marca-preto/40">
        Procurar prato…
      </p>
      <div className="mb-3 rounded-lg border border-marca-300 px-3 py-2 text-sm text-marca-preto/70">
        arroz
      </div>
      <div className="space-y-2">
        <div className="rounded-lg bg-marca-creme/60 px-3 py-2 text-sm font-medium text-marca-preto">
          Arroz de Pato
        </div>
        <div className="rounded-lg bg-marca-500 px-3 py-2 text-sm font-medium text-white">
          Enviado para a cozinha ✓
        </div>
      </div>
    </Cartao>
  );
}

export function VisualMotor() {
  return (
    <div className="grid grid-cols-3 gap-3 rounded-2xl bg-white/5 p-6">
      {[
        { banda: "Económico", preco: "14 €" },
        { banda: "Médio", preco: "22 €" },
        { banda: "Premium", preco: "32 €" },
      ].map((v) => (
        <div key={v.banda} className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-marca-300">{v.banda}</p>
          <p className="mt-2 text-lg font-bold text-white">{v.preco}</p>
        </div>
      ))}
    </div>
  );
}

export function VisualFicha() {
  return (
    <Cartao>
      <p className="text-sm font-semibold text-marca-preto">Quinta do Crasto Reserva 2019</p>
      <div className="mt-3 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-marca-preto/60">Castas</span>
          <span className="font-medium text-marca-preto">Touriga Nacional, Tinta Roriz</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-marca-preto/60">Estágio em barrica</span>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-800">
            a confirmar
          </span>
        </div>
      </div>
      <div className="mt-4 rounded-lg bg-marca-creme/60 px-3 py-2 text-xs text-marca-preto/70">
        "Não encontrei se estagiou em barrica" → pergunta ao gerente
      </div>
    </Cartao>
  );
}

export function VisualEquipa() {
  return (
    <Cartao className="mx-auto max-w-xs">
      <p className="mb-3 text-center text-sm font-semibold text-marca-preto">Introduz o teu PIN</p>
      <div className="mb-4 flex justify-center gap-2">
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className="h-3 w-3 rounded-full bg-marca-500" />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <div key={n} className="rounded-lg bg-marca-creme/60 py-2 text-center text-sm font-medium text-marca-preto/70">
            {n}
          </div>
        ))}
      </div>
    </Cartao>
  );
}
