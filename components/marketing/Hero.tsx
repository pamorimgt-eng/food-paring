import { MockupComanda } from "./MockupComanda";

export function Hero() {
  return (
    <section className="overflow-hidden bg-marca-creme">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-2 md:items-center md:py-24">
        <div>
          <p className="mb-4 text-sm font-bold uppercase tracking-widest text-marca-500">
            Comanda digital para restaurantes
          </p>
          <h1 className="text-4xl font-extrabold uppercase leading-[1.05] tracking-tight text-marca-preto sm:text-5xl">
            Transforme cada pedido numa oportunidade de venda de vinho
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-marca-preto/70">
            A comanda digital que substitui o papel e sugere automaticamente o
            vinho certo para cada prato — com os argumentos de venda já
            escritos, para que o empregado não precise de ser sommelier.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#contacto"
              className="toque inline-flex items-center rounded-lg bg-marca-500 px-6 text-base font-semibold text-white shadow-lg shadow-marca-500/20 transition-colors hover:bg-marca-600"
            >
              Pedir demonstração
            </a>
            <a
              href="#como-funciona"
              className="toque inline-flex items-center rounded-lg border border-marca-preto/15 px-6 text-base font-semibold text-marca-preto transition-colors hover:bg-black/5"
            >
              Ver como funciona
            </a>
          </div>
        </div>

        <MockupComanda />
      </div>
    </section>
  );
}
