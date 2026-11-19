import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { getCmsPage } from "@/lib/data";
import { CLUB } from "@/lib/domain";
import { PageHeader } from "@/components/ui/Section";
import { ContactForm } from "@/components/domain/ContactForm";
import { CmsBody } from "@/components/domain/CmsBody";

export const metadata: Metadata = {
  title: "Контакты",
  description: "Адрес, телефоны и схема проезда теннисного клуба Mr. Pushkin в Пушкине.",
};

const MAP_URL =
  "https://yandex.ru/maps/?text=" +
  encodeURIComponent("Санкт-Петербург, Пушкинский район, Волхонское шоссе, 79А");

export default async function ContactsPage() {
  const page = await getCmsPage("contacts");

  return (
    <>
      <PageHeader
        eyebrow="Контакты"
        title={page?.title === "Контакты" ? "Приезжайте в клуб" : page?.title || "Приезжайте в клуб"}
        description="Мы находимся в Пушкинском районе, в 900 метрах от Пулковского шоссе. Бронирование кортов — по телефону или на ресепшен."
        actions={
          <a href={MAP_URL} target="_blank" rel="noreferrer" className="btn btn-light">
            Открыть в Яндекс Картах
          </a>
        }
        compact
      />

      <div className="page-shell section">
        {page?.bodyMarkdown ? (
          <div className="mb-8 border-b border-line pb-6">
            <CmsBody markdown={page.bodyMarkdown} />
          </div>
        ) : null}
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            {[
              {
                icon: MapPin,
                title: "Адрес",
                value: CLUB.address,
                note: "Пушкинский район, пос. Александровская",
              },
              {
                icon: Phone,
                title: "Бронирование кортов",
                value: CLUB.phoneBookings,
                note: "Ежедневно с 08:00 до 23:00",
                href: `tel:${CLUB.phoneBookings.replace(/\D/g, "")}`,
              },
              {
                icon: Phone,
                title: "Школа тенниса",
                value: CLUB.phoneSchool,
                note: "Запись на пробное занятие",
                href: `tel:${CLUB.phoneSchool.replace(/\D/g, "")}`,
              },
              {
                icon: Mail,
                title: "Почта лиги",
                value: CLUB.email,
                note: "Вопросы по турнирам и рейтингу",
                href: `mailto:${CLUB.email}`,
              },
              {
                icon: Clock,
                title: "Режим работы",
                value: CLUB.hours,
                note: "Корт-хаус и кафе работают по графику клуба",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex gap-4 border-b border-line py-4 first:border-t">
                  <Icon className="mt-0.5 size-4 shrink-0 text-ink-muted" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-[0.58rem] uppercase tracking-[0.14em] text-ink-muted">{item.title}</p>
                    {item.href ? (
                      <a href={item.href} className="mt-1.5 block text-sm font-medium transition-opacity hover:opacity-60">{item.value}</a>
                    ) : (
                      <p className="mt-1.5 text-sm font-medium">{item.value}</p>
                    )}
                    <p className="mt-1 text-xs leading-relaxed text-ink-muted">{item.note}</p>
                  </div>
                </div>
              );
            })}

            <div className="pt-6">
              <p className="text-[0.58rem] uppercase tracking-[0.14em] text-ink-muted">Соцсети</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a href={CLUB.vk} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                  <MessageCircle className="size-4" aria-hidden="true" />
                  ВКонтакте
                </a>
                <Link href="/tournaments" className="btn btn-secondary btn-sm">Турниры</Link>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="relative min-h-[300px] overflow-hidden bg-navy">
              <div className="absolute inset-0 opacity-70 court-pattern" aria-hidden="true" />
              <div className="absolute inset-0 bg-gradient-to-br from-navy/40 via-transparent to-navy/80" aria-hidden="true" />
              <div className="relative flex h-full min-h-[300px] flex-col items-center justify-center p-8 text-center text-white">
                <MapPin className="size-6 text-sky" aria-hidden="true" />
                <p className="display mt-5 text-[1.6rem] leading-none">Mr. Pushkin</p>
                <p className="mt-3 max-w-[30ch] text-xs leading-relaxed text-white/60">{CLUB.address}</p>
                <a href={MAP_URL} target="_blank" rel="noreferrer" className="btn btn-on-dark btn-sm mt-6">
                  Построить маршрут
                </a>
              </div>
            </div>

            <div className="border-t border-line pt-6">
              <h2 className="text-base">Как добраться</h2>
              <div className="mt-4 grid gap-6 text-xs leading-relaxed text-ink-soft sm:grid-cols-2">
                <div>
                  <p className="font-medium text-ink">На автомобиле</p>
                  <p className="mt-1.5 text-ink-muted">
                    900 метров от Пулковского шоссе. Поворот на Волхонское шоссе, 79А. Бесплатная парковка на территории.
                  </p>
                </div>
                <div>
                  <p className="font-medium text-ink">На общественном транспорте</p>
                  <p className="mt-1.5 text-ink-muted">
                    От метро «Московская» — автобусы до остановки «Александровская». Далее 7 минут пешком.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-8 border-t border-line pt-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="bg-navy p-7 text-white md:p-8">
            <p className="text-[0.6rem] uppercase tracking-[0.16em] text-sky">Лига</p>
            <h2 className="mt-4 text-[1.9rem] leading-[1.05] text-white">Есть вопрос по турниру?</h2>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              Напишите организатору лиги: поможем выбрать категорию, разобраться с регистрацией и
              подскажем ближайший подходящий турнир.
            </p>
            <div className="mt-6 space-y-2.5 border-t border-white/15 pt-5 text-sm">
              <a href={`tel:${CLUB.phoneBookings.replace(/\D/g, "")}`} className="flex items-center gap-2 text-white/75 transition-colors hover:text-white">
                <Phone className="size-4 text-sky" aria-hidden="true" />
                {CLUB.phoneBookings}
              </a>
              <a href={`mailto:${CLUB.email}`} className="flex items-center gap-2 text-white/75 transition-colors hover:text-white">
                <Mail className="size-4 text-sky" aria-hidden="true" />
                {CLUB.email}
              </a>
            </div>
          </div>
          <ContactForm />
        </div>
      </div>
    </>
  );
}
