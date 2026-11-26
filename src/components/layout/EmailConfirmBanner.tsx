"use client";

import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { fetchSession, resendConfirmEmail } from "@/lib/api/auth";

type BannerState = "loading" | "hidden" | "visible";

export function EmailConfirmBanner() {
  const [state, setState] = useState<BannerState>("loading");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchSession()
      .then((session) => {
        if (!alive) return;
        if (session && !session.user.emailVerified) {
          setEmail(session.user.email);
          setState("visible");
          return;
        }
        setState("hidden");
      })
      .catch(() => {
        if (alive) setState("hidden");
      });
    return () => {
      alive = false;
    };
  }, []);

  if (state !== "visible") {
    return null;
  }

  async function resend() {
    if (!email || busy) return;
    setBusy(true);
    setNotice(null);
    setError(null);
    const result = await resendConfirmEmail(email);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setNotice("Письмо отправлено. Проверьте почту и папку «Спам».");
  }

  return (
    <div
      className="border-b border-warning/35 bg-warning-soft text-warning"
      role="status"
      data-testid="email-confirm-banner"
    >
      <div className="page-shell flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-canvas/70 text-warning">
            <Mail className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-snug text-ink">
              Подтвердите email
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">
              Мы отправили ссылку на{" "}
              <span className="font-semibold text-ink">{email}</span>. Без
              подтверждения запись на турниры недоступна.
            </p>
            {notice && (
              <p className="mt-1 text-xs font-medium text-positive">{notice}</p>
            )}
            {error && (
              <p className="mt-1 text-xs font-medium text-negative" role="alert">
                {error}
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          className="btn btn-secondary shrink-0 self-start sm:self-center"
          onClick={resend}
          disabled={busy}
        >
          {busy ? "Отправка…" : "Отправить письмо ещё раз"}
        </button>
      </div>
    </div>
  );
}
