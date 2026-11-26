"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { deleteMyAccount } from "@/lib/api/auth";

export function DeleteAccountPanel() {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (confirmText.trim().toUpperCase() !== "УДАЛИТЬ") {
      setError("Введите слово УДАЛИТЬ для подтверждения");
      return;
    }
    setBusy(true);
    setError(null);
    const result = await deleteMyAccount();
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="border border-negative/30 bg-negative-soft/40 p-5">
      <h3 className="text-base text-ink">Удаление аккаунта</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        Аккаунт будет обезличен: email и телефон удаляются, вход закрывается, публичный
        профиль скрывается. История матчей может сохраниться без ваших персональных
        данных. Подробнее — в{" "}
        <Link href="/privacy" className="text-accent hover:underline">
          политике ПДн
        </Link>
        .
      </p>
      <label className="mt-4 block">
        <span className="field-label">Введите УДАЛИТЬ</span>
        <input
          className="field"
          value={confirmText}
          onChange={(event) => setConfirmText(event.target.value)}
          autoComplete="off"
          placeholder="УДАЛИТЬ"
        />
      </label>
      {error ? (
        <p role="alert" className="mt-3 text-xs font-medium text-negative">
          {error}
        </p>
      ) : null}
      <button
        type="button"
        className="btn btn-secondary mt-4 border-negative text-negative"
        disabled={busy}
        onClick={() => void handleDelete()}
      >
        {busy ? "Удаляем…" : "Удалить мой аккаунт"}
      </button>
    </div>
  );
}
