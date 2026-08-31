export function Precos() {
  return (
    <section id="precos" className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-marca-500">Preços</p>
        <h2 className="text-2xl font-extrabold uppercase tracking-tight text-marca-preto sm:text-3xl">
          Um plano ajustado ao seu restaurante
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-marca-preto/70">
          Cada casa tem uma carta de vinhos e um volume de pedidos diferente —
          por isso preferimos conversar antes de apresentar um preço. Conte-nos
          sobre o seu restaurante e enviamos uma proposta.
        </p>
        <a
          href="#contacto"
          className="toque mt-8 inline-flex items-center rounded-lg bg-marca-500 px-6 text-base font-semibold text-white shadow-lg shadow-marca-500/20 transition-colors hover:bg-marca-600"
        >
          Pedir proposta
        </a>
      </div>
    </section>
  );
}
