import Link from "next/link";
import { CLUB } from "@/lib/domain";

const LINK_GROUPS = [
  {
    title: "Турниры",
    links: [
      { href: "/tournaments", label: "Расписание" },
      { href: "/rating", label: "Рейтинг" },
      { href: "/players", label: "Игроки" },
      { href: "/archive", label: "Архив" },
      { href: "/rules", label: "Справочник" },
    ],
  },
  {
    title: "Платформа",
    links: [
      { href: "/about", label: "Организаторам" },
      { href: "/#features", label: "Возможности" },
      { href: "/#how", label: "Как это работает" },
      { href: "/#faq", label: "Вопросы" },
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
            <p className="mt-4 max-w-[34ch] text-sm leading-relaxed text-ink-soft">
              Платформа для создания и проведения турниров: заявки, сетки, расписание,
              счёт, рейтинг и контент в одном месте.
            </p>
            <Link href="/register" className="link-arrow mt-6">
              Создать аккаунт игрока
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
            <p className="micro text-ink-muted">Связь</p>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-ink-soft">
              <li>Вопросы по платформе, турнирам и доступам.</li>
              <li>
                <Link
                  className="text-ink transition-opacity hover:opacity-60"
                  href="/contacts"
                >
                  Контакты
                </Link>
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
              <Link href="/rules" className="transition-colors hover:text-ink">Справочник</Link>
              <Link href="/privacy" className="transition-colors hover:text-ink">Политика ПДн</Link>
              <Link href="/consent" className="transition-colors hover:text-ink">Согласия</Link>
              <Link href="/terms" className="transition-colors hover:text-ink">Соглашение</Link>
              <Link href="/contacts" className="transition-colors hover:text-ink">Контакты</Link>
            </div>
            <p>© 2026 {CLUB.productName} · Платформа для организации турниров</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
