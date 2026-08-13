import { Space_Grotesk, Instrument_Sans } from "next/font/google";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "@/app/globals.css";
import Navbar from "@/components/Navbar";
import WallHolePortal from "@/components/WallHolePortal";

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

const SUPPORTED_LOCALES = ["en", "es"] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!SUPPORTED_LOCALES.includes(locale as Locale)) {
    notFound();
  }

  return (
    <html lang={locale} className={`${spaceGrotesk.variable} ${instrumentSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col relative bg-background text-text">
        <Navbar locale={locale as Locale} />
        {children}
        <WallHolePortal />
      </body>
    </html>
  );
}