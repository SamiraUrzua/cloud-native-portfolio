import { Space_Grotesk, Instrument_Sans } from "next/font/google";
import type { Metadata } from "next";
import "@/app/globals.css";
import Navbar from "@/components/Navbar";
import WallHolePortal from "@/components/WallHolePortal";
import { locales, type Locale } from "@/lib/config";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Samira Urzúa - Ingeniera Civil en Computación e Informática",
  description: "Mi CV, portafolio, proyectos, y un poco de mi.",
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({children, params}: 
{children: React.ReactNode; params: Promise<{locale: string}>;}) {
  const { locale } = await params;
  return (
    <html lang={locale} className={`${spaceGrotesk.variable} ${instrumentSans.variable} h-full antialiased`}>
      <body className="min-h-screen flex flex-col relative bg-background text-text">
        <Navbar locale={locale as Locale} />
        {children}
        <WallHolePortal />
      </body>
    </html>
  );
}