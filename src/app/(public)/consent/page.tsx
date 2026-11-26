import type { Metadata } from "next";
import Link from "next/link";
import { CLUB } from "@/lib/domain";
import { CONSENT_VERSION, OPERATOR } from "@/lib/legal";
import { Breadcrumbs } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Согласие на обработку персональных данных",
  description: `Тексты согласий платформы ${CLUB.productName}.`,
};

export default function ConsentPage() {
  return (
    <div className="page-shell section max-w-3xl">
      <Breadcrumbs
        items={[
          { label: "Главная", href: "/" },
          { label: "Согласия" },
        ]}
      />
      <p className="eyebrow mt-6">Документ · версия {CONSENT_VERSION}</p>
      <h1 className="mt-3 text-3xl">Согласия субъекта персональных данных</h1>
      <p className="mt-4 text-sm leading-relaxed text-ink-soft">
        Ниже — отдельные тексты согласий. На форме регистрации каждое согласие
        подтверждается отдельным чекбоксом (требование ст. 9 152‑ФЗ в ред. 2025 г.).
      </p>

      <section className="mt-10 space-y-4 border-t border-line pt-8 text-sm leading-relaxed text-ink-soft">
        <h2 className="text-lg text-ink">1. Согласие на обработку персональных данных</h2>
        <p>
          Я, субъект персональных данных, свободно, своей волей и в своём интересе даю
          согласие оператору ({OPERATOR.name}, ИНН {OPERATOR.inn}, {OPERATOR.address}) на
          обработку моих персональных данных: ФИО, email, телефон, дата рождения,
          сведения профиля и турнирной активности, технические данные сессии — в целях
          регистрации, организации турниров, связи по заявкам и исполнения функций
          платформы {CLUB.productName}.
        </p>
        <p>
          Действия: сбор, запись, хранение, уточнение, использование, передача
          (предоставление организатору клуба), обезличивание, удаление. Способ: с
          использованием средств автоматизации. Срок: до отзыва согласия или удаления
          аккаунта, если иное не требуется законом. Отзыв: через кабинет или на{" "}
          <a className="text-accent" href={`mailto:${OPERATOR.email}`}>
            {OPERATOR.email}
          </a>
          .
        </p>
        <p>
          Политика:{" "}
          <Link href="/privacy" className="text-accent">
            /privacy
          </Link>
          .
        </p>
      </section>

      <section id="public" className="mt-10 space-y-4 border-t border-line pt-8 text-sm leading-relaxed text-ink-soft">
        <h2 className="text-lg text-ink">2. Согласие на публикацию профиля и результатов</h2>
        <p>
          Я разрешаю оператору распространять (публиковать на сайте платформы) мои
          ФИО, уровень, рейтинг, состав заявок и результаты матчей/турниров в объёме,
          необходимом для проведения соревнований и ведения публичного рейтинга.
          Телефон и email публично не размещаются.
        </p>
        <p>
          Согласие может быть отозвано; уже опубликованные архивные результаты могут
          сохраняться в обезличенном или ограниченном виде, если это нужно для
          целостности турнирной истории и не противоречит закону.
        </p>
      </section>

      <section id="marketing" className="mt-10 space-y-4 border-t border-line pt-8 text-sm leading-relaxed text-ink-soft">
        <h2 className="text-lg text-ink">3. Согласие на информационные рассылки (необязательно)</h2>
        <p>
          Я согласен(на) получать на email новости платформы и клуба, не связанные с
          обязательными уведомлениями по заявкам и матчам. Отказ не влияет на доступ к
          турнирам.
        </p>
      </section>
    </div>
  );
}
