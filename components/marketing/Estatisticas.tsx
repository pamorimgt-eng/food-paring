/**
 * Sem produto ainda em clientes reais, não há estatísticas de resultado para
 * mostrar com honestidade (ex: "25% mais receita") — seriam inventadas.
 * Em vez disso, três factos verificáveis sobre como o produto funciona.
 */
const FACTOS = [
  {
    numero: "< 3 seg",
    titulo: "Da comanda à sugestão",
    descricao: "A IA já correu no carregamento do menu — à mesa é só uma consulta instantânea.",
  },
  {
    numero: "Minutos",
    titulo: "Para carregar a carta",
    descricao: "Foto do menu e da carta de vinhos — a IA lê, o gerente confirma.",
  },
  {
    numero: "Zero",
    titulo: "Sommeliers na equipa",
    descricao: "Os argumentos de venda já vêm escritos, prontos a dizer ao cliente.",
  },
];

export function Estatisticas() {
  return (
    <section className="border-y border-black/5 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-14 sm:grid-cols-3">
        {FACTOS.map((f) => (
          <div key={f.titulo} className="text-center sm:text-left">
            <p className="text-4xl font-extrabold text-marca-500">{f.numero}</p>
            <p className="mt-2 font-semibold text-marca-preto">{f.titulo}</p>
            <p className="mt-1 text-sm leading-relaxed text-marca-preto/60">{f.descricao}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
