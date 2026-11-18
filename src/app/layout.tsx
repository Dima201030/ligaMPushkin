import type { Metadata } from "next";
import { Manrope, Prata } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["cyrillic", "latin"],
  variable: "--font-manrope",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const prata = Prata({
  subsets: ["cyrillic", "latin"],
  variable: "--font-prata",
  display: "swap",
  weight: "400",
});

export const metadata: Metadata = {
  title: {
    default: "Лига Mr. Pushkin — теннисные турниры и рейтинг клуба",
    template: "%s · Лига Mr. Pushkin",
  },
  description:
    "Любительская теннисная лига клуба Mr. Pushkin: расписание турниров, рейтинг игроков, результаты матчей и запись на соревнования.",
  metadataBase: new URL("https://league.mrpushkin.com"),
  openGraph: {
    title: "Лига Mr. Pushkin",
    description: "Турниры, рейтинг и игровое сообщество теннисного клуба Mr. Pushkin.",
    type: "website",
    locale: "ru_RU",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${manrope.variable} ${prata.variable}`}>
      <body className="flex min-h-screen flex-col">{children}</body>
    </html>
  );
}
