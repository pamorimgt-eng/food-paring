"use client";

import Link from "next/link";
import { useState } from "react";

const LIGACOES = [
  { href: "#como-funciona", texto: "Como funciona" },
  { href: "#funcionalidades", texto: "Funcionalidades" },
  { href: "#precos", texto: "Preços" },
  { href: "#faq", texto: "FAQ" },
];

export function Cabecalho() {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-marca-creme/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-1.5 text-base font-bold tracking-tight whitespace-nowrap text-marca-preto sm:gap-2 sm:text-lg"
        >
          <span aria-hidden>🍷</span>
          Mesa do Xico
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-marca-preto/80 md:flex">
          {LIGACOES.map((l) => (
            <a key={l.href} href={l.href} className="transition-colors hover:text-marca-500">
              {l.texto}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/portal"
            className="toque hidden items-center rounded-lg px-4 text-sm font-medium text-marca-preto hover:bg-black/5 md:inline-flex"
          >
            Iniciar sessão
          </Link>
          <a
            href="#contacto"
            className="toque hidden items-center rounded-lg bg-marca-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-marca-600 md:inline-flex"
          >
            Pedir demonstração
          </a>

          {/* Só em ecrãs pequenos: o botão de ação e o menu não cabem lado a
              lado com folga suficiente para toque — um só ponto de entrada
              (o hambúrguer) é mais claro do que dois CTAs espremidos. */}
          <button
            onClick={() => setMenuAberto((atual) => !atual)}
            className="toque inline-flex items-center justify-center rounded-lg text-marca-preto md:hidden"
            aria-expanded={menuAberto}
            aria-controls="menu-mobile"
            aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
          >
            {menuAberto ? (
              <span className="text-2xl leading-none">✕</span>
            ) : (
              <span className="flex flex-col gap-1.5" aria-hidden>
                <span className="block h-0.5 w-6 bg-marca-preto" />
                <span className="block h-0.5 w-6 bg-marca-preto" />
                <span className="block h-0.5 w-6 bg-marca-preto" />
              </span>
            )}
          </button>
        </div>
      </div>

      {menuAberto && (
        <nav
          id="menu-mobile"
          className="border-t border-black/5 bg-marca-creme px-4 py-4 md:hidden"
        >
          <ul className="flex flex-col gap-1">
            {LIGACOES.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setMenuAberto(false)}
                  className="toque flex items-center rounded-lg px-3 text-base font-medium text-marca-preto hover:bg-black/5"
                >
                  {l.texto}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-col gap-2 border-t border-black/5 pt-3">
            <Link
              href="/portal"
              onClick={() => setMenuAberto(false)}
              className="toque flex items-center justify-center rounded-lg border border-marca-preto/15 text-base font-semibold text-marca-preto"
            >
              Iniciar sessão
            </Link>
            <a
              href="#contacto"
              onClick={() => setMenuAberto(false)}
              className="toque flex items-center justify-center rounded-lg bg-marca-500 text-base font-semibold text-white"
            >
              Pedir demonstração
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
