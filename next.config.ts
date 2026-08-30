import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // O SDK do Anthropic só corre no servidor — nunca no bundle do browser.
  serverExternalPackages: ["@anthropic-ai/sdk"],
};

export default nextConfig;
