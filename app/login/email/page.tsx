"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

const DESTINO_POR_PAPEL: Record<string, string> = {
  ADMIN: "/backoffice",
  SALA: "/sala",
  COZINHA: "/cozinha",
};

export default function LoginEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [aEntrar, setAEntrar] = useState(false);

  async function submeter(e: React.FormEvent) {
    e.preventDefault();
    setAEntrar(true);
    setErro(null);
    try {
      const resp = await fetch("/api/auth/login-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const dados = await resp.json();
      if (!resp.ok) {
        setErro(dados.erro ?? "Não foi possível entrar.");
        return;
      }
      router.push(DESTINO_POR_PAPEL[dados.papel] ?? "/");
      router.refresh();
    } finally {
      setAEntrar(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-full max-w-sm flex-col justify-center px-6 py-16">
      <div className="mb-8 text-center">
        <p className="mb-1 flex items-center justify-center gap-2 text-lg font-bold text-marca-preto">
          <span aria-hidden>🍷</span>
          Mesa do Xico
        </p>
        <p className="text-sm text-marca-preto/60">Entrar com email</p>
      </div>

      <form onSubmit={submeter} className="flex flex-col gap-3">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-marca-preto">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="toque w-full rounded-lg border border-black/15 px-4 text-base focus:border-marca-500 focus:outline-none"
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-marca-preto">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="toque w-full rounded-lg border border-black/15 px-4 text-base focus:border-marca-500 focus:outline-none"
            autoComplete="current-password"
          />
        </div>

        {erro && <p className="text-sm text-marca-500">{erro}</p>}

        <button
          type="submit"
          disabled={aEntrar}
          className="toque mt-2 rounded-lg bg-marca-500 font-semibold text-white transition-colors hover:bg-marca-600 disabled:opacity-50"
        >
          {aEntrar ? "A entrar…" : "Entrar"}
        </button>
      </form>

      <Link
        href="/login"
        className="toque mt-6 flex items-center justify-center text-sm text-marca-preto/50 hover:text-marca-500"
      >
        Sou da equipa de sala/cozinha — entrar com PIN
      </Link>
    </main>
  );
}
