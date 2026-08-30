import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // O SDK do Anthropic só corre no servidor — nunca no bundle do browser.
  serverExternalPackages: ["@anthropic-ai/sdk"],
  // Imagem Docker enxuta para o deploy em VPS (Easypanel) — só o necessário
  // para correr `node server.js`, sem o resto do toolchain do Next.
  output: "standalone",
};

export default nextConfig;
