import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, HelpCircle, Send, Settings2, Users } from "lucide-react";
import { CLUB } from "@/lib/domain";
import { PageHeader } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Контакты",
  description:
    "Связаться с Pairly: вопросы по платформе, турнирам, доступам и запуску организатора. Telegram @lliwago.",
};

const TOPICS = [
  {
    icon: Users,
    title: "Запуск для организатора",
    text: "Расскажите про сезон, форматы и количество турниров. Подберём роли, покажем кабинет и поможем с первым запуском.",
  },
  {
    icon: Settings2,
    title: "Платформа и доступы",
    text: "Вопросы по кабинету, регистрации, подтверждению профилей, сеткам, рейтингу и публичной части.",
  },
  {
    icon: HelpCircle,
    title: "Игрокам",
    text: "Поможем разобраться с заявкой, листом ожидания, матчем или отображением рейтинга.",
  },
];

export default function ContactsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Контакты"
        title="Написать в Telegram"
        description="Единственный канал связи — личный Telegram. Здесь отвечают на вопросы по платформе, турнирам и доступам."
        actions={
          <a
            href={CLUB.telegramUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-light"
          >
            <Send className="size-4" aria-hidden="true" />
            @{CLUB.telegram}
          </a>
        }
        compact
      />

      <div className="page-shell section">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <div className="border-y border-line py-8">
              <p className="text-[0.58rem] uppercase tracking-[0.14em] text-ink-muted">Telegram</p>
              <a
                href={CLUB.telegramUrl}
                target="_blank"
                rel="noreferrer"
                className="display mt-3 block text-[clamp(2rem,5vw,3.4rem)] leading-none transition-opacity hover:opacity-60"
              >
                @{CLUB.telegram}
              </a>
              <p className="mt-4 max-w-[42ch] text-sm leading-relaxed text-ink-muted">
                Личный канал связи. Без формы, почты и телефона: одно сообщение —
                и можно обсудить детали.
              </p>
              <a
                href={CLUB.telegramUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary mt-6"
              >
                Открыть Telegram
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
            </div>

            <div className="mt-8">
              <h2 className="text-base">Что стоит написать сразу</h2>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-ink-soft">
                {[
                  "Сколько турниров планируете в сезоне и какие форматы используете.",
                  "Кто ведёт заявки и результаты сейчас: клуб, академия, тренер или сообщество.",
                  "Нужен ли публичный календарь и рейтинг или только внутренний кабинет.",
                  "Сколько организаторов будет работать с платформой.",
                ].map((item) => (
                  <li key={item} className="flex gap-2.5 border-b border-line pb-3 last:border-b-0">
                    <span className="mt-1.5 size-1 shrink-0 rounded-full bg-ink" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-8 text-[0.65rem] leading-relaxed text-ink-faint">
              Платформа не проводит турниры сама и не принимает взносы. Она даёт
              организатору инструменты для заявок, сеток, матчей, счёта и рейтинга.
            </p>
          </div>

          <div>
            {TOPICS.map((topic) => {
              const Icon = topic.icon;
              return (
                <div key={topic.title} className="flex gap-4 border-b border-line py-5 first:border-t">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full border border-line text-ink">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-sm font-medium">{topic.title}</h3>
                    <p className="mt-2 max-w-[52ch] text-xs leading-relaxed text-ink-muted">
                      {topic.text}
                    </p>
                  </div>
                </div>
              );
            })}

            <div className="mt-8 bg-navy p-7 text-white">
              <p className="text-[0.6rem] uppercase tracking-[0.16em] text-sky">Перед сообщением</p>
              <h2 className="mt-4 text-[1.6rem] leading-[1.1] text-white">
                Посмотрите, как устроен маршрут турнира
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/60">
                Короткая страница о возможностях и этапах поможет задать точные
                вопросы вместо общего «расскажите про платформу».
              </p>
              <div className="mt-6 flex flex-wrap gap-2 border-t border-white/15 pt-5">
                <Link href="/about" className="btn btn-on-dark btn-sm">
                  О платформе
                </Link>
                <Link href="/#faq" className="btn btn-on-dark btn-sm">
                  Вопросы
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
