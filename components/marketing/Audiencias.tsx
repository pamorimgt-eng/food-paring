const CARTOES = [
  {
    titulo: "Para donos de restaurante",
    descricao:
      "Gerir o menu, a carta de vinhos e a equipa a partir de um só backoffice — sem depender de ninguém saber tudo de cor.",
    cta: "Explore o Backoffice",
  },
  {
    titulo: "Para a equipa de sala",
    descricao:
      "Registar pedidos, tratar de pedidos especiais e sugerir o vinho certo sem precisar de ser sommelier.",
    cta: "Explore a Comanda",
  },
];

export function Audiencias() {
  return (
    <section id="funcionalidades" className="bg-marca-creme py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-10 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-marca-500">
            Uma ferramenta, duas equipas
          </p>
          <h2 className="text-2xl font-extrabold uppercase tracking-tight text-marca-preto sm:text-3xl">
            Feito para quem gere e para quem serve
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {CARTOES.map((c) => (
            <div key={c.titulo} className="rounded-2xl border border-black/10 bg-white p-8">
              <h3 className="text-lg font-bold text-marca-preto">{c.titulo}</h3>
              <p className="mt-3 text-sm leading-relaxed text-marca-preto/70">{c.descricao}</p>
              <a
                href="#contacto"
                className="toque mt-5 inline-flex items-center gap-1 text-sm font-semibold text-marca-500 hover:text-marca-600"
              >
                {c.cta} →
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
