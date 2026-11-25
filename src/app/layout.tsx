import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans, Manrope, Playfair_Display } from "next/font/google";

/*
 * As quatro famílias ficam disponíveis como variáveis CSS; o painel escolhe qual usar.
 * next/font hospeda as fontes no próprio site (sem requisições ao Google para o visitante)
 * e o navegador só baixa as que estão em uso.
 */
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--ff-cormorant",
  display: "swap",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--ff-playfair",
  display: "swap",
  preload: false,
});
const manrope = Manrope({ subsets: ["latin"], variable: "--ff-manrope", display: "swap" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--ff-dmsans", display: "swap", preload: false });

export const metadata: Metadata = {
  title: "Pérola Martiniano | Psicóloga e Psicoterapia",
};

export const viewport: Viewport = {
  themeColor: "#F4EEE7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${cormorant.variable} ${playfair.variable} ${manrope.variable} ${dmSans.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
