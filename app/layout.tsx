import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import MotionEffects from "@/components/MotionEffects";
import Footer from "@/components/Footer";

import "./account.css";
import "./motion.css";
import "./film.css";
import "./lower.css";
import "./readability.css";
import "./plan-comparison.css";
import "./sales-journey.css";
import "./buttons.css";
import "./platform.css";
import "./workspace.css";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={body.variable}>
        <MotionEffects />
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
