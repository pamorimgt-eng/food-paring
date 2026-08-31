import { getRestauranteAtual } from "@/lib/restaurante";
import { exigirPapel } from "@/lib/auth";
import { CozinhaEcra } from "./CozinhaEcra";

export const dynamic = "force-dynamic";

export default async function CozinhaPage() {
  const utilizador = await exigirPapel(["COZINHA", "ADMIN"]);
  const restaurante = await getRestauranteAtual();
  return <CozinhaEcra restauranteId={restaurante.id} nomeUtilizador={utilizador.nome} />;
}
