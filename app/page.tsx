import type { Metadata } from "next";
import { Cabecalho } from "@/components/marketing/Cabecalho";
import { Hero } from "@/components/marketing/Hero";
import { Estatisticas } from "@/components/marketing/Estatisticas";
import { Funcionalidade } from "@/components/marketing/Funcionalidade";
import {
  VisualMenu,
  VisualPedidos,
  VisualMotor,
  VisualFicha,
  VisualEquipa,
} from "@/components/marketing/Visuais";
import { ComoFunciona } from "@/components/marketing/ComoFunciona";
import { Audiencias } from "@/components/marketing/Audiencias";
import { Precos } from "@/components/marketing/Precos";
import { Faq } from "@/components/marketing/Faq";
import { Contacto } from "@/components/marketing/Contacto";
import { Rodape } from "@/components/marketing/Rodape";

const TITULO = "Comanda Digital | Comanda para restaurantes com sugestão automática de vinhos";
const DESCRICAO =
  "Substitua o papel na sala e aumente a venda de vinho com sugestões automáticas geradas por IA a partir do prato pedido. Comanda digital, harmonização inteligente e gestão de menu num só sistema.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  keywords: [
    "comanda digital",
    "software para restaurantes",
    "harmonização de vinhos",
    "sugestão de vinho IA",
    "gestão de menu restaurante",
    "KDS cozinha",
    "wine pairing",
  ],
  openGraph: {
    title: TITULO,
    description: DESCRICAO,
    type: "website",
    locale: "pt_PT",
  },
  twitter: {
    card: "summary_large_image",
    title: TITULO,
    description: DESCRICAO,
  },
  alternates: {
    canonical: "/",
  },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Comanda Digital",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description: DESCRICAO,
  offers: {
    "@type": "Offer",
    priceSpecification: {
      "@type": "PriceSpecification",
      price: "0",
      priceCurrency: "EUR",
      description: "Preço ajustado por proposta — contacte para uma cotação.",
    },
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <Cabecalho />
      <main>
        <Hero />
        <Estatisticas />

        <Funcionalidade
          etiqueta="Software de gestão de menu"
          titulo="Carregue a carta uma vez, pronta em minutos"
          descricao="Uma foto do menu e da carta de vinhos, e a IA extrai tudo — pratos, preços, secções. Um ecrã de revisão garante que nada é gravado sem confirmação do gerente."
          pontos={[
            "Tire uma foto ao menu e à carta de vinhos — a IA lê tudo por si",
            "Reveja e corrija antes de gravar — nada entra sem confirmação",
            "Adicione um prato ou vinho novo a qualquer momento, sem foto nenhuma",
          ]}
          visual={<VisualMenu />}
        />

        <Funcionalidade
          etiqueta="Software de gestão de pedidos"
          titulo="Organize os pedidos da sala à cozinha"
          descricao="Autocomplete inteligente ao escrever o prato, pedidos especiais num toque, e tudo chega à cozinha instantaneamente — sem papel a perder-se pelo caminho."
          pontos={[
            'Autocomplete insensível a acentos — "arroz" encontra "Arroz de Pato"',
            'Pedidos especiais num toque, como "sem batata frita"',
            "Chega à cozinha em tempo real, com o estado do pedido sempre visível",
          ]}
          visual={<VisualPedidos />}
          invertido
        />

        <Funcionalidade
          etiqueta="Motor de harmonização"
          titulo="O vinho certo, sem depender de memória"
          descricao="O motor analisa a composição do prato — proteína, gordura, intensidade — e cruza com a ficha técnica de cada vinho da carta, para sugerir três opções por preço."
          pontos={[
            "Três sugestões por banda de preço: económico, médio e premium",
            "Argumentos de venda prontos a dizer ao cliente, sem jargão de sommelier",
            "Cálculo instantâneo à mesa — a análise pesada já correu no carregamento",
          ]}
          visual={<VisualMotor />}
          escuro
        />

        <Funcionalidade
          etiqueta="Confiança na ficha técnica"
          titulo="Nunca inventa o que não sabe"
          descricao="A ficha de cada vinho é pesquisada com fontes citadas. O que não é possível confirmar fica sinalizado — e vira uma pergunta simples ao gerente, nunca um palpite silencioso."
          pontos={[
            "Pesquisa a ficha técnica de cada vinho com fontes citadas",
            "Sinaliza o que tem confiança baixa, em vez de arriscar",
            "Pergunta ao gerente em linguagem simples — «Não sei» é sempre válido",
          ]}
          visual={<VisualFicha />}
          invertido
        />

        <Funcionalidade
          etiqueta="Gestão da equipa"
          titulo="O restaurante na palma da mão"
          descricao="Cada funcionário entra com um PIN de 4 dígitos, sem palavras-passe a decorar. Cada papel só vê a área que precisa — sala, cozinha ou backoffice."
          pontos={[
            "Acesso por PIN, pensado para quem está a meio de turno",
            "Sala, cozinha e backoffice — cada papel só vê o que precisa",
            "Adicione ou remova o acesso de um funcionário em segundos",
          ]}
          visual={<VisualEquipa />}
        />

        <ComoFunciona />
        <Audiencias />
        <Precos />
        <Faq />
        <Contacto />
      </main>
      <Rodape />
    </>
  );
}
