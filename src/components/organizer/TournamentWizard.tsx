"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  MapPin,
  Rocket,
  Save,
} from "lucide-react";
import type { CategorySlug, Surface, TournamentFormat, TournamentType, Venue } from "@/lib/types";
import { createOrganizerTournament } from "@/lib/api/tournaments";
import {
  CATEGORIES,
  FORMATS,
  FORMAT_LABEL,
  SURFACES,
  TOURNAMENT_TYPES,
  TYPE_BY_VALUE,
} from "@/lib/domain";
import { cn, formatDate, formatMoney, formatTime } from "@/lib/utils";
import { CategoryBadge } from "@/components/ui/Badges";
import { MiniLabel, Panel } from "./OrganizerUI";

interface FormState {
  title: string;
  description: string;
  type: TournamentType;
  category: CategorySlug;
  surface: Surface;
  format: TournamentFormat;
  startsAt: string;
  registrationClosesAt: string;
  venueId: string;
  entryFee: string;
  maxParticipants: string;
  regulations: string;
  publish: "draft" | "registration_soon" | "registration_open";
}

function toLocalInput(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function defaultDates() {
  const start = new Date();
  start.setDate(start.getDate() + 14);
  start.setHours(10, 0, 0, 0);
  const deadline = new Date(start);
  deadline.setDate(deadline.getDate() - 2);
  deadline.setHours(20, 0, 0, 0);
  return { start: toLocalInput(start), deadline: toLocalInput(deadline) };
}

const REGULATION_PRESETS: Record<TournamentFormat, string> = {
  olympic:
    "Матчи до двух побед в сетах, тай-брейк до 7 очков. При счёте 1:1 в сетах играется решающий тай-брейк до 10 очков. Олимпийская система, матч за третье место проводится.",
  round_robin:
    "Круговой формат: каждый играет с каждым. Матчи до одного сета с тай-брейком при счёте 6:6. Победа — 2 очка, поражение — 1 очко, неявка — 0.",
  groups_playoff:
    "Групповой этап по 4 игрока, матчи до одного сета. В плей-офф выходят по два лучших игрока из каждой группы. Полуфиналы и финал — до двух побед.",
  double_elimination:
    "Двойное выбывание: после первого поражения игрок переходит в нижнюю сетку. Финал верхней и нижней сетки, гранд-финал до двух побед.",
};

export function TournamentWizard({ venues }: { venues: Venue[] }) {
  const dates = defaultDates();
  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    type: "singles",
    category: "challenger",
    surface: "hard",
    format: "olympic",
    startsAt: dates.start,
    registrationClosesAt: dates.deadline,
    venueId: venues[0]?.id ?? "v1",
    entryFee: "3000",
    maxParticipants: "16",
    regulations: REGULATION_PRESETS.olympic,
    publish: "registration_soon",
  });
  const [submitted, setSubmitted] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function changeFormat(format: TournamentFormat) {
    setForm((current) => ({
      ...current,
      format,
      regulations:
        current.regulations.trim() === REGULATION_PRESETS[current.format].trim()
          ? REGULATION_PRESETS[format]
          : current.regulations,
    }));
  }

  const errors = useMemo(() => {
    const result: Partial<Record<keyof FormState, string>> = {};
    if (form.title.trim().length < 3) result.title = "Укажите название турнира (минимум 3 символа)";
    if (!form.startsAt) result.startsAt = "Выберите дату и время старта";
    if (!form.registrationClosesAt) result.registrationClosesAt = "Укажите дедлайн регистрации";
    if (
      form.startsAt &&
      form.registrationClosesAt &&
      new Date(form.registrationClosesAt) >= new Date(form.startsAt)
    ) {
      result.registrationClosesAt = "Регистрация должна закрыться до старта турнира";
    }
    const capacity = Number(form.maxParticipants);
    if (!capacity || capacity < 4 || capacity > 128) result.maxParticipants = "Допустимо от 4 до 128 участников";
    if (form.regulations.trim().length < 20) result.regulations = "Опишите регламент — минимум 20 символов";
    return result;
  }, [form]);

  const isValid = Object.keys(errors).length === 0;
  const venue = venues.find((item) => item.id === form.venueId);
  const checklist = [
    { label: "Название и описание", done: form.title.trim().length >= 3 },
    { label: "Даты и дедлайн", done: Boolean(form.startsAt && form.registrationClosesAt) },
    { label: "Формат и вместимость", done: Number(form.maxParticipants) >= 4 },
    { label: "Регламент", done: form.regulations.trim().length >= 20 },
    { label: "Корт выбран", done: Boolean(venue) },
  ];
  const ready = checklist.filter((item) => item.done).length;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setAttempted(true);
    setSubmitError(null);
    if (!isValid) return;
    const venue = venues.find((item) => item.id === form.venueId);
    setBusy(true);
    const result = await createOrganizerTournament({
      title: form.title.trim(),
      description: form.description.trim(),
      type: form.type,
      category: form.category,
      surface: form.surface,
      format: form.format,
      status: form.publish,
      startsAt: new Date(form.startsAt).toISOString(),
      registrationClosesAt: new Date(form.registrationClosesAt).toISOString(),
      venueName: venue?.name,
      venueAddress: venue?.address,
      venueCourts: venue?.courts,
      venueSurface: venue?.surface ?? form.surface,
      entryFee: Number(form.entryFee) || 0,
      maxParticipants: Number(form.maxParticipants) || 16,
      regulations: form.regulations.trim(),
    });
    setBusy(false);
    if (!result.ok) {
      setSubmitError(result.error);
      return;
    }
    setCreatedId(result.tournament.id);
    setCreatedSlug(result.tournament.slug);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="border-t border-line pt-6 md:pt-8">
          <span className="grid size-12 place-items-center border border-positive text-positive">
            <CheckCircle2 className="size-6" aria-hidden="true" />
          </span>
          <h2 className="mt-5 text-[clamp(1.7rem,1.4rem+1.2vw,2.4rem)]">
            {form.publish === "draft"
              ? "Черновик турнира создан"
              : form.publish === "registration_open"
                ? "Турнир опубликован, регистрация открыта"
                : "Турнир опубликован"}
          </h2>
          <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-ink-muted">
            «{form.title || "Без названия"}» сохранён как {form.publish === "draft" ? "черновик" : "опубликованный турнир"}.
            Участники {form.publish === "registration_open" ? "могут записываться прямо сейчас" : "увидят анонс после открытия регистрации"}.
          </p>

          <dl className="mt-6 grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
            <div>
              <dt className="stat-label">Формат</dt>
              <dd className="mt-1 text-sm">{FORMAT_LABEL[form.format]}</dd>
            </div>
            <div>
              <dt className="stat-label">Тип</dt>
              <dd className="mt-1 text-sm">{TYPE_BY_VALUE[form.type].label}</dd>
            </div>
            <div>
              <dt className="stat-label">Старт</dt>
              <dd className="mt-1 text-sm">
                {form.startsAt ? `${formatDate(form.startsAt)}, ${formatTime(form.startsAt)}` : "—"}
              </dd>
            </div>
            <div>
              <dt className="stat-label">Корт</dt>
              <dd className="mt-1 text-sm">{venue?.name ?? "—"}</dd>
            </div>
          </dl>

          <div className="mt-6 border-y border-line py-4">
            <p className="text-[0.78rem] uppercase tracking-[0.16em] text-ink-muted">Что дальше</p>
            <ol className="mt-2 space-y-1.5 text-[0.95rem] leading-relaxed text-ink-soft">
              <li>1. Проверьте регламент и взнос в карточке турнира.</li>
              <li>2. Подтвердите заявки игроков.</li>
              <li>3. Сгенерируйте сетку после закрытия регистрации.</li>
            </ol>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {createdId ? (
              <Link href={`/organizer/tournaments/${createdId}`} className="btn btn-primary">
                Открыть карточку
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            ) : (
              <Link href="/organizer/tournaments" className="btn btn-primary">
                К списку турниров
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            )}
            {createdSlug && (
              <Link href={`/tournaments/${createdSlug}`} className="btn btn-secondary">
                Публичная страница
              </Link>
            )}
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setSubmitted(false);
                setAttempted(false);
                setCreatedId(null);
                setCreatedSlug(null);
              }}
            >
              Создать ещё один
            </button>
          </div>
        </div>

        <aside className="space-y-8">
          <Panel title="Сводка">
            <MiniLabel>Турнир</MiniLabel>
            <p className="mt-1 text-sm text-ink">{form.title || "Без названия"}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <CategoryBadge category={form.category} />
              <span className="badge badge-neutral">{TYPE_BY_VALUE[form.type].label}</span>
            </div>
            <div className="mt-4 space-y-2 border-t border-line pt-4 text-sm text-ink-muted">
              <p className="flex items-center gap-2">
                <CalendarDays className="size-3.5 text-ink-faint" aria-hidden="true" />
                {form.startsAt ? `${formatDate(form.startsAt)}, ${formatTime(form.startsAt)}` : "Дата не выбрана"}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="size-3.5 text-ink-faint" aria-hidden="true" />
                {venue?.name ?? "Корт не выбран"}
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
              <div>
                <p className="display text-[1.4rem] leading-none tabular-nums">
                  {form.entryFee ? formatMoney(Number(form.entryFee)) : "Бесплатно"}
                </p>
                <p className="stat-label mt-1">взнос</p>
              </div>
              <div className="text-right">
                <p className="display text-[1.4rem] leading-none tabular-nums">{form.maxParticipants}</p>
                <p className="stat-label mt-1">участников</p>
              </div>
            </div>
          </Panel>
        </aside>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-8">
        <Panel
          title="01 · Основное"
          description="Название, тип и категория определяют, где турнир появится на сайте."
        >
          <div className="grid gap-4">
            <label className="block">
              <span className="field-label">Название турнира</span>
              <input
                className={cn("field", attempted && errors.title && "border-negative")}
                placeholder="Например, Winter Cup 2027"
                value={form.title}
                onChange={(event) => update("title", event.target.value)}
              />
              {attempted && errors.title && <span className="mt-1 block text-sm text-negative">{errors.title}</span>}
            </label>

            <label className="block">
              <span className="field-label">Описание для страницы турнира</span>
              <textarea
                className="field min-h-[92px] resize-y"
                placeholder="Два игровых дня, олимпийская система, утешительная сетка..."
                value={form.description}
                onChange={(event) => update("description", event.target.value)}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="field-label">Тип</span>
                <select className="field" value={form.type} onChange={(event) => update("type", event.target.value as TournamentType)}>
                  {TOURNAMENT_TYPES.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="field-label">Категория</span>
                <select className="field" value={form.category} onChange={(event) => update("category", event.target.value as CategorySlug)}>
                  {CATEGORIES.map((item) => (
                    <option key={item.slug} value={item.slug}>{item.name}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="field-label">Покрытие</span>
                <select className="field" value={form.surface} onChange={(event) => update("surface", event.target.value as Surface)}>
                  {SURFACES.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </Panel>

        <Panel title="02 · Формат и регламент" description="Сетка и правила, по которым будут играться матчи.">
          <div className="grid gap-2 sm:grid-cols-2">
            {FORMATS.map((item) => (
              <label
                key={item.value}
                className={cn(
                  "flex cursor-pointer items-start gap-3 border p-3 transition-colors",
                  form.format === item.value
                    ? "border-ink"
                    : "border-line hover:border-line-strong",
                )}
              >
                <input
                  type="radio"
                  name="format"
                  value={item.value}
                  checked={form.format === item.value}
                  onChange={() => changeFormat(item.value)}
                  className="mt-1 size-3.5 accent-[var(--color-accent)]"
                />
                <span>
                  <span className="block text-[0.95rem] font-medium text-ink">{item.label}</span>
                  <span className="mt-0.5 block text-sm leading-relaxed text-ink-muted">{item.description}</span>
                </span>
              </label>
            ))}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="field-label">Максимум участников</span>
              <input
                type="number"
                min={4}
                max={128}
                step={4}
                className={cn("field", attempted && errors.maxParticipants && "border-negative")}
                value={form.maxParticipants}
                onChange={(event) => update("maxParticipants", event.target.value)}
              />
              {attempted && errors.maxParticipants && (
                <span className="mt-1 block text-sm text-negative">{errors.maxParticipants}</span>
              )}
            </label>
            <label className="block">
              <span className="field-label">Взнос, ₽</span>
              <input
                type="number"
                min={0}
                step={100}
                className="field"
                value={form.entryFee}
                onChange={(event) => update("entryFee", event.target.value)}
              />
            </label>
            <div className="flex items-end pb-1">
              <p className="text-sm leading-relaxed text-ink-faint">
                Для парных турниров вместимость считается в парах.
              </p>
            </div>
          </div>

          <label className="mt-4 block">
            <span className="field-label">Регламент</span>
            <textarea
              className={cn("field min-h-[132px] resize-y", attempted && errors.regulations && "border-negative")}
              value={form.regulations}
              onChange={(event) => update("regulations", event.target.value)}
            />
            {attempted && errors.regulations && (
              <span className="mt-1 block text-sm text-negative">{errors.regulations}</span>
            )}
            <button
              type="button"
              className="mt-2 text-sm text-ink-muted underline decoration-line underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
              onClick={() => update("regulations", REGULATION_PRESETS[form.format])}
            >
              Подставить типовой регламент для формата «{FORMAT_LABEL[form.format]}»
            </button>
          </label>
        </Panel>

        <Panel title="03 · Даты и корты" description="Расписание и дедлайн регистрации.">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="field-label">Старт турнира</span>
              <input
                type="datetime-local"
                className={cn("field", attempted && errors.startsAt && "border-negative")}
                value={form.startsAt}
                onChange={(event) => update("startsAt", event.target.value)}
              />
              {attempted && errors.startsAt && <span className="mt-1 block text-sm text-negative">{errors.startsAt}</span>}
            </label>
            <label className="block">
              <span className="field-label">Регистрация закрывается</span>
              <input
                type="datetime-local"
                className={cn("field", attempted && errors.registrationClosesAt && "border-negative")}
                value={form.registrationClosesAt}
                onChange={(event) => update("registrationClosesAt", event.target.value)}
              />
              {attempted && errors.registrationClosesAt && (
                <span className="mt-1 block text-sm text-negative">{errors.registrationClosesAt}</span>
              )}
            </label>
          </div>
          <label className="mt-4 block">
            <span className="field-label">Корт</span>
            <select className="field" value={form.venueId} onChange={(event) => update("venueId", event.target.value)}>
              {venues.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} · {item.courts} {item.courts === 1 ? "корт" : "корта"}
                </option>
              ))}
            </select>
          </label>
        </Panel>

        <Panel title="04 · Публикация" description="Определяет видимость турнира и приём заявок.">
          <div className="grid gap-2 sm:grid-cols-3">
            {[
              { value: "draft", label: "Черновик", hint: "Виден только организаторам" },
              { value: "registration_soon", label: "Анонс", hint: "На сайте, без приёма заявок" },
              { value: "registration_open", label: "Открыть регистрацию", hint: "Игроки могут записываться" },
            ].map((item) => (
              <label
                key={item.value}
                className={cn(
                  "cursor-pointer border p-3 transition-colors",
                  form.publish === item.value ? "border-ink" : "border-line hover:border-line-strong",
                )}
              >
                <span className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="publish"
                    checked={form.publish === item.value}
                    onChange={() => update("publish", item.value as FormState["publish"])}
                    className="size-3.5 accent-[var(--color-accent)]"
                  />
                  <span className="text-[0.9375rem] font-medium text-ink">{item.label}</span>
                </span>
                <span className="mt-1 block pl-5 text-sm text-ink-muted">{item.hint}</span>
              </label>
            ))}
          </div>

          {attempted && !isValid && (
            <p role="alert" className="mt-4 flex items-start gap-2 border border-negative/30 px-3 py-2 text-sm text-negative">
              <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              Проверьте выделенные поля: {Object.values(errors).length} замечаний.
            </p>
          )}
          {submitError && (
            <p role="alert" className="mt-4 flex items-start gap-2 border border-negative/30 px-3 py-2 text-sm text-negative">
              <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              {submitError}
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line pt-4">
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {form.publish === "draft" ? (
                <>
                  <Save className="size-4" aria-hidden="true" />
                  {busy ? "Сохранение…" : "Сохранить черновик"}
                </>
              ) : (
                <>
                  <Rocket className="size-4" aria-hidden="true" />
                  {busy
                    ? "Публикация…"
                    : form.publish === "registration_open"
                      ? "Опубликовать и открыть регистрацию"
                      : "Опубликовать анонс"}
                </>
              )}
            </button>
            <Link href="/organizer/tournaments" className="btn btn-secondary">
              Отмена
            </Link>
          </div>
        </Panel>
      </div>

      <aside className="space-y-8">
        <div className="sticky top-20 space-y-8">
          <Panel title="Предпросмотр карточки">
            <div className="flex flex-wrap items-center gap-1.5">
              <CategoryBadge category={form.category} />
              <span className="badge badge-neutral">{TYPE_BY_VALUE[form.type].label}</span>
            </div>
            <p className="mt-3 text-base font-medium leading-snug text-ink">
              {form.title || "Название турнира"}
            </p>
            <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-ink-muted">
              {form.description || "Описание появится здесь. Расскажите игрокам о формате и атмосфере турнира."}
            </p>
            <div className="mt-4 space-y-2 border-t border-line pt-4 text-sm text-ink-muted">
              <p className="flex items-center gap-2">
                <CalendarDays className="size-3.5 text-ink-faint" aria-hidden="true" />
                {form.startsAt ? `${formatDate(form.startsAt)}, ${formatTime(form.startsAt)}` : "Дата не выбрана"}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="size-3.5 text-ink-faint" aria-hidden="true" />
                {venue?.name ?? "Корт не выбран"}
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
              <div>
                <p className="display text-[1.4rem] leading-none tabular-nums">
                  {form.entryFee ? formatMoney(Number(form.entryFee)) : "Бесплатно"}
                </p>
                <p className="stat-label mt-1">взнос</p>
              </div>
              <div className="text-right">
                <p className="display text-[1.4rem] leading-none tabular-nums">{form.maxParticipants}</p>
                <p className="stat-label mt-1">мест</p>
              </div>
            </div>
          </Panel>

          <Panel title="Готовность" description={`${ready} из ${checklist.length} пунктов`}>
            <div className="h-px bg-line">
              <div
                className={cn("h-px transition-all", ready === checklist.length ? "bg-positive" : "bg-ink")}
                style={{ width: `${(ready / checklist.length) * 100}%` }}
              />
            </div>
            <ul className="mt-4 space-y-2">
              {checklist.map((item) => (
                <li key={item.label} className="flex items-center gap-2 text-sm">
                  <span
                    className={cn(
                      "grid size-4 shrink-0 place-items-center border",
                      item.done ? "border-positive text-positive" : "border-line text-ink-faint",
                    )}
                  >
                    <Check className="size-2.5" aria-hidden="true" />
                  </span>
                  <span className={item.done ? "text-ink-soft" : "text-ink-muted"}>{item.label}</span>
                </li>
              ))}
            </ul>
          </Panel>

        </div>
      </aside>
    </form>
  );
}
