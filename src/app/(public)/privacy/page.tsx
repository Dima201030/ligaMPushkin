import type { Metadata } from "next";
import Link from "next/link";
import { CLUB } from "@/lib/domain";
import { CONSENT_VERSION, OPERATOR } from "@/lib/legal";
import { Breadcrumbs } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Политика обработки персональных данных",
  description: `Политика обработки персональных данных платформы ${CLUB.productName}.`,
};

export default function PrivacyPage() {
  return (
    <div className="page-shell section max-w-3xl">
      <Breadcrumbs
        items={[
          { label: "Главная", href: "/" },
          { label: "Политика ПДн" },
        ]}
      />
      <p className="eyebrow mt-6">Документ · версия {CONSENT_VERSION}</p>
      <h1 className="mt-3 text-3xl">Политика обработки персональных данных</h1>
      <p className="mt-4 text-sm leading-relaxed text-ink-soft">
        Настоящая политика описывает, как платформа {CLUB.productName} обрабатывает
        персональные данные пользователей в соответствии с Федеральным законом
        от 27.07.2006 № 152‑ФЗ «О персональных данных».
      </p>

      <div className="prose-legal mt-8 space-y-6 text-sm leading-relaxed text-ink-soft">
        <section>
          <h2 className="text-lg text-ink">1. Оператор</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>{OPERATOR.name}</li>
            <li>ИНН: {OPERATOR.inn}</li>
            <li>Адрес: {OPERATOR.address}</li>
            <li>
              Контакт по вопросам ПДн:{" "}
              <a className="text-accent" href={`mailto:${OPERATOR.email}`}>
                {OPERATOR.email}
              </a>
            </li>
            <li>{OPERATOR.rknNotice}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg text-ink">2. Какие данные обрабатываются</h2>
          <p className="mt-2">
            ФИО, email, телефон (если указан), пароль в виде хэша, дата рождения
            (для проверки профиля организатором), город и биография (если указаны),
            уровень игры, рейтинг, заявки и результаты турниров, технические данные
            сессии (IP, user-agent), факты согласий.
          </p>
        </section>

        <section>
          <h2 className="text-lg text-ink">3. Цели обработки</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>регистрация и вход в личный кабинет;</li>
            <li>организация турниров, сеток, рейтинга и коммуникации по заявкам;</li>
            <li>публикация профиля и результатов при отдельном согласии;</li>
            <li>исполнение требований законодательства РФ;</li>
            <li>информационные письма — только при отдельном согласии на маркетинг.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg text-ink">4. Правовые основания</h2>
          <p className="mt-2">
            Согласие субъекта (ст. 9 152‑ФЗ), исполнение договора участия в турнире /
            пользования платформой, а также иные основания ст. 6 152‑ФЗ, когда применимо.
          </p>
        </section>

        <section>
          <h2 className="text-lg text-ink">5. Публикация</h2>
          <p className="mt-2">
            При согласии на публикацию профиля на сайте могут отображаться ФИО, уровень,
            рейтинг и результаты матчей. Телефон и email в публичные ответы API не
            включаются. Год рождения на публичной карточке не показывается.
          </p>
        </section>

        <section>
          <h2 className="text-lg text-ink">6. Хранение и локализация</h2>
          <p className="mt-2">
            Первичная запись и хранение данных граждан РФ выполняются на серверах на
            территории Российской Федерации. Срок хранения — пока аккаунт активен и
            пока это нужно для турнирной истории, либо до удаления/обезличивания по
            запросу, если нет иных законных оснований.
          </p>
        </section>

        <section>
          <h2 className="text-lg text-ink">7. Права субъекта</h2>
          <p className="mt-2">
            Вы можете запросить доступ, уточнение, отзыв согласия и удаление
            (обезличивание) аккаунта в кабинете или по email оператора. Отзыв согласия
            не влияет на обработку, которую оператор вправе продолжать по иным
            основаниям 152‑ФЗ.
          </p>
        </section>

        <section>
          <h2 className="text-lg text-ink">8. Связанные документы</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <Link href="/consent" className="text-accent">
                Текст согласия на обработку ПДн
              </Link>
            </li>
            <li>
              <Link href="/consent#public" className="text-accent">
                Согласие на публикацию профиля и результатов
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-accent">
                Пользовательское соглашение
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
