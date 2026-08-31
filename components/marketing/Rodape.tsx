const COLUNAS = [
  {
    titulo: "Produto",
    links: [
      { href: "#como-funciona", texto: "Como funciona" },
      { href: "#funcionalidades", texto: "Funcionalidades" },
      { href: "#precos", texto: "Preços" },
      { href: "#faq", texto: "FAQ" },
    ],
  },
  {
    titulo: "Acesso",
    links: [
      { href: "/portal", texto: "Iniciar sessão" },
      { href: "#contacto", texto: "Pedir demonstração" },
    ],
  },
];

export function Rodape() {
  return (
    <footer className="bg-white py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-10 sm:grid-cols-[2fr_1fr_1fr]">
          <div>
            <p className="flex items-center gap-2 text-lg font-bold text-marca-preto">
              <span aria-hidden>🍷</span>
              Comanda Digital
            </p>
            <p className="mt-2 max-w-xs text-sm text-marca-preto/60">
              Comanda digital com sugestão automática de vinhos, feita para
              restaurantes portugueses.
            </p>
          </div>

          {COLUNAS.map((coluna) => (
            <div key={coluna.titulo}>
              <p className="text-sm font-semibold text-marca-preto">{coluna.titulo}</p>
              <ul className="mt-3 space-y-2">
                {coluna.links.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} className="text-sm text-marca-preto/60 hover:text-marca-500">
                      {l.texto}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-black/5 pt-6 text-xs text-marca-preto/40">
          © {new Date().getFullYear()} Comanda Digital. Feito em Portugal 🇵🇹
        </div>
      </div>
    </footer>
  );
}
