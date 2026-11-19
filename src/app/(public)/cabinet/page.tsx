import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Личный кабинет",
  description: "Заявки на турниры, матчи, рейтинг и настройки игрока лиги Mr. Pushkin.",
};

export default function CabinetPage() {
  return (
    <>
      <PageHeader
        eyebrow="Кабинет игрока"
        title="Личный кабинет"
        description="Раздел подключается к живому API на следующем этапе. Сейчас войдите в аккаунт, чтобы пользоваться турнирами."
        actions={
          <>
            <Link href="/login" className="btn btn-on-dark">
              Войти
            </Link>
            <Link href="/register" className="btn btn-light">
              Регистрация
            </Link>
          </>
        }
        compact
      />
      <div className="page-shell section">
        <p className="border-y border-line py-12 text-sm text-ink-muted">
          Заявки, матчи и рейтинг игрока появятся здесь после проводки кабинета (MP-22).
        </p>
      </div>
    </>
  );
}
