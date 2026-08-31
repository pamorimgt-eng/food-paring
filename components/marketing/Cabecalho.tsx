import Link from "next/link";

const LIGACOES = [
  { href: "#como-funciona", texto: "Como funciona" },
  { href: "#funcionalidades", texto: "Funcionalidades" },
  { href: "#precos", texto: "Preços" },
  { href: "#faq", texto: "FAQ" },
];

export function Cabecalho() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-marca-creme/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-1.5 text-base font-bold tracking-tight whitespace-nowrap text-marca-preto sm:gap-2 sm:text-lg"
        >
          <span aria-hidden>🍷</span>
          Comanda Digital
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
            className="toque hidden items-center rounded-lg px-4 text-sm font-medium text-marca-preto hover:bg-black/5 sm:inline-flex"
          >
            Iniciar sessão
          </Link>
          <a
            href="#contacto"
            className="toque inline-flex items-center rounded-lg bg-marca-500 px-3 text-sm font-semibold text-white transition-colors hover:bg-marca-600 sm:px-4"
          >
            <span className="hidden sm:inline">Pedir demonstração</span>
            <span className="sm:hidden">Demonstração</span>
          </a>
        </div>
      </div>
    </header>
  );
}
