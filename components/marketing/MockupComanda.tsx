/**
 * Representação estilizada do ecrã real da sala — não é uma captura de
 * ecrã, é uma maquete construída em HTML/CSS com o conteúdo real do
 * produto (nomes de pratos e vinhos da app), para a home de marketing não
 * depender de screenshots que ficam desatualizados a cada mudança de UI.
 */
export function MockupComanda() {
  return (
    <div className="relative mx-auto w-full max-w-lg select-none">
      <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-marca-500/10 blur-2xl" aria-hidden />

      <div className="rotate-[-2deg] rounded-3xl border border-black/10 bg-white p-5 shadow-2xl shadow-black/20 transition-transform hover:rotate-0">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-marca-preto">Mesa 4</span>
          <span className="rounded-full bg-marca-creme px-2.5 py-0.5 text-xs font-medium text-marca-700">
            Sala
          </span>
        </div>

        <div className="mb-4 rounded-xl bg-marca-creme/60 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-marca-preto/50">Pedido</p>
          <p className="mt-1 text-sm font-semibold text-marca-preto">1× Cabrito Assado no Forno</p>
          <p className="text-xs text-marca-preto/60">Sem batata frita</p>
        </div>

        <div className="rounded-xl border border-marca-200 bg-marca-50 p-3">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-marca-600">
              Sugestão · Médio
            </span>
            <span className="text-xs font-semibold text-marca-preto">28,00 €</span>
          </div>
          <p className="text-sm font-semibold text-marca-preto">Quinta do Crasto Reserva 2019</p>
          <ul className="mt-1.5 space-y-1 text-xs leading-snug text-marca-preto/70">
            <li>· Corpo encorpado acompanha a intensidade da carne</li>
            <li>· Estágio em barrica equilibra a untuosidade do prato</li>
          </ul>
        </div>

        <div className="mt-4 rounded-lg bg-marca-preto py-2.5 text-center text-xs font-semibold text-white">
          Enviar para a cozinha
        </div>
      </div>

      <div className="absolute -bottom-6 -right-4 w-40 rotate-[4deg] rounded-2xl border border-black/10 bg-white p-3 shadow-xl shadow-black/10 sm:-right-10 sm:w-48">
        <p className="text-[10px] font-bold uppercase tracking-wider text-marca-preto/40">Cozinha</p>
        <p className="mt-1 text-xs font-semibold text-marca-preto">Mesa 4 · Novo</p>
        <p className="text-[11px] text-marca-preto/60">1× Cabrito Assado no Forno</p>
      </div>
    </div>
  );
}
