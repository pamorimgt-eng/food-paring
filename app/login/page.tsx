"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const DESTINO_POR_PAPEL: Record<string, string> = {
  ADMIN: "/backoffice",
  SALA: "/sala",
  COZINHA: "/cozinha",
};

export default function LoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [aEntrar, setAEntrar] = useState(false);

  async function tentarEntrar(pinCompleto: string) {
    setAEntrar(true);
    setErro(null);
    try {
      const resp = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pinCompleto }),
      });
      const dados = await resp.json();
      if (!resp.ok) {
        setErro(dados.erro ?? "PIN incorreto.");
        setPin("");
        return;
      }
      router.push(DESTINO_POR_PAPEL[dados.papel] ?? "/");
      router.refresh();
    } finally {
      setAEntrar(false);
    }
  }

  function premir(digito: string) {
    if (aEntrar) return;
    const novo = (pin + digito).slice(0, 4);
    setPin(novo);
    setErro(null);
    if (novo.length === 4) tentarEntrar(novo);
  }

  function apagar() {
    setPin((atual) => atual.slice(0, -1));
    setErro(null);
  }

  return (
    <main className="mx-auto flex min-h-full max-w-xs flex-col items-center justify-center px-6 py-16">
      <h1 className="mb-1 text-xl font-semibold">Mesa do Xico</h1>
      <p className="mb-8 text-sm text-slate-600 dark:text-slate-400">Introduz o teu PIN</p>

      <div className="mb-6 flex gap-3" aria-live="polite">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-3.5 w-3.5 rounded-full border-2 ${
              i < pin.length
                ? "border-vinho-700 bg-vinho-700"
                : "border-slate-300 dark:border-slate-600"
            }`}
          />
        ))}
      </div>

      {erro && <p className="mb-4 text-sm text-red-600">{erro}</p>}

      <div className="grid grid-cols-3 gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((n) => (
          <button
            key={n}
            onClick={() => premir(n)}
            disabled={aEntrar}
            className="toque h-16 w-16 rounded-full text-xl font-medium hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800"
          >
            {n}
          </button>
        ))}
        <span />
        <button
          onClick={() => premir("0")}
          disabled={aEntrar}
          className="toque h-16 w-16 rounded-full text-xl font-medium hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800"
        >
          0
        </button>
        <button
          onClick={apagar}
          disabled={aEntrar}
          className="toque h-16 w-16 rounded-full text-lg text-slate-500 hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800"
          aria-label="Apagar"
        >
          ⌫
        </button>
      </div>
    </main>
  );
}
