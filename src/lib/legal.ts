/** Operator details for 152-FZ policy pages. Fill via env before public launch. */

export const CONSENT_VERSION = "2026-11-26";

export const OPERATOR = {
  name:
    process.env.NEXT_PUBLIC_OPERATOR_NAME?.trim() ||
    "Оператор персональных данных (укажите юрлицо / ИП)",
  inn: process.env.NEXT_PUBLIC_OPERATOR_INN?.trim() || "ИНН не указан",
  email: process.env.NEXT_PUBLIC_OPERATOR_EMAIL?.trim() || "privacy@pairly.space",
  address:
    process.env.NEXT_PUBLIC_OPERATOR_ADDRESS?.trim() ||
    "Адрес оператора не указан",
  rknNotice:
    process.env.NEXT_PUBLIC_OPERATOR_RKN_NOTICE?.trim() ||
    "Статус уведомления в Роскомнадзор уточняется оператором перед открытым запуском.",
} as const;
