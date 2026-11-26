"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { deleteTournamentCover, uploadTournamentCover } from "@/lib/api/tournaments";

export function TournamentCover({
  tournamentId,
  coverUrl,
}: {
  tournamentId: string;
  coverUrl?: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [current, setCurrent] = useState(coverUrl);
  const [busy, setBusy] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleFile(files: FileList | null) {
    const file = files?.[0];
    if (!file || busy) return;
    setError(null);
    setNotice(null);
    setBusy(true);
    const result = await uploadTournamentCover(tournamentId, file);
    if (result.ok) {
      setCurrent(result.coverUrl);
      setNotice("Обложка обновлена");
      router.refresh();
    } else {
      setError(result.error);
    }
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function remove() {
    if (removing || !current) return;
    setRemoving(true);
    setError(null);
    setNotice(null);
    const result = await deleteTournamentCover(tournamentId);
    if (result.ok) {
      setCurrent(undefined);
      setNotice("Обложка удалена");
      router.refresh();
    } else {
      setError(result.error);
    }
    setRemoving(false);
  }

  return (
    <div>
      <div className="relative aspect-[16/9] overflow-hidden border border-line bg-canvas-soft">
        {current ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current}
              alt=""
              className="size-full object-cover"
            />
            <button
              type="button"
              onClick={remove}
              disabled={removing}
              className="absolute right-2 top-2 grid size-8 place-items-center border border-white/30 bg-navy/70 text-white transition-colors hover:bg-negative disabled:opacity-50"
              aria-label="Удалить обложку"
            >
              {removing ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <Trash2 className="size-3.5" aria-hidden="true" />
              )}
            </button>
          </>
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 court-pattern-static text-ink-muted">
            <ImagePlus className="size-5" aria-hidden="true" />
            <span className="text-[0.62rem] uppercase tracking-[0.12em]">Нет обложки</span>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="btn btn-secondary btn-sm"
        >
          {busy ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <ImagePlus className="size-3.5" aria-hidden="true" />
          )}
          {current ? "Заменить" : "Загрузить"}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={(event) => handleFile(event.target.files)}
      />

      <p className="mt-3 text-[0.64rem] leading-relaxed text-ink-muted">
        Фото профиля турнира для списка и публичной страницы. Отдельно от галереи.
        JPEG, PNG, WebP или GIF.
      </p>
      {notice && (
        <p role="status" className="mt-2 border border-accent-line bg-accent-soft px-3 py-2 text-[0.68rem] text-accent-strong">
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-2 border border-negative/40 px-3 py-2 text-[0.68rem] text-negative">
          {error}
        </p>
      )}
    </div>
  );
}
