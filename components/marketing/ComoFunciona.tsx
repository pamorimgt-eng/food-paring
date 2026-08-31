const PASSOS = [
  {
    numero: "1",
    titulo: "Carregue a carta",
    descricao: "Foto do menu e da carta de vinhos, ou adicione item a item. A IA lê, o gerente confirma.",
  },
  {
    numero: "2",
    titulo: "Registe o pedido",
    descricao: "Autocomplete por mesa, pedidos especiais num toque, sugestão de vinho na hora.",
  },
  {
    numero: "3",
    titulo: "A cozinha recebe tudo",
    descricao: "Em tempo real, sem papel a perder-se entre a sala e a cozinha.",
  },
];

export function ComoFunciona() {
  return (
    <section id="como-funciona" className="bg-marca-preto py-16 text-white md:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-marca-300">
            Sem integrações complicadas
          </p>
          <h2 className="text-2xl font-extrabold uppercase tracking-tight sm:text-3xl">
            Como funciona, em três passos
          </h2>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {PASSOS.map((p) => (
            <div key={p.numero} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <span className="text-3xl font-extrabold text-marca-400">{p.numero}</span>
              <p className="mt-3 font-semibold">{p.titulo}</p>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{p.descricao}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
