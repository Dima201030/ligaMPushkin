"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  Clock3,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { CATEGORIES } from "@/lib/domain";
import {
  createAccount,
  findAccountByEmail,
  hashPassword,
} from "@/lib/accounts";

type LoginState =
  | { kind: "idle" }
  | { kind: "error"; message: string }
  | { kind: "pending"; name: string }
  | { kind: "rejected"; name: string };

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [state, setState] = useState<LoginState>({ kind: "idle" });
  const [checking, setChecking] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "");

    if (!email || !password) {
      setState({ kind: "error", message: "Заполните email и пароль" });
      return;
    }

    setChecking(true);
    setState({ kind: "idle" });

    const account = findAccountByEmail(email);
    if (!account) {
      setChecking(false);
      setState({ kind: "error", message: "Неверный email или пароль" });
      return;
    }

    const name = `${account.firstName} ${account.lastName}`;

    if (account.status === "pending") {
      setChecking(false);
      setState({ kind: "pending", name });
      return;
    }

    if (account.status === "rejected") {
      setChecking(false);
      setState({ kind: "rejected", name });
      return;
    }

    const passwordHash = await hashPassword(email, password);
    setChecking(false);

    if (passwordHash !== account.passwordHash) {
      setState({ kind: "error", message: "Неверный email или пароль" });
      return;
    }

    router.push("/cabinet");
  }

  return (
    <div>
      <p className="eyebrow">Личный кабинет</p>
      <h1 className="mt-3 text-3xl text-navy">Вход в лигу</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-muted">
        Следите за регистрацией, рейтингом и историей матчей.
      </p>

      {state.kind === "pending" ? (
        <div className="mt-7 border border-line bg-surface-muted p-5" role="status">
          <span className="grid size-11 place-items-center rounded-full bg-warning-soft text-warning">
            <Clock3 className="size-5" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-xl text-navy">Заявка на подтверждении</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            {state.name}, аккаунт ещё не подтверждён администратором лиги. Проверяем имя,
            фамилию и уровень — обычно это занимает несколько часов.
          </p>
          <p className="mt-3 text-xs leading-relaxed text-ink-muted">
            Вход откроется, когда заявку одобрят. Если данные указаны с ошибкой, администратор
            исправит их при подтверждении.
          </p>
          <div className="mt-5 flex flex-col gap-2">
            <button
              type="button"
              className="btn btn-secondary w-full"
              onClick={() => setState({ kind: "idle" })}
            >
              Войти другим аккаунтом
            </button>
            <Link href="/register" className="btn btn-primary w-full">
              Подать новую заявку
            </Link>
          </div>
        </div>
      ) : (
        <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
          <label>
            <span className="field-label">Email</span>
            <input
              className="field"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
            />
          </label>
          <label>
            <span className="field-label">Пароль</span>
            <span className="relative block">
              <input
                className="field pr-10"
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-ink-faint hover:text-ink"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </span>
          </label>

          <div className="flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-xs text-ink-muted">
              <input type="checkbox" name="remember" className="size-4 accent-[var(--color-accent)]" />
              Запомнить меня
            </label>
            <button type="button" className="text-xs font-semibold text-accent hover:underline">
              Забыли пароль?
            </button>
          </div>

          {state.kind === "error" && (
            <p role="alert" className="rounded-md bg-negative-soft px-3 py-2 text-xs font-medium text-negative">
              {state.message}
            </p>
          )}

          {state.kind === "rejected" && (
            <p role="alert" className="rounded-md bg-negative-soft px-3 py-2 text-xs font-medium text-negative">
              Заявка {state.name} отклонена. Свяжитесь с организатором лиги, чтобы обсудить причину.
            </p>
          )}

          <button type="submit" className="btn btn-primary w-full" disabled={checking}>
            {checking ? "Проверяем…" : "Войти"}
            {!checking && <ArrowRight className="size-4" aria-hidden="true" />}
          </button>
        </form>
      )}

      <button
        type="button"
        className="btn btn-secondary mt-3 w-full"
        onClick={() => router.push("/cabinet")}
      >
        <ShieldCheck className="size-4" aria-hidden="true" />
        Демо-вход игрока
      </button>

      <button
        type="button"
        className="btn btn-secondary mt-2 w-full"
        onClick={() => router.push("/organizer")}
      >
        <KeyRound className="size-4" aria-hidden="true" />
        Демо-вход организатора
      </button>

      <div className="my-6 flex items-center gap-3 text-[0.66rem] font-semibold uppercase tracking-[0.1em] text-ink-faint">
        <span className="h-px flex-1 bg-line" />
        или
        <span className="h-px flex-1 bg-line" />
      </div>

      <p className="text-center text-sm text-ink-muted">
        Ещё не в лиге?{" "}
        <Link href="/register" className="font-semibold text-accent hover:underline">
          Зарегистрироваться
        </Link>
      </p>
      <p className="mt-3 text-center text-xs text-ink-faint">
        Вход открывается после подтверждения имени, фамилии и уровня администратором.
      </p>
    </div>
  );
}

export function RegisterForm() {
  const [step, setStep] = useState<"form" | "done">("form");
  const [level, setLevel] = useState("rookies");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [applicantName, setApplicantName] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const firstName = String(form.get("firstName") ?? "").trim();
    const lastName = String(form.get("lastName") ?? "").trim();
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const phone = String(form.get("phone") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const passwordRepeat = String(form.get("passwordRepeat") ?? "");

    if (!firstName || !lastName || !email) {
      setError("Заполните имя, фамилию и email");
      return;
    }
    if (password.length < 8) {
      setError("Пароль должен содержать минимум 8 символов");
      return;
    }
    if (password !== passwordRepeat) {
      setError("Пароли не совпадают");
      return;
    }

    setSubmitting(true);
    setError(null);

    const passwordHash = await hashPassword(email, password);
    const result = createAccount({
      firstName,
      lastName,
      email,
      phone,
      level: level as (typeof CATEGORIES)[number]["slug"],
      passwordHash,
    });

    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setApplicantName(`${result.account.firstName} ${result.account.lastName}`);
    setStep("done");
  }

  if (step === "done") {
    return (
      <div>
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-warning-soft text-warning">
          <Clock3 className="size-7" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-center text-2xl text-navy">Заявка отправлена</h1>
        <p className="mt-3 text-center text-sm leading-relaxed text-ink-muted">
          {applicantName}, аккаунт создан и ждёт подтверждения. Администратор проверит имя,
          фамилию и уровень — после этого вход станет доступен.
        </p>

        <ol className="mt-6 space-y-3 border-y border-line py-5 text-sm text-ink-soft">
          <li className="flex gap-3">
            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-positive-soft text-positive">
              <Check className="size-3" aria-hidden="true" />
            </span>
            Регистрация завершена — данные сохранены.
          </li>
          <li className="flex gap-3">
            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-warning-soft text-warning">
              <Clock3 className="size-3" aria-hidden="true" />
            </span>
            Администратор проверяет имя, фамилию и уровень.
          </li>
          <li className="flex gap-3 text-ink-muted">
            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-canvas text-ink-faint">
              <UserCheck className="size-3" aria-hidden="true" />
            </span>
            После подтверждения вы входите с тем же email и паролем.
          </li>
        </ol>

        <div className="mt-6 flex flex-col gap-2">
          <Link href="/login" className="btn btn-primary">Перейти ко входу</Link>
          <Link href="/tournaments" className="btn btn-secondary">Смотреть турниры</Link>
        </div>
        <p className="mt-4 text-center text-[0.65rem] leading-relaxed text-ink-faint">
          Демо-режим: заявка хранится в этом браузере. После подключения бэкенда она попадёт
          в базу лиги и будет видна всем организаторам.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="eyebrow">Новый игрок</p>
      <h1 className="mt-3 text-3xl text-navy">Регистрация в лиге</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-muted">
        Создайте аккаунт. Администратор подтвердит имя, фамилию и уровень — только после
        этого вход в личный кабинет станет доступен.
      </p>

      <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-3 sm:grid-cols-2">
          <label>
            <span className="field-label">Имя</span>
            <input className="field" name="firstName" required autoComplete="given-name" placeholder="Иван" />
          </label>
          <label>
            <span className="field-label">Фамилия</span>
            <input className="field" name="lastName" required autoComplete="family-name" placeholder="Петров" />
          </label>
        </div>
        <label>
          <span className="field-label">Email</span>
          <input className="field" type="email" name="email" required autoComplete="email" placeholder="you@example.com" />
        </label>
        <label>
          <span className="field-label">Телефон <span className="normal-case tracking-normal text-ink-faint">— необязательно</span></span>
          <input className="field" type="tel" name="phone" autoComplete="tel" placeholder="+7 (___) ___-__-__" />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label>
            <span className="field-label">Пароль</span>
            <input
              className="field"
              type="password"
              name="password"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Минимум 8 символов"
            />
          </label>
          <label>
            <span className="field-label">Повторите пароль</span>
            <input
              className="field"
              type="password"
              name="passwordRepeat"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Ещё раз"
            />
          </label>
        </div>
        <label>
          <span className="field-label">Уровень игры</span>
          <select
            className="field"
            value={level}
            onChange={(event) => setLevel(event.target.value)}
            name="level"
          >
            {CATEGORIES.map((item) => (
              <option key={item.slug} value={item.slug}>{item.name} — {item.note}</option>
            ))}
          </select>
        </label>
        <p className="text-[0.68rem] leading-relaxed text-ink-faint">
          Уровень — предварительный: администратор проверит его при подтверждении аккаунта.
        </p>
        <label className="flex items-start gap-2 text-[0.68rem] leading-relaxed text-ink-muted">
          <input type="checkbox" required className="mt-0.5 size-4 accent-[var(--color-accent)]" />
          Согласен с правилами лиги и обработкой персональных данных
        </label>

        {error && (
          <p role="alert" className="rounded-md bg-negative-soft px-3 py-2 text-xs font-medium text-negative">
            {error}
          </p>
        )}

        <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
          {submitting ? "Отправляем…" : "Создать аккаунт"}
          {!submitting && <ArrowRight className="size-4" aria-hidden="true" />}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-ink-muted">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="font-semibold text-accent hover:underline">Войти</Link>
      </p>
    </div>
  );
}
