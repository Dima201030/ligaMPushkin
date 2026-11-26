import type { Metadata } from "next";
import Link from "next/link";
import { CLUB } from "@/lib/domain";
import { CONSENT_VERSION, OPERATOR } from "@/lib/legal";
import { Breadcrumbs } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Пользовательское соглашение",
  description: `Условия использования платформы ${CLUB.productName}.`,
};

export default function TermsPage() {
  return (
    <div className="page-shell section max-w-3xl">
      <Breadcrumbs
        items={[
          { label: "Главная", href: "/" },
          { label: "Соглашение" },
        ]}
      />
      <p className="eyebrow mt-6">Документ · версия {CONSENT_VERSION}</p>
      <h1 className="mt-3 text-3xl">Пользовательское соглашение</h1>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-ink-soft">
        <p>
          Платформа {CLUB.productName} предоставляет инструменты для организации и
          участия в любительских турнирах. Используя сервис, вы принимаете условия
          настоящего соглашения.
        </p>
        <section>
          <h2 className="text-lg text-ink">1. Аккаунт</h2>
          <p className="mt-2">
            Вы указываете достоверные данные. Организатор клуба может подтверждать
            профиль перед допуском к регистрации на турнир. Один человек — один
            основной аккаунт.
          </p>
        </section>
        <section>
          <h2 className="text-lg text-ink">2. Турниры и взносы</h2>
          <p className="mt-2">
            Условия конкретного турнира (формат, взнос, регламент) публикуются на
            странице турнира. Оплата взноса, если требуется, производится способом,
            указанным организатором. Онлайн-эквайринг подключается отдельно.
          </p>
        </section>
        <section>
          <h2 className="text-lg text-ink">3. Персональные данные</h2>
          <p className="mt-2">
            Обработка ПДн регулируется{" "}
            <Link href="/privacy" className="text-accent">
              Политикой
            </Link>{" "}
            и отдельными{" "}
            <Link href="/consent" className="text-accent">
              согласиями
            </Link>
            . Оператор: {OPERATOR.name}.
          </p>
        </section>
        <section>
          <h2 className="text-lg text-ink">4. Ограничение ответственности</h2>
          <p className="mt-2">
            Платформа предоставляет программные средства. Организацию очных матчей,
            безопасность на площадке и расчёты взносов обеспечивает организатор клуба,
            если иное не оговорено отдельно.
          </p>
        </section>
        <section>
          <h2 className="text-lg text-ink">5. Контакты</h2>
          <p className="mt-2">
            <Link href="/contacts" className="text-accent">
              Контакты
            </Link>
            {" · "}
            <a className="text-accent" href={`mailto:${OPERATOR.email}`}>
              {OPERATOR.email}
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
