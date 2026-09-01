"use client";

import { useRouter } from "next/navigation";

export function BotaoSair({ nome }: { nome: string }) {
  const router = useRouter();

  async function sair() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={sair}
      className="toque flex items-center gap-1.5 rounded-lg px-2 text-sm text-slate-500 hover:text-marca-500 dark:text-slate-400"
    >
      {nome}
      <span className="text-xs">· Sair</span>
    </button>
  );
}
