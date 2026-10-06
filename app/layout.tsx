import type { Metadata } from "next";
import "./globals.css";
import "@fontsource-variable/manrope";
import { ActionFeedback } from "@/components/feedback/ActionFeedback";
import { MicroInteractions } from "@/components/shared/MicroInteractions";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  title: {
    default: "Cotiza Smart · Propuestas que abren posibilidades",
    template: "%s | Cotiza Smart",
  },
  description:
    "Crea cotizaciones profesionales con tu identidad, compártelas por WhatsApp y recibe la respuesta de tus clientes. Empieza con 3 cotizaciones gratis.",
  openGraph: {
    title: "Cotiza Smart",
    description: "Cotiza con intención. Cierra con confianza.",
    locale: "es_MX",
    type: "website",
    images: [
      {
        url: "/images/mascot/hero.png",
        width: 1672,
        height: 941,
        alt: "Cotiza Smart: propuestas profesionales",
      },
    ],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
        <ActionFeedback />
        <MicroInteractions />
      </body>
    </html>
  );
}
