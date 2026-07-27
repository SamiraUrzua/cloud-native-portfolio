import type { Metadata } from "next";
import { Space_Grotesk, Instrument_Sans } from "next/font/google";
import "./globals.css";
// Import your portal component
import WallHolePortal from "../components/WallHolePortal"; 

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
  title: "Your Name - Software Engineer",
  description: "Cloud-native CV and portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${instrumentSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col relative bg-zinc-950 text-zinc-50">
        {children}
        <WallHolePortal />
      </body>
    </html>
  );
}