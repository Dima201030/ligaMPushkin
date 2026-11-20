import Link from "next/link";
import { CLUB } from "@/lib/domain";

const LINK_GROUPS = [
  {
    title: "Лига",
    links: [
      { href: "/tournaments", label: "Турниры" },
      { href: "/rating", label: "Рейтинг" },
      { href: "/players", label: "Игроки" },
      { href: "/archive", label: "Архив" },
    ],
  },
  {
    title: "Клуб",
    links: [
      { href: "/club", label: "О клубе" },
      { href: "/clubs", label: "Клубы" },
      { href: "/news", label: "Новости" },
      { href: "/rules", label: "Правила лиги" },
      { href: "/contacts", label: "Контакты" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="page-shell">
        <div className="grid gap-10 py-12 md:grid-cols-[1.4fr_0.7fr_0.7fr_1.1fr]">
          <div>
            <p className="text-[0.78rem] font-medium uppercase tracking-[0.16em]">{CLUB.productName}</p>
            <p className="mt-4 max-w-[32ch] text-sm leading-relaxed text-ink-soft">
              Любительская теннисная лига {CLUB.name}. Турниры, рейтинг и игровое
              сообщество Пушкинского района.
            </p>
            <Link href="/register" className="link-arrow mt-6">
              Стать игроком лиги
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          {LINK_GROUPS.map((group) => (
            <div key={group.title}>
              <p className="micro text-ink-muted">{group.title}</p>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-ink-soft transition-colors hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="micro text-ink-muted">Контакты</p>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-ink-soft">
              <li>{CLUB.address}</li>
              <li>{CLUB.hours}</li>
              <li>
                <a
                  className="text-ink transition-opacity hover:opacity-60"
                  href={`tel:${CLUB.phoneBookings.replace(/\D/g, "")}`}
                >
                  {CLUB.phoneBookings}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-6 border-t border-line py-8 md:flex-row md:items-end md:justify-between">
          <p className="display text-[clamp(2.6rem,7vw,6rem)] leading-[0.85] tracking-[-0.04em]">
            {CLUB.productName}
          </p>
          <div className="flex flex-col gap-2 text-[0.6rem] uppercase tracking-[0.14em] text-ink-muted md:items-end">
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <Link href="/rules" className="transition-colors hover:text-ink">Регламент</Link>
              <Link href="/contacts" className="transition-colors hover:text-ink">Конфиденциальность</Link>
            </div>
            <p>© 2026 {CLUB.fullName} · Сезон {CLUB.season}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
