"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Eye, EyeOff, Loader2, Pencil, Trash2 } from "lucide-react";
import {
  deleteOrganizerTournament,
  setOrganizerTournamentVisibility,
} from "@/lib/api/tournaments";
import { cn } from "@/lib/utils";

export function TournamentRowActions({
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
  const [busy, setBusy] = useState<"visibility" | "delete" | null>(null);
  const [isHidden, setIsHidden] = useState(hidden);

  async function toggleVisibility() {
    if (busy) return;
    setBusy("visibility");
    const result = await setOrganizerTournamentVisibility(id, !isHidden);
    setBusy(null);
    if (!result.ok) {
      window.alert(result.error);
      return;
    }
    setIsHidden(result.hidden);
    router.refresh();
  }

  async function remove() {
    if (busy) return;
    const confirmed = window.confirm(
      `Удалить турнир «${title}»?\n\nВместе с турниром удалятся заявки, матчи, сетка и галерея. Действие необратимо.`,
    );
    if (!confirmed) return;
    setBusy("delete");
    const result = await deleteOrganizerTournament(id);
    setBusy(null);
    if (!result.ok) {
      window.alert(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Link href={`/organizer/tournaments/${id}`} className="btn btn-secondary btn-sm">
        Управлять
      </Link>
      <Link
        href={`/organizer/tournaments/${id}/edit`}
        className="grid size-8 place-items-center border border-line text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
        title="Редактировать турнир"
        aria-label={`Редактировать ${title}`}
      >
        <Pencil className="size-3.5" />
      </Link>
      <button
        type="button"
        onClick={() => void toggleVisibility()}
        disabled={busy !== null}
        className={cn(
          "grid size-8 place-items-center border border-line transition-colors disabled:opacity-40",
          isHidden ? "text-warning hover:border-warning" : "text-ink-muted hover:border-line-strong hover:text-ink",
        )}
        title={isHidden ? "Показать на сайте" : "Скрыть с сайта"}
        aria-label={isHidden ? `Показать ${title} на сайте` : `Скрыть ${title} с сайта`}
      >
        {busy === "visibility" ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : isHidden ? (
          <EyeOff className="size-3.5" />
        ) : (
          <Eye className="size-3.5" />
        )}
      </button>
      <button
        type="button"
        onClick={() => void remove()}
        disabled={busy !== null}
        className="grid size-8 place-items-center border border-line text-ink-muted transition-colors hover:border-negative hover:text-negative disabled:opacity-40"
        title="Удалить турнир"
        aria-label={`Удалить ${title}`}
      >
        {busy === "delete" ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
      </button>
      <Link
        href={`/tournaments/${slug}`}
        className="grid size-8 place-items-center text-ink-faint transition-colors hover:text-ink"
        title="Публичная страница"
        aria-label={`Публичная страница ${title}`}
      >
        <ArrowUpRight className="size-3.5" />
      </Link>
    </div>
  );
}
