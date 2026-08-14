import { Space_Grotesk, Instrument_Sans } from "next/font/google";
import "@/app/globals.css";

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

export default function NotFound() {
  return (
    <main className={`${spaceGrotesk.variable} ${instrumentSans.variable} antialiased min-h-full flex flex-col justify-center items-center relative bg-background text-text pt-24`}>
      <div className="text-center">
        <h1 className="text-8xl font-bold">404</h1>
        <p className="text-2xl text-text-muted mt-4">
          Esta página no pudo ser encontrada,
          <br />
          pero si sigues buscando podrás encontrar una desarrolladora :)
        </p>
        <a
          href="/"
          className="text-accent mt-8 inline-block text-3xl font-bold"
        >
          Volver al inicio
        </a>
      </div>
    </main>
  );
}