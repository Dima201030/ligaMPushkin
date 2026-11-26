"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Trash2 } from "lucide-react";
import {
  deleteOrganizerTournament,
  setOrganizerTournamentVisibility,
} from "@/lib/api/tournaments";
import { cn } from "@/lib/utils";
import { MiniLabel, Panel } from "./OrganizerUI";
import { Modal } from "@/components/motion/Modal";

export function TournamentDangerZone({
  id,
  slug,
  title,
  hidden,
}: {
  id: string;
  slug: string;
  title: string;
  hidden: boolean;
}) {
  const router = useRouter();
  const [isHidden, setIsHidden] = useState(hidden);
  const [busy, setBusy] = useState<"visibility" | "delete" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function toggleVisibility() {
    if (busy) return;
    setBusy("visibility");
    setError(null);
    const result = await setOrganizerTournamentVisibility(id, !isHidden);
    setBusy(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setIsHidden(result.hidden);
    router.refresh();
  }

  async function remove() {
    if (busy) return;
    setBusy("delete");
    setError(null);
    const result = await deleteOrganizerTournament(id);
    if (!result.ok) {
      setBusy(null);
      setConfirmOpen(false);
      setError(result.error);
      return;
    }
    router.push("/organizer/tournaments");
    router.refresh();
  }

  return (
    <Panel title="Видимость и удаление" description="Управление публикацией турнира">
      <MiniLabel>Идентификатор</MiniLabel>
      <p className="mt-1 break-all font-mono text-xs text-ink-soft">{id} · {slug}</p>

      <dl className="mt-4 space-y-2 border-t border-line pt-4 text-[0.72rem]">
        <div className="flex justify-between gap-3">
          <dt className="text-ink-muted">На публичном сайте</dt>
          <dd className={cn("text-right", isHidden ? "text-warning" : "text-positive")}>
            {isHidden ? "Скрыт" : "Виден"}
          </dd>
        </div>
      </dl>

      <div className="mt-4 space-y-2 border-t border-line pt-4">
        <button
          type="button"
          className="btn btn-secondary w-full"
          onClick={() => void toggleVisibility()}
          disabled={busy !== null}
        >
          {busy === "visibility" ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : isHidden ? (
            <Eye className="size-4" aria-hidden="true" />
          ) : (
            <EyeOff className="size-4" aria-hidden="true" />
          )}
          {isHidden ? "Показать на сайте" : "Скрыть с сайта"}
        </button>
        <button
          type="button"
          className="btn btn-ghost w-full text-negative hover:border-negative"
          onClick={() => setConfirmOpen(true)}
          disabled={busy !== null}
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Удалить турнир
        </button>
      </div>

      <p className="mt-3 text-[0.62rem] leading-relaxed text-ink-faint">
        Скрытый турнир остаётся в кабинете, но недоступен на публичном сайте. Удаление необратимо.
      </p>

      {error && (
        <p role="alert" className="mt-3 border border-negative/40 px-3 py-2 text-[0.7rem] text-negative">
          {error}
        </p>
      )}

      <Modal
        open={confirmOpen}
        title={`Удалить «${title}»?`}
        onClose={() => setConfirmOpen(false)}
        confirmLabel="Удалить"
        cancelLabel="Отмена"
        onConfirm={() => void remove()}
        busy={busy === "delete"}
      >
        Вместе с турниром удалятся заявки, матчи, сетка и галерея. Действие необратимо.
      </Modal>
    </Panel>
  );
}
