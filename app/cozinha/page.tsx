import { getRestauranteAtual } from "@/lib/restaurante";
import { CozinhaEcra } from "./CozinhaEcra";

export const dynamic = "force-dynamic";

export default async function CozinhaPage() {
  const restaurante = await getRestauranteAtual();
  return <CozinhaEcra restauranteId={restaurante.id} />;
}
