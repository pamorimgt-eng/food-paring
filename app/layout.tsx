import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://mesadoxico.pt"),
  title: {
    default: "Mesa do Xico",
    template: "%s | Mesa do Xico",
  },
  description:
    "Comanda digital para restaurantes com sugestão automática de vinhos e argumentos de venda.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Mesa do Xico",
  },
};

export const viewport: Viewport = {
  themeColor: "#c1283b",
  width: "device-width",
  initialScale: 1,
  // Usado em serviço, numa mão: evita zoom acidental ao tocar depressa.
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-PT">
      <body className="min-h-full bg-white text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}
