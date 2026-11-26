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
  "https://pairly.space";

/** Explicit icons must include basePath — Next does not prefix metadata.icons. */
const iconBase = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");

export const metadata: Metadata = {
  title: {
    default: `${CLUB.leagueName} — платформа для организации турниров`,
    template: `%s · ${CLUB.leagueName}`,
  },
  description:
    "Pairly — платформа для создания и проведения турниров: заявки, сетки, расписание, счёт, рейтинг и кабинет организатора.",
  metadataBase: new URL(siteUrl),
  icons: {
    icon: [
      { url: `${iconBase}/favicon.ico`, sizes: "48x48" },
      { url: `${iconBase}/icon.svg`, type: "image/svg+xml" },
    ],
    apple: [
      {
        url: `${iconBase}/apple-icon.png`,
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  openGraph: {
    title: CLUB.leagueName,
    description:
      "Заявки, сетки, матчи, рейтинг и контент турнира в одном рабочем контуре.",
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
