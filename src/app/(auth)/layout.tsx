import Link from "next/link";
import { Check } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { CLUB } from "@/lib/domain";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.05fr]">
      <div className="flex flex-col px-6 py-6 md:px-10">
        <header className="flex items-center justify-between">
          <Logo />
          <Link href="/" className="text-xs font-semibold text-ink-muted hover:text-accent">
            На главную
          </Link>
        </header>
        <main className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[400px]">{children}</div>
        </main>
        <footer className="text-[0.65rem] text-ink-faint">
          © 2026 {CLUB.productName} · платформа для организации турниров
        </footer>
      </div>

      <div className="relative hidden overflow-hidden bg-navy lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/hero.jpg" alt="" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-navy/10" aria-hidden="true" />
        <div className="relative flex h-full flex-col justify-end p-12 text-white">
          <p className="eyebrow eyebrow-plain text-sky">{CLUB.productName}</p>
          <p className="mt-4 max-w-[20ch] font-display text-4xl font-semibold leading-tight">
            Турнир без ручных таблиц
          </p>
          <p className="mt-4 max-w-[40ch] text-sm leading-relaxed text-white/60">
            Заявки, сетки, расписание, счёт и рейтинг — в одном кабинете.
            Игроку достаточно записаться и следить за матчами.
          </p>
          <ul className="mt-8 grid gap-2.5 border-t border-white/15 pt-6 text-sm text-white/70">
            {[
              "Заявки с подтверждением и лист ожидания",
              "Сетки и автоматическое продвижение по кругам",
              "Elo и турнирные очки в одной таблице",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0 text-sky" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
