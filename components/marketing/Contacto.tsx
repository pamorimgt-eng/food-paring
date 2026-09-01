/** Sem backend de captação de leads ainda — o CTA abre o cliente de email. */
const EMAIL_CONTACTO = "geral@xicosabido.pt";

export function Contacto() {
  return (
    <section id="contacto" className="bg-marca-preto py-16 text-white md:py-20">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-marca-300">
          Vamos conversar
        </p>
        <h2 className="text-2xl font-extrabold uppercase tracking-tight sm:text-3xl">
          Peça uma demonstração para o seu restaurante
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-white/70">
          Conte-nos o nome do restaurante e o melhor contacto — respondemos
          para combinar uma demonstração à medida da sua carta.
        </p>
        <a
          href={`mailto:${EMAIL_CONTACTO}?subject=${encodeURIComponent("Demonstração — Mesa do Xico")}`}
          className="toque mt-8 inline-flex items-center rounded-lg bg-marca-500 px-6 text-base font-semibold text-white shadow-lg shadow-marca-500/30 transition-colors hover:bg-marca-600"
        >
          {EMAIL_CONTACTO}
        </a>
      </div>
    </section>
  );
}
