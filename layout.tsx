import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CardSpotlight from "@/components/CardSpotlight";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import Preloader from "@/components/Preloader";

const display = Barlow_Condensed({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["700", "800"],
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "DealerPass | Acceso y educación para subastas de vehículos en USA",
  description:
    "Accede a subastas de vehículos en Estados Unidos mediante dealers certificados y aprende a analizar costos, riesgos y ofertas con DealerPass.",
  keywords: [
    "subastas de carros en Estados Unidos",
    "comprar carros en Copart",
    "acceso a subastas para dealers",
    "curso de subastas de carros",
    "comprar carros para revender",
    "subastas de vehículos para latinos",
    "IAA, ADESA y Manheim",
    "dealer certificado",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${display.variable} ${body.variable}`}>
        <Preloader />
        <CardSpotlight />
        <WhatsAppFloat />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
