"use client";

import { useState } from "react";

const PERGUNTAS = [
  {
    pergunta: "Preciso de trocar o meu sistema de pedidos (POS) atual?",
    resposta:
      "Hoje o Mesa do Xico funciona como o sistema de comanda e cozinha do restaurante — não se liga a um POS existente. Se já usa um POS para pagamentos, os dois podem correr lado a lado.",
  },
  {
    pergunta: "Quanto tempo demora a carregar o menu e a carta de vinhos?",
    resposta:
      "Normalmente minutos: tira uma foto a cada um, a IA extrai os itens e mostra um ecrã de revisão antes de gravar. Também pode adicionar pratos e vinhos um a um, sem foto nenhuma.",
  },
  {
    pergunta: "A IA pode enganar-se na sugestão de vinho?",
    resposta:
      "Pode, como qualquer sistema. Por isso cada ficha de vinho tem um nível de confiança, e o que não é confirmado por uma fonte fica sinalizado — em vez de inventar, o sistema pergunta ao gerente.",
  },
  {
    pergunta: "A equipa precisa de formação para usar?",
    resposta:
      "O objetivo é que não precise: entrada por PIN de 4 dígitos, autocomplete ao escrever o prato, e a sugestão de vinho já vem com os argumentos escritos.",
  },
  {
    pergunta: "Funciona em telemóvel e tablet?",
    resposta:
      "Sim — é desenhado primeiro para telemóvel, pensado para quem está a meio de um turno com o aparelho numa mão.",
  },
];

export function Faq() {
  const [aberta, setAberta] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-marca-creme py-16 md:py-20">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-10 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-marca-500">FAQ</p>
          <h2 className="text-2xl font-extrabold uppercase tracking-tight text-marca-preto sm:text-3xl">
            Perguntas frequentes
          </h2>
        </div>

        <div className="space-y-3">
          {PERGUNTAS.map((item, i) => {
            const estaAberta = aberta === i;
            return (
              <div key={item.pergunta} className="rounded-xl border border-black/10 bg-white">
                <button
                  onClick={() => setAberta(estaAberta ? null : i)}
                  className="toque flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={estaAberta}
                >
                  <span className="font-medium text-marca-preto">{item.pergunta}</span>
                  <span
                    className={`shrink-0 text-marca-500 transition-transform ${estaAberta ? "rotate-45" : ""}`}
                    aria-hidden
                  >
                    +
                  </span>
                </button>
                {estaAberta && (
                  <p className="px-5 pb-4 text-sm leading-relaxed text-marca-preto/70">{item.resposta}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
