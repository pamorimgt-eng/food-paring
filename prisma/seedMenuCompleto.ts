import { PrismaClient, type TipoVinho, type Confianca } from "@prisma/client";
import { regenerarPairingsSemIA } from "../lib/orquestracao";

const prisma = new PrismaClient();

/**
 * Menu e carta de teste para o almoço de hoje. Os atributos vão já escritos
 * à mão (não pela IA) — corre sem gastar crédito nenhum, e o pairing sai a
 * seguir pelo motor de regras (lib/pairingRegras.ts). Sempre que a IA
 * estiver disponível, isto pode ser substituído por fotos reais da carta.
 */

type AtributosPrato = {
  proteinas: string[];
  metodosConfecao: string[];
  condimentos: string[];
  intensidade: "leve" | "media" | "intensa";
  gordura: "baixa" | "media" | "alta";
  acidez: "baixa" | "media" | "alta";
  picante: "nenhum" | "ligeiro" | "medio" | "intenso";
  doce: "nenhum" | "ligeiro" | "medio" | "alto";
  textura: string;
  notas: string;
};

type Prato = {
  nome: string;
  seccao: "Entradas" | "Principais" | "Sobremesas";
  preco: number;
  atributos: AtributosPrato;
};

type AtributosVinho = {
  corpo: "leve" | "medio" | "encorpado";
  acidez: "baixa" | "media" | "alta";
  taninos: "baixos" | "medios" | "altos" | "nao_aplicavel";
  doceza: "seco" | "meio_seco" | "meio_doce" | "doce";
  estagioBarrica: boolean;
  mesesBarrica: number | null;
  teorAlcoolico: number;
  perfilAromatico: string[];
  temperaturaServico: string;
  notas: string;
};

type Vinho = {
  nome: string;
  produtor: string;
  ano: number;
  regiao: string;
  pais: string;
  castas: string[];
  tipo: TipoVinho;
  preco: number;
  atributos: AtributosVinho;
};

const PRATOS: Prato[] = [
  // --- Entradas ---
  {
    nome: "Presunto Ibérico com Melão",
    seccao: "Entradas",
    preco: 9.5,
    atributos: {
      proteinas: ["presunto"],
      metodosConfecao: ["cru", "curado"],
      condimentos: [],
      intensidade: "leve",
      gordura: "media",
      acidez: "baixa",
      picante: "nenhum",
      doce: "ligeiro",
      textura: "macia, fundente",
      notas: "Salgado e adocicado, textura fundente do presunto contra o melão fresco.",
    },
  },
  {
    nome: "Croquetes de Alheira",
    seccao: "Entradas",
    preco: 6.5,
    atributos: {
      proteinas: ["alheira", "porco"],
      metodosConfecao: ["frito"],
      condimentos: ["alho", "colorau"],
      intensidade: "media",
      gordura: "alta",
      acidez: "baixa",
      picante: "ligeiro",
      doce: "nenhum",
      textura: "estaladiça por fora, macia por dentro",
      notas: "Frito, gorduroso, sabor fumado da alheira.",
    },
  },
  {
    nome: "Camarão à Guilho",
    seccao: "Entradas",
    preco: 12.0,
    atributos: {
      proteinas: ["camarão", "marisco"],
      metodosConfecao: ["salteado"],
      condimentos: ["alho", "piri-piri", "coentros"],
      intensidade: "media",
      gordura: "media",
      acidez: "baixa",
      picante: "medio",
      doce: "nenhum",
      textura: "suculenta",
      notas: "Alho e piripiri marcados, azeite abundante.",
    },
  },
  {
    nome: "Salada de Polvo",
    seccao: "Entradas",
    preco: 13.5,
    atributos: {
      proteinas: ["polvo", "marisco"],
      metodosConfecao: ["cozido"],
      condimentos: ["azeite", "coentros", "vinagre"],
      intensidade: "leve",
      gordura: "baixa",
      acidez: "media",
      picante: "nenhum",
      doce: "nenhum",
      textura: "macia",
      notas: "Fresca, com acidez do vinagrete a equilibrar.",
    },
  },
  {
    nome: "Queijo da Serra com Compota",
    seccao: "Entradas",
    preco: 8.5,
    atributos: {
      proteinas: ["queijo"],
      metodosConfecao: ["cru"],
      condimentos: [],
      intensidade: "media",
      gordura: "alta",
      acidez: "baixa",
      picante: "nenhum",
      doce: "medio",
      textura: "cremosa",
      notas: "Untuoso, amanteigado, doçura da compota de encontro ao queijo.",
    },
  },
  {
    nome: "Pão e Enchidos Regionais",
    seccao: "Entradas",
    preco: 10.0,
    atributos: {
      proteinas: ["chouriço", "presunto", "porco"],
      metodosConfecao: ["curado", "fumado"],
      condimentos: ["colorau", "alho"],
      intensidade: "media",
      gordura: "alta",
      acidez: "baixa",
      picante: "ligeiro",
      doce: "nenhum",
      textura: "firme",
      notas: "Fumado e salgado, gordura marcada dos enchidos.",
    },
  },

  // --- Principais ---
  {
    nome: "Bacalhau à Brás",
    seccao: "Principais",
    preco: 16.5,
    atributos: {
      proteinas: ["bacalhau", "peixe"],
      metodosConfecao: ["salteado"],
      condimentos: ["cebola", "azeitona"],
      intensidade: "media",
      gordura: "media",
      acidez: "baixa",
      picante: "nenhum",
      doce: "nenhum",
      textura: "cremosa, com batata palha estaladiça",
      notas: "Ovos e batata dão untuosidade; sabor a mar discreto.",
    },
  },
  {
    nome: "Bacalhau à Lagareiro",
    seccao: "Principais",
    preco: 18.5,
    atributos: {
      proteinas: ["bacalhau", "peixe"],
      metodosConfecao: ["assado"],
      condimentos: ["alho", "azeite"],
      intensidade: "media",
      gordura: "alta",
      acidez: "baixa",
      picante: "nenhum",
      doce: "nenhum",
      textura: "lascada, húmida",
      notas: "Muito azeite, sabor limpo do bacalhau assado.",
    },
  },
  {
    nome: "Arroz de Pato",
    seccao: "Principais",
    preco: 16.0,
    atributos: {
      proteinas: ["pato"],
      metodosConfecao: ["assado", "estufado"],
      condimentos: ["chouriço", "louro"],
      intensidade: "intensa",
      gordura: "alta",
      acidez: "baixa",
      picante: "nenhum",
      doce: "nenhum",
      textura: "malandrinho, gorduroso",
      notas: "Gordura do pato e do chouriço, sabor profundo e persistente.",
    },
  },
  {
    nome: "Polvo à Lagareiro",
    seccao: "Principais",
    preco: 21.0,
    atributos: {
      proteinas: ["polvo", "marisco"],
      metodosConfecao: ["assado"],
      condimentos: ["alho", "azeite"],
      intensidade: "media",
      gordura: "media",
      acidez: "baixa",
      picante: "nenhum",
      doce: "nenhum",
      textura: "tenra por dentro, tostada por fora",
      notas: "Azeite abundante, sabor a mar suave.",
    },
  },
  {
    nome: "Robalo Grelhado com Legumes",
    seccao: "Principais",
    preco: 19.5,
    atributos: {
      proteinas: ["robalo", "peixe"],
      metodosConfecao: ["grelhado"],
      condimentos: ["limão", "azeite"],
      intensidade: "leve",
      gordura: "baixa",
      acidez: "media",
      picante: "nenhum",
      doce: "nenhum",
      textura: "delicada, lascada",
      notas: "Sabor delicado, precisa de vinho que não o esmague.",
    },
  },
  {
    nome: "Francesinha",
    seccao: "Principais",
    preco: 12.5,
    atributos: {
      proteinas: ["vaca", "porco", "linguiça", "queijo"],
      metodosConfecao: ["frito", "gratinado"],
      condimentos: ["molho picante", "cerveja"],
      intensidade: "intensa",
      gordura: "alta",
      acidez: "baixa",
      picante: "medio",
      doce: "nenhum",
      textura: "molho denso, queijo derretido",
      notas: "Muito rica, molho picante e encorpado, queijo derretido por cima.",
    },
  },
  {
    nome: "Bife à Café",
    seccao: "Principais",
    preco: 15.0,
    atributos: {
      proteinas: ["vaca", "novilho"],
      metodosConfecao: ["grelhado"],
      condimentos: ["mostarda", "molho"],
      intensidade: "media",
      gordura: "media",
      acidez: "baixa",
      picante: "nenhum",
      doce: "nenhum",
      textura: "suculenta",
      notas: "Molho cremoso, sabor amanteigado.",
    },
  },
  {
    nome: "Cabrito Assado no Forno",
    seccao: "Principais",
    preco: 20.0,
    atributos: {
      proteinas: ["cabrito"],
      metodosConfecao: ["assado"],
      condimentos: ["alho", "louro", "vinho branco"],
      intensidade: "intensa",
      gordura: "alta",
      acidez: "baixa",
      picante: "nenhum",
      doce: "nenhum",
      textura: "tenra, estaladiça na pele",
      notas: "Gordura marcada, sabor profundo de carne assada longamente.",
    },
  },
  {
    nome: "Costeletas de Borrego Grelhadas",
    seccao: "Principais",
    preco: 22.0,
    atributos: {
      proteinas: ["borrego", "cordeiro"],
      metodosConfecao: ["grelhado"],
      condimentos: ["alecrim", "alho"],
      intensidade: "intensa",
      gordura: "media",
      acidez: "baixa",
      picante: "nenhum",
      doce: "nenhum",
      textura: "suculenta, fibrosa",
      notas: "Sabor de caça suave, aromas de ervas.",
    },
  },
  {
    nome: "Secretos de Porco Preto com Puré de Batata Doce",
    seccao: "Principais",
    preco: 18.0,
    atributos: {
      proteinas: ["porco", "secretos"],
      metodosConfecao: ["grelhado"],
      condimentos: ["alecrim"],
      intensidade: "media",
      gordura: "alta",
      acidez: "baixa",
      picante: "nenhum",
      doce: "ligeiro",
      textura: "suculenta, marmoreada",
      notas: "Gordura entremeada característica do porco preto, ligeiramente adocicado pelo puré.",
    },
  },
  {
    nome: "Feijoada à Transmontana",
    seccao: "Principais",
    preco: 15.5,
    atributos: {
      proteinas: ["porco", "chouriço", "feijão"],
      metodosConfecao: ["estufado"],
      condimentos: ["colorau", "louro"],
      intensidade: "intensa",
      gordura: "alta",
      acidez: "baixa",
      picante: "ligeiro",
      doce: "nenhum",
      textura: "densa, estufada",
      notas: "Prato de inverno, gordura marcada e sabor persistente.",
    },
  },

  // --- Sobremesas ---
  {
    nome: "Pastel de Nata",
    seccao: "Sobremesas",
    preco: 4.5,
    atributos: {
      proteinas: [],
      metodosConfecao: ["assado"],
      condimentos: ["canela"],
      intensidade: "leve",
      gordura: "media",
      acidez: "baixa",
      picante: "nenhum",
      doce: "medio",
      textura: "cremosa, massa estaladiça",
      notas: "Doce moderado, creme e massa folhada.",
    },
  },
  {
    nome: "Pudim Abade de Priscos",
    seccao: "Sobremesas",
    preco: 6.0,
    atributos: {
      proteinas: ["toucinho"],
      metodosConfecao: ["cozido em banho-maria"],
      condimentos: ["canela"],
      intensidade: "media",
      gordura: "media",
      acidez: "baixa",
      picante: "nenhum",
      doce: "alto",
      textura: "cremosa, densa",
      notas: "Muito doce, com um travo de toucinho e caramelo.",
    },
  },
  {
    nome: "Leite Creme Queimado",
    seccao: "Sobremesas",
    preco: 5.0,
    atributos: {
      proteinas: [],
      metodosConfecao: ["queimado"],
      condimentos: ["canela"],
      intensidade: "leve",
      gordura: "baixa",
      acidez: "baixa",
      picante: "nenhum",
      doce: "medio",
      textura: "cremosa, crosta estaladiça",
      notas: "Doce equilibrado, contraste entre creme e caramelo queimado.",
    },
  },
  {
    nome: "Mousse de Chocolate Negro",
    seccao: "Sobremesas",
    preco: 5.5,
    atributos: {
      proteinas: [],
      metodosConfecao: ["gelado"],
      condimentos: [],
      intensidade: "intensa",
      gordura: "media",
      acidez: "baixa",
      picante: "nenhum",
      doce: "alto",
      textura: "aerada, densa",
      notas: "Chocolate negro intenso, doce mas com amargor de fundo.",
    },
  },
  {
    nome: "Queijadas de Sintra",
    seccao: "Sobremesas",
    preco: 4.0,
    atributos: {
      proteinas: ["queijo fresco"],
      metodosConfecao: ["assado"],
      condimentos: ["canela"],
      intensidade: "leve",
      gordura: "media",
      acidez: "baixa",
      picante: "nenhum",
      doce: "medio",
      textura: "húmida, ligeiramente granulada",
      notas: "Doce discreto, sabor a queijo fresco.",
    },
  },
  {
    nome: "Arroz Doce com Canela",
    seccao: "Sobremesas",
    preco: 4.5,
    atributos: {
      proteinas: [],
      metodosConfecao: ["cozido"],
      condimentos: ["canela", "limão"],
      intensidade: "leve",
      gordura: "baixa",
      acidez: "baixa",
      picante: "nenhum",
      doce: "medio",
      textura: "cremosa",
      notas: "Simples e reconfortante, doce moderado.",
    },
  },
];

const VINHOS: Vinho[] = [
  {
    nome: "Vinho Verde",
    produtor: "Casa de Vila Verde",
    ano: 2023,
    regiao: "Vinho Verde",
    pais: "Portugal",
    castas: ["Loureiro", "Arinto"],
    tipo: "BRANCO",
    preco: 13.0,
    atributos: {
      corpo: "leve",
      acidez: "alta",
      taninos: "nao_aplicavel",
      doceza: "seco",
      estagioBarrica: false,
      mesesBarrica: null,
      teorAlcoolico: 10.5,
      perfilAromatico: ["citrinos", "flores brancas", "leve efervescência"],
      temperaturaServico: "8-10 °C",
      notas: "Fresco e leve, ideal para peixe e entradas.",
    },
  },
  {
    nome: "Alvarinho",
    produtor: "Quinta da Aveleda",
    ano: 2022,
    regiao: "Vinho Verde (Monção e Melgaço)",
    pais: "Portugal",
    castas: ["Alvarinho"],
    tipo: "BRANCO",
    preco: 19.0,
    atributos: {
      corpo: "medio",
      acidez: "alta",
      taninos: "nao_aplicavel",
      doceza: "seco",
      estagioBarrica: false,
      mesesBarrica: null,
      teorAlcoolico: 12.5,
      perfilAromatico: ["fruta tropical", "citrinos", "mineral"],
      temperaturaServico: "9-11 °C",
      notas: "Mais estrutura que um Vinho Verde comum, elegante.",
    },
  },
  {
    nome: "Bucelas Arinto",
    produtor: "Quinta da Romeira",
    ano: 2021,
    regiao: "Bucelas",
    pais: "Portugal",
    castas: ["Arinto"],
    tipo: "BRANCO",
    preco: 17.0,
    atributos: {
      corpo: "medio",
      acidez: "alta",
      taninos: "nao_aplicavel",
      doceza: "seco",
      estagioBarrica: false,
      mesesBarrica: null,
      teorAlcoolico: 12.5,
      perfilAromatico: ["maçã verde", "citrinos", "notas mentoladas"],
      temperaturaServico: "9-11 °C",
      notas: "Acidez vibrante, clássico com bacalhau e peixe gordo.",
    },
  },
  {
    nome: "Encruzado",
    produtor: "Quinta dos Roques",
    ano: 2021,
    regiao: "Dão",
    pais: "Portugal",
    castas: ["Encruzado"],
    tipo: "BRANCO",
    preco: 26.0,
    atributos: {
      corpo: "encorpado",
      acidez: "media",
      taninos: "nao_aplicavel",
      doceza: "seco",
      estagioBarrica: true,
      mesesBarrica: 6,
      teorAlcoolico: 13.0,
      perfilAromatico: ["fruta branca madura", "baunilha", "manteiga"],
      temperaturaServico: "10-12 °C",
      notas: "Branco de guarda, estágio em barrica dá volume e untuosidade.",
    },
  },
  {
    nome: "Rosé",
    produtor: "Bacalhôa",
    ano: 2023,
    regiao: "Península de Setúbal",
    pais: "Portugal",
    castas: ["Castelão"],
    tipo: "ROSE",
    preco: 12.0,
    atributos: {
      corpo: "leve",
      acidez: "media",
      taninos: "baixos",
      doceza: "seco",
      estagioBarrica: false,
      mesesBarrica: null,
      teorAlcoolico: 12.0,
      perfilAromatico: ["frutos vermelhos", "flores"],
      temperaturaServico: "8-10 °C",
      notas: "Leve e fresco, versátil para entradas e saladas.",
    },
  },
  {
    nome: "Regional Alentejano",
    produtor: "Monte da Ravasqueira",
    ano: 2021,
    regiao: "Alentejo",
    pais: "Portugal",
    castas: ["Aragonez", "Trincadeira", "Syrah"],
    tipo: "TINTO",
    preco: 15.0,
    atributos: {
      corpo: "medio",
      acidez: "media",
      taninos: "medios",
      doceza: "seco",
      estagioBarrica: false,
      mesesBarrica: null,
      teorAlcoolico: 13.5,
      perfilAromatico: ["frutos vermelhos maduros", "especiarias"],
      temperaturaServico: "16-18 °C",
      notas: "Macio e frutado, entrada de gama versátil.",
    },
  },
  {
    nome: "Quinta do Crasto Reserva",
    produtor: "Quinta do Crasto",
    ano: 2019,
    regiao: "Douro",
    pais: "Portugal",
    castas: ["Touriga Nacional", "Touriga Franca", "Tinta Roriz"],
    tipo: "TINTO",
    preco: 28.0,
    atributos: {
      corpo: "encorpado",
      acidez: "media",
      taninos: "altos",
      doceza: "seco",
      estagioBarrica: true,
      mesesBarrica: 12,
      teorAlcoolico: 14.0,
      perfilAromatico: ["frutos pretos", "especiarias", "tostado"],
      temperaturaServico: "16-18 °C",
      notas: "Encorpado e estruturado, acompanha carnes vermelhas intensas.",
    },
  },
  {
    nome: "Vinha Formal",
    produtor: "Luís Pato",
    ano: 2018,
    regiao: "Bairrada",
    pais: "Portugal",
    castas: ["Baga"],
    tipo: "TINTO",
    preco: 32.0,
    atributos: {
      corpo: "encorpado",
      acidez: "alta",
      taninos: "altos",
      doceza: "seco",
      estagioBarrica: true,
      mesesBarrica: 18,
      teorAlcoolico: 13.5,
      perfilAromatico: ["frutos vermelhos ácidos", "terroso", "especiarias"],
      temperaturaServico: "17-18 °C",
      notas: "Taninos firmes e acidez marcada — pede carnes de caça ou assados intensos.",
    },
  },
  {
    nome: "Colares Tinto",
    produtor: "Adega Regional de Colares",
    ano: 2020,
    regiao: "Colares",
    pais: "Portugal",
    castas: ["Ramisco"],
    tipo: "TINTO",
    preco: 24.0,
    atributos: {
      corpo: "medio",
      acidez: "alta",
      taninos: "medios",
      doceza: "seco",
      estagioBarrica: false,
      mesesBarrica: null,
      teorAlcoolico: 12.5,
      perfilAromatico: ["frutos vermelhos", "notas salinas"],
      temperaturaServico: "15-17 °C",
      notas: "Raro, acidez alta e corpo médio — funciona surpreendentemente bem com bacalhau.",
    },
  },
  {
    nome: "Espumante Bruto",
    produtor: "Murganheira",
    ano: 2021,
    regiao: "Távora-Varosa",
    pais: "Portugal",
    castas: ["Chardonnay", "Pinot Noir"],
    tipo: "ESPUMANTE",
    preco: 16.0,
    atributos: {
      corpo: "leve",
      acidez: "alta",
      taninos: "nao_aplicavel",
      doceza: "seco",
      estagioBarrica: false,
      mesesBarrica: null,
      teorAlcoolico: 12.0,
      perfilAromatico: ["maçã", "brioche", "citrinos"],
      temperaturaServico: "6-8 °C",
      notas: "Boas bolhas, ótimo para entradas e mariscos.",
    },
  },
  {
    nome: "Porto Tawny 10 Anos",
    produtor: "Taylor's",
    ano: 2013,
    regiao: "Douro",
    pais: "Portugal",
    castas: ["Touriga Nacional", "Tinta Barroca"],
    tipo: "FORTIFICADO",
    preco: 22.0,
    atributos: {
      corpo: "encorpado",
      acidez: "media",
      taninos: "medios",
      doceza: "doce",
      estagioBarrica: true,
      mesesBarrica: 120,
      teorAlcoolico: 20.0,
      perfilAromatico: ["frutos secos", "caramelo", "especiarias"],
      temperaturaServico: "14-16 °C",
      notas: "Clássico com queijo e sobremesas de chocolate.",
    },
  },
  {
    nome: "Moscatel de Setúbal",
    produtor: "José Maria da Fonseca",
    ano: 2018,
    regiao: "Península de Setúbal",
    pais: "Portugal",
    castas: ["Moscatel de Setúbal"],
    tipo: "FORTIFICADO",
    preco: 18.0,
    atributos: {
      corpo: "encorpado",
      acidez: "media",
      taninos: "nao_aplicavel",
      doceza: "doce",
      estagioBarrica: true,
      mesesBarrica: 24,
      teorAlcoolico: 17.5,
      perfilAromatico: ["passas", "mel", "flor de laranjeira"],
      temperaturaServico: "10-12 °C",
      notas: "Muito aromático e doce, clássico para sobremesas frutadas.",
    },
  },
];

async function main() {
  const restaurante = await prisma.restaurante.findUniqueOrThrow({ where: { slug: "demo" } });
  const agora = new Date();

  for (const p of PRATOS) {
    const existe = await prisma.prato.findFirst({
      where: { restauranteId: restaurante.id, nome: p.nome },
    });
    if (existe) continue;
    await prisma.prato.create({
      data: {
        restauranteId: restaurante.id,
        nome: p.nome,
        seccao: p.seccao,
        preco: p.preco,
        origem: "MANUAL",
        atributos: p.atributos,
        enriquecidoEm: agora,
      },
    });
    console.log(`+ prato: ${p.nome}`);
  }

  for (const v of VINHOS) {
    let vinhoCatalogo = await prisma.vinhoCatalogo.findFirst({
      where: { nome: v.nome, produtor: v.produtor, ano: v.ano },
    });
    if (!vinhoCatalogo) {
      vinhoCatalogo = await prisma.vinhoCatalogo.create({
        data: {
          nome: v.nome,
          produtor: v.produtor,
          ano: v.ano,
          regiao: v.regiao,
          pais: v.pais,
          castas: v.castas,
          tipo: v.tipo,
          atributos: v.atributos,
          fontes: [],
          confianca: "ALTA" as Confianca,
          enriquecidoEm: agora,
        },
      });
    }
    const jaNaCarta = await prisma.cartaVinho.findFirst({
      where: { restauranteId: restaurante.id, vinhoCatalogoId: vinhoCatalogo.id },
    });
    if (jaNaCarta) continue;
    await prisma.cartaVinho.create({
      data: {
        restauranteId: restaurante.id,
        vinhoCatalogoId: vinhoCatalogo.id,
        preco: v.preco,
        stock: 24,
        origem: "MANUAL",
      },
    });
    console.log(`+ vinho: ${v.produtor} ${v.nome} ${v.ano}`);
  }

  console.log("A gerar o pairing pelo motor de regras (sem IA, instantâneo)...");
  await regenerarPairingsSemIA(restaurante.id);
  console.log("Concluído.");
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
