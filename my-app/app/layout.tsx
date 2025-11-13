import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flight Price Monitor - Encuentra vuelos baratos desde Argentina",
  description: "Sistema de monitoreo de precios de vuelos en tiempo real. Encuentra ofertas, crea alertas y ahorra en tus viajes desde Buenos Aires.",
  keywords: ["vuelos baratos", "Argentina", "Buenos Aires", "San Francisco", "alertas de precios", "comparador de vuelos"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
