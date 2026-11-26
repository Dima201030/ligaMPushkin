"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Save } from "lucide-react";
import { updateOrganizerClub, type LeagueClub } from "@/lib/api/clubs";
import { CLUB_LIMITS, validateClubFields } from "@/lib/club-limits";
import { cn } from "@/lib/utils";
import { MiniLabel, Panel } from "./OrganizerUI";

function settingsString(settings: Record<string, unknown> | undefined, key: string): string {
  const value = settings?.[key];
  return typeof value === "string" ? value : "";
}

export function ClubSettingsForm({ club }: { club: LeagueClub }) {
  const router = useRouter();
  const [name, setName] = useState(club.name);
  const [city, setCity] = useState(club.city ?? "");
  const [timezone, setTimezone] = useState(settingsString(club.settings, "timezone") || "Europe/Moscow");
  const [locale, setLocale] = useState(settingsString(club.settings, "locale") || "ru");
  const [attempted, setAttempted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [okMessage, setOkMessage] = useState<string | null>(null);
  const clubSlug = club.slug;

  const errors = useMemo(() => {
    const field = validateClubFields({ name, city, requireSlug: false });
    const result: { name?: string; city?: string; timezone?: string; locale?: string } = {
      ...field,
    };
    if (timezone.trim() && timezone.trim().length < 3) result.timezone = "Укажите IANA timezone";
    if (locale.trim().length > 32) result.locale = "Locale слишком длинный";
    return result;
  }, [name, city, timezone, locale]);

  const isValid = Object.keys(errors).length === 0;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setAttempted(true);
    setSubmitError(null);
    setOkMessage(null);
    if (!isValid) return;

    setBusy(true);
    const result = await updateOrganizerClub({
      name: name.trim(),
      city: city.trim(),
      settings: {
        timezone: timezone.trim() || null,
        locale: locale.trim() || null,
      },
      clubSlug,
    });
    setBusy(false);

    if (!result.ok) {
      setSubmitError(result.error);
      return;
    }

    setName(result.club.name);
    setCity(result.club.city ?? "");
    setTimezone(settingsString(result.club.settings, "timezone") || "Europe/Moscow");
    setLocale(settingsString(result.club.settings, "locale") || "ru");
    setOkMessage("Сохранено");
    router.refresh();
  }

  return (
    <Panel
      title="Параметры клуба"
      description={`Slug ${club.slug} не меняется. Settings: только timezone и locale (без секретов).`}
    >
      <form onSubmit={submit} className="max-w-xl space-y-5 py-2" noValidate>
        <label className="block">
          <span className="field-label">Название</span>
          <input
            className={cn("field", attempted && errors.name && "border-negative")}
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={CLUB_LIMITS.nameMax}
            disabled={busy}
            required
          />
          {attempted && errors.name ? (
            <p className="mt-1.5 text-[0.7rem] text-negative">{errors.name}</p>
          ) : null}
        </label>

        <label className="block">
          <span className="field-label">Город</span>
          <input
            className={cn("field", attempted && errors.city && "border-negative")}
            value={city}
            onChange={(event) => setCity(event.target.value)}
            maxLength={CLUB_LIMITS.cityMax}
            disabled={busy}
            placeholder="Санкт-Петербург"
          />
          {attempted && errors.city ? (
            <p className="mt-1.5 text-[0.7rem] text-negative">{errors.city}</p>
          ) : null}
        </label>

        <label className="block">
          <span className="field-label">Timezone</span>
          <input
            className={cn("field font-mono text-[0.85rem]", attempted && errors.timezone && "border-negative")}
            value={timezone}
            onChange={(event) => setTimezone(event.target.value)}
            disabled={busy}
            placeholder="Europe/Moscow"
            spellCheck={false}
          />
          {attempted && errors.timezone ? (
            <p className="mt-1.5 text-[0.7rem] text-negative">{errors.timezone}</p>
          ) : (
            <p className="mt-1.5 text-[0.68rem] text-ink-faint">IANA, например Europe/Moscow</p>
          )}
        </label>

        <label className="block">
          <span className="field-label">Locale</span>
          <input
            className={cn("field", attempted && errors.locale && "border-negative")}
            value={locale}
            onChange={(event) => setLocale(event.target.value)}
            disabled={busy}
            placeholder="ru"
            spellCheck={false}
          />
          {attempted && errors.locale ? (
            <p className="mt-1.5 text-[0.7rem] text-negative">{errors.locale}</p>
          ) : null}
        </label>

        {submitError ? (
          <p
            role="alert"
            className="flex items-start gap-2 border border-negative/30 bg-negative/5 px-3 py-2.5 text-[0.78rem] text-negative"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {submitError}
          </p>
        ) : null}
        {okMessage ? (
          <p role="status" className="text-[0.78rem] text-positive">
            {okMessage}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button type="submit" className="btn btn-primary" disabled={busy || (attempted && !isValid)}>
            {busy ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="size-4" aria-hidden="true" />
            )}
            Сохранить
          </button>
          <MiniLabel>Настройки клуба владельца</MiniLabel>
        </div>
      </form>
    </Panel>
  );
}
