import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const PASTA_UPLOADS = path.join(process.cwd(), "uploads");

const EXTENSAO_POR_TIPO: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

/**
 * Guarda a foto da carta em disco para haver registo do que foi carregado.
 * Em produção isto é Supabase Storage — ver ARQUITETURA.md. A pasta está no
 * .gitignore.
 */
export async function guardarImagem(
  restauranteId: string,
  base64: string,
  mediaType: string,
): Promise<string> {
  const pasta = path.join(PASTA_UPLOADS, restauranteId);
  await mkdir(pasta, { recursive: true });

  const extensao = EXTENSAO_POR_TIPO[mediaType] ?? "bin";
  const nomeFicheiro = `${randomUUID()}.${extensao}`;
  await writeFile(path.join(pasta, nomeFicheiro), Buffer.from(base64, "base64"));

  return `/uploads/${restauranteId}/${nomeFicheiro}`;
}

const TIPOS_ACEITES = new Set(Object.keys(EXTENSAO_POR_TIPO));

export function ehMediaTypeAceite(mediaType: string): mediaType is
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "image/gif" {
  return TIPOS_ACEITES.has(mediaType);
}
