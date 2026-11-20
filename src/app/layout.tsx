import type { Metadata } from "next";
import { Manrope, Prata } from "next/font/google";
import { CLUB } from "@/lib/domain";
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

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  process.env.PUBLIC_URL?.trim() ||
  "https://pairly.app";

export const metadata: Metadata = {
  title: {
    default: `${CLUB.leagueName} — теннисные турниры и рейтинг клуба`,
    template: `%s · ${CLUB.leagueName}`,
  },
  description: `Любительская теннисная лига ${CLUB.name}: расписание турниров, рейтинг игроков, результаты матчей и запись на соревнования.`,
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: CLUB.leagueName,
    description: `Турниры, рейтинг и игровое сообщество теннисного клуба ${CLUB.name}.`,
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
