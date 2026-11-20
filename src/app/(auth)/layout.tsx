import Link from "next/link";
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
          © 2026 {CLUB.fullName} · Волхонское шоссе, 79А
        </footer>
      </div>

      <div className="relative hidden overflow-hidden bg-navy lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/hero.jpg" alt="" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-navy/10" aria-hidden="true" />
        <div className="relative flex h-full flex-col justify-end p-12 text-white">
          <p className="eyebrow eyebrow-plain text-sky">Сезон 2026</p>
          <p className="mt-4 max-w-[20ch] font-display text-4xl font-semibold leading-tight">
            Играйте. Растите. Побеждайте.
          </p>
          <p className="mt-4 max-w-[38ch] text-sm leading-relaxed text-white/60">
            Турниры, рейтинг и сообщество игроков {CLUB.name} — в одном личном кабинете.
          </p>
          <div className="mt-8 flex gap-8 border-t border-white/15 pt-6 text-xs text-white/50">
            <span><span className="block text-lg font-bold text-white">318</span>игроков</span>
            <span><span className="block text-lg font-bold text-white">28</span>турниров</span>
            <span><span className="block text-lg font-bold text-white">9</span>кортов</span>
          </div>
        </div>
      </div>
    </div>
  );
}
