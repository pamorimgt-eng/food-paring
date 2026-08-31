import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // O SDK do Anthropic só corre no servidor — nunca no bundle do browser.
  serverExternalPackages: ["@anthropic-ai/sdk"],
  // Sem output "standalone": o Dockerfile leva o node_modules completo para
  // a imagem final (ver Dockerfile para o porquê), por isso o tracing de
  // dependências do "standalone" deixou de ser necessário.
};

export default nextConfig;
