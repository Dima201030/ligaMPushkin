import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Coffee,
  Dumbbell,
  GraduationCap,
  ParkingCircle,
  ShoppingBag,
  Sparkles,
  Trophy,
  Wrench,
} from "lucide-react";
import { getCmsPage, listPlayers } from "@/lib/data";
import { CLUB } from "@/lib/domain";
import { PageHeader } from "@/components/ui/Section";
import { CmsBody } from "@/components/domain/CmsBody";

export const metadata: Metadata = {
  title: "О клубе",
  description: "Теннисный клуб Mr. Pushkin: 7 крытых кортов, 2 грунтовых корта, школа тенниса, падел и кафе.",
};

const FEATURES = [
  { icon: Trophy, title: "7 крытых кортов", text: "Хард с современным освещением и комфортной температурой круглый год." },
  { icon: Sparkles, title: "2 грунтовых корта", text: "Открытые площадки для летних турниров и тренировок на грунте." },
  { icon: GraduationCap, title: "Школа для взрослых", text: "Индивидуальные и групповые занятия для игроков любого уровня." },
  { icon: Dumbbell, title: "Падел-корт", text: "Уличная площадка для падела с арендой инвентаря." },
  { icon: Coffee, title: "Кафе с видом на корты", text: "Завтраки, обед и чай после игры — без выхода из клуба." },
  { icon: ShoppingBag, title: "Магазин и стрингер", text: "Экипировка, струны и оперативный ремонт ракеток." },
  { icon: ParkingCircle, title: "Бесплатная парковка", text: "Просторная парковка на территории клуба." },
  { icon: Wrench, title: "Прокат инвентаря", text: "Ракетки, мячи и всё необходимое для первой игры." },
];

export default async function ClubPage() {
  const [page, players] = await Promise.all([getCmsPage("club"), listPlayers()]);
  const intro =
    page?.bodyMarkdown?.trim() ||
    "Mr. Pushkin — клуб для тех, кто любит теннис без лишнего пафоса.";

  return (
    <>
      <PageHeader
        eyebrow="О клубе"
        title={page?.title ? `Теннисный клуб ${page.title === "Клуб" ? "Mr. Pushkin" : page.title}` : "Теннисный клуб Mr. Pushkin"}
        description="Место, где играют в теннис круглый год: 9 кортов, турниры и сообщество игроков Пушкинского района."
        actions={
          <>
            <Link href="/contacts" className="btn btn-light">Как добраться</Link>
            <Link href="/tournaments" className="btn btn-on-dark">Турниры</Link>
          </>
        }
      />

      <div className="page-shell section">
        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="cover-image aspect-[16/10]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/hero.jpg" alt="Крытые корты Mr. Pushkin" />
          </div>
          <div>
            <p className="eyebrow">С 2014 года</p>
            <h2 className="mt-3">Большой теннис в Пушкине</h2>
            <div className="mt-4">
              <CmsBody markdown={intro} />
            </div>
            <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-line pt-6 sm:grid-cols-3">
              <div>
                <dt className="display text-3xl leading-none">9</dt>
                <dd className="stat-label mt-2">кортов</dd>
              </div>
              <div>
                <dt className="display text-3xl leading-none">08–23</dt>
                <dd className="stat-label mt-2">часы работы</dd>
              </div>
              <div>
                <dt className="display text-3xl leading-none">{players.length || "—"}</dt>
                <dd className="stat-label mt-2">игроков лиги</dd>
              </div>
            </dl>
          </div>
        </div>

        <section className="mt-14">
          <p className="eyebrow">Инфраструктура</p>
          <h2 className="mt-3">Всё для игры — в одном месте</h2>
          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="border-t border-line pt-5">
                  <span className="grid size-9 place-items-center rounded-full border border-line text-ink">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-sm font-medium">{feature.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-ink-muted">{feature.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-14 grid gap-4 md:grid-cols-3">
          <div className="relative aspect-[4/3] overflow-hidden md:col-span-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/club/adult-tournament.webp" alt="Турнир клуба Mr. Pushkin" className="size-full object-cover" />
          </div>
          <div className="flex flex-col justify-between bg-navy p-6 text-white">
            <div>
              <p className="text-[0.6rem] uppercase tracking-[0.16em] text-sky">Лига клуба</p>
              <p className="display mt-4 text-[1.7rem] leading-[1.05]">Турниры каждую неделю — от новичков до Masters</p>
              <p className="mt-4 text-xs leading-relaxed text-white/60">
                Одиночные, парные и смешанные сетки. Удобное расписание и честный рейтинг.
              </p>
            </div>
            <Link href="/tournaments" className="link-arrow mt-8 text-white">
              Смотреть расписание
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section className="mt-14 flex flex-wrap items-center justify-between gap-5 border-t border-line pt-8">
          <div>
            <h2 className="text-3xl">Приезжайте познакомиться</h2>
            <p className="mt-2 text-sm text-ink-muted">{CLUB.address}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={`tel:${CLUB.phoneBookings.replace(/\D/g, "")}`} className="btn btn-secondary">
              {CLUB.phoneBookings}
            </a>
            <Link href="/contacts" className="btn btn-primary">Контакты и схема</Link>
          </div>
        </section>
      </div>
    </>
  );
}
