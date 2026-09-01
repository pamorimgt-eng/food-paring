/**
 * Projeções, não resultados — ainda não há clientes com dados reais para
 * mostrar. Cada número vem rotulado como estimativa e explica o raciocínio
 * por trás, para não parecer um resultado comprovado que ainda não existe.
 */
const PROJECOES = [
  {
    numero: "+20–30%",
    titulo: "Projeção de venda de vinho",
    descricao:
      "Estimativa para uma sugestão automática, com argumentos prontos, em cada mesa — a validar com os primeiros restaurantes piloto.",
  },
  {
    numero: "-70%",
    titulo: "Projeção de erros de comanda",
    descricao: "Menos transcrição à mão entre a sala e a cozinha, menos mal-entendidos no pedido.",
  },
  {
    numero: "-80%",
    titulo: "Projeção de tempo de onboarding",
    descricao: "Carregar o menu e a carta por foto, em vez de introduzir prato a prato à mão.",
  },
];

export function Projecoes() {
  return (
    <section className="border-y border-black/5 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <p className="mb-8 text-center text-xs text-marca-preto/40 sm:text-left">
          Projeções baseadas no desenho do produto — ainda sem dados de clientes reais para confirmar.
        </p>
        <div className="grid gap-8 sm:grid-cols-3">
          {PROJECOES.map((f) => (
            <div key={f.titulo} className="text-center sm:text-left">
              <p className="text-4xl font-extrabold text-marca-500">{f.numero}</p>
              <p className="mt-2 font-semibold text-marca-preto">{f.titulo}</p>
              <p className="mt-1 text-sm leading-relaxed text-marca-preto/60">{f.descricao}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
