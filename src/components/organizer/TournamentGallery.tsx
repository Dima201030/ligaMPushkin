"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import type { TournamentImage } from "@/lib/types";
import { COVER_LIMITS, validateCoverFile } from "@/lib/club-limits";
import { deleteTournamentImage, uploadTournamentImage } from "@/lib/api/tournaments";

const MAX_IMAGES = 12;

export function TournamentGallery({
  tournamentId,
  images,
}: {
  tournamentId: string;
  images: TournamentImage[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState(images);
  const [busy, setBusy] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const full = items.length >= MAX_IMAGES;

  async function handleFiles(files: FileList | null) {
    if (!files?.length || busy) return;
    setError(null);
    setNotice(null);
    setBusy(true);
    const uploaded: TournamentImage[] = [];
    let failed: string | null = null;
    for (const file of Array.from(files)) {
      if (items.length + uploaded.length >= MAX_IMAGES) {
        failed = `В галерее может быть не больше ${MAX_IMAGES} изображений`;
        break;
      }
      const localError = validateCoverFile(file);
      if (localError) {
        failed = localError;
        break;
      }
      const result = await uploadTournamentImage(tournamentId, file);
      if (result.ok) uploaded.push(result.image);
      else {
        failed = result.error;
        break;
      }
    }
    if (uploaded.length) {
      setItems((prev) => [...prev, ...uploaded]);
      setNotice(
        uploaded.length === 1
          ? "Изображение загружено"
          : `Загружено изображений: ${uploaded.length}`,
      );
      router.refresh();
    }
    if (failed) setError(failed);
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function remove(id: string) {
    if (removing) return;
    setRemoving(id);
    setError(null);
    setNotice(null);
    const result = await deleteTournamentImage(tournamentId, id);
    if (result.ok) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      setNotice("Изображение удалено");
      router.refresh();
    } else {
      setError(result.error);
    }
    setRemoving(null);
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {items.map((image) => (
          <div key={image.id} className="group relative aspect-square overflow-hidden border border-line bg-canvas-soft">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.url}
              alt=""
              loading="lazy"
              className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            />
            <button
              type="button"
              onClick={() => remove(image.id)}
              disabled={removing === image.id}
              className="absolute right-1.5 top-1.5 grid size-7 place-items-center border border-white/30 bg-navy/70 text-white opacity-0 transition-opacity duration-200 hover:bg-negative focus-visible:opacity-100 group-hover:opacity-100 disabled:opacity-50"
              aria-label="Удалить изображение"
            >
              {removing === image.id ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <Trash2 className="size-3.5" aria-hidden="true" />
              )}
            </button>
          </div>
        ))}

        {!full && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="flex aspect-square flex-col items-center justify-center gap-2 border border-dashed border-line-strong bg-canvas-soft text-ink-muted transition-colors hover:border-ink hover:text-ink disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="size-5 animate-spin" aria-hidden="true" />
            ) : (
              <ImagePlus className="size-5" aria-hidden="true" />
            )}
            <span className="text-[0.62rem] uppercase tracking-[0.12em]">
              {busy ? "Загрузка" : "Добавить"}
            </span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={COVER_LIMITS.accept}
        multiple
        className="sr-only"
        onChange={(event) => handleFiles(event.target.files)}
      />

      <p className="mt-3 text-[0.64rem] leading-relaxed text-ink-muted">
        JPEG, PNG или WebP, до 5 МБ. Изображения передаются по защищённому соединению и
        хранятся на сервере в зашифрованном виде. {items.length} из {MAX_IMAGES}.
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
