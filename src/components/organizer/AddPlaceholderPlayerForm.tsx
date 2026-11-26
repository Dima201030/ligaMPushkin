"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, UserPlus } from "lucide-react";
import { createPlaceholderPlayer } from "@/lib/api/organizer-players";
import { cn } from "@/lib/utils";
import { Panel } from "./OrganizerUI";

export function AddPlaceholderPlayerForm() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [okMessage, setOkMessage] = useState<string | null>(null);

  const nameError = useMemo(() => {
    if (!firstName.trim() || !lastName.trim()) return "Укажите имя и фамилию";
    return null;
  }, [firstName, lastName]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setAttempted(true);
    setSubmitError(null);
    setOkMessage(null);
    if (nameError) return;

    setBusy(true);
    const result = await createPlaceholderPlayer({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim() || undefined,
    });
    setBusy(false);

    if (!result.ok) {
      setSubmitError(result.error);
      return;
    }

    setOkMessage(
      `${lastName.trim()} ${firstName.trim()} добавлен без аккаунта. Можно включать в турнир; когда человек зарегистрируется — объедините с заявкой.`,
    );
    setFirstName("");
    setLastName("");
    setPhone("");
    setAttempted(false);
    router.refresh();
  }

  return (
    <Panel
      title="Добавить игрока"
      description="Без email и пароля — заготовка для турнира и рейтинга. Позже свяжите с заявкой на регистрацию."
    >
      <form onSubmit={submit} className="max-w-2xl space-y-5 py-2" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="field-label">Имя</span>
            <input
              className={cn("field", attempted && !firstName.trim() && "border-negative")}
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              autoComplete="off"
              disabled={busy}
              required
            />
          </label>
          <label className="block">
            <span className="field-label">Фамилия</span>
            <input
              className={cn("field", attempted && !lastName.trim() && "border-negative")}
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              autoComplete="off"
              disabled={busy}
              required
            />
          </label>
        </div>

        <label className="block max-w-md">
          <span className="field-label">Телефон (необязательно)</span>
          <input
            className="field"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            inputMode="tel"
            autoComplete="tel"
            disabled={busy}
            placeholder="+7…"
          />
        </label>

        {attempted && nameError ? <p className="text-sm text-negative">{nameError}</p> : null}

        {submitError ? (
          <p
            role="alert"
            className="flex items-start gap-2 border border-negative/30 bg-negative/5 px-3 py-2.5 text-[0.95rem] text-negative"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{submitError}</span>
          </p>
        ) : null}

        {okMessage ? <p className="text-sm text-positive">{okMessage}</p> : null}

        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <UserPlus className="size-4" aria-hidden="true" />}
          Добавить игрока
        </button>
      </form>
    </Panel>
  );
}
