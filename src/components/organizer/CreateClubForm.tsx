"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Building2, Loader2 } from "lucide-react";
import { createOrganizerClub } from "@/lib/api/clubs";
import { CLUB_LIMITS, validateClubFields } from "@/lib/club-limits";
import { normalizeClubSlug } from "@/lib/club/tenant";
import { cn } from "@/lib/utils";
import { MiniLabel, Panel } from "./OrganizerUI";

function suggestSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/ё/g, "e")
    .replace(/[^a-z0-9а-я]+/gi, "-")
    .replace(/[а-я]+/gi, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function CreateClubForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [city, setCity] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const errors = useMemo(
    () => validateClubFields({ name, slug, city, requireSlug: true }),
    [name, slug, city],
  );

  const isValid = Object.keys(errors).length === 0;

  function onNameChange(value: string) {
    setName(value);
    if (!slugTouched) {
      setSlug(suggestSlug(value));
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setAttempted(true);
    setSubmitError(null);
    if (!isValid) return;

    const normalized = normalizeClubSlug(slug);
    if (!normalized) return;

    setBusy(true);
    const result = await createOrganizerClub({
      slug: normalized,
      name: name.trim(),
      city: city.trim(),
    });
    setBusy(false);

    if (!result.ok) {
      setSubmitError(result.error);
      return;
    }

    // No current-club cookie switch — club is chosen on the tournament card.
    router.push("/organizer/clubs");
    router.refresh();
  }

  return (
    <Panel
      title="Новый клуб"
      description="Создаёт клуб, рейтинг сезона и вашу роль owner. Турниры публикуются с выбором клуба на карточке — без глобального switcher."
    >
      <form onSubmit={submit} className="max-w-xl space-y-5 py-2" noValidate>
        <label className="block">
          <span className="field-label">Название</span>
          <input
            className={cn("field", attempted && errors.name && "border-negative")}
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="Demo Tennis"
            autoComplete="organization"
            maxLength={CLUB_LIMITS.nameMax}
            disabled={busy}
            required
          />
          {attempted && errors.name ? (
            <p className="mt-1.5 text-[0.7rem] text-negative">{errors.name}</p>
          ) : null}
        </label>

        <label className="block">
          <span className="field-label">Slug</span>
          <input
            className={cn("field font-mono text-[0.85rem]", attempted && errors.slug && "border-negative")}
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(event.target.value.toLowerCase().replace(/\s+/g, "-"));
            }}
            placeholder="demo-tennis"
            autoComplete="off"
            spellCheck={false}
            maxLength={CLUB_LIMITS.slugMax}
            disabled={busy}
            required
          />
          <p className="mt-1.5 text-[0.68rem] text-ink-faint">
            Латиница и дефисы, {CLUB_LIMITS.slugMin}–{CLUB_LIMITS.slugMax} символов. В URL: /c/
            {normalizeClubSlug(slug) || "slug"}
          </p>
          {attempted && errors.slug ? (
            <p className="mt-1 text-[0.7rem] text-negative">{errors.slug}</p>
          ) : null}
        </label>

        <label className="block">
          <span className="field-label">Город (необязательно)</span>
          <input
            className={cn("field", attempted && errors.city && "border-negative")}
            value={city}
            onChange={(event) => setCity(event.target.value)}
            placeholder="Санкт-Петербург"
            maxLength={CLUB_LIMITS.cityMax}
            disabled={busy}
          />
          {attempted && errors.city ? (
            <p className="mt-1.5 text-[0.7rem] text-negative">{errors.city}</p>
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

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button type="submit" className="btn btn-primary" disabled={busy || (attempted && !isValid)}>
            {busy ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Building2 className="size-4" aria-hidden="true" />
            )}
            Создать клуб
          </button>
          <MiniLabel>Timezone по умолчанию — Europe/Moscow</MiniLabel>
        </div>
      </form>
    </Panel>
  );
}
