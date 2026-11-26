"use client";

import { useEffect, useId, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Scale-in modal with blurred backdrop. */
export function Modal({
  open,
  title,
  children,
  onClose,
  confirmLabel = "Подтвердить",
  cancelLabel = "Отмена",
  onConfirm,
  busy = false,
  className,
}: {
  open: boolean;
  title: string;
  children?: ReactNode;
  onClose: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  busy?: boolean;
  className?: string;
}) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-root" role="presentation">
      <button type="button" className="modal-backdrop" aria-label="Закрыть" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn("modal-panel", className)}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <h2 id={titleId} className="text-base font-medium">
            {title}
          </h2>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Закрыть">
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
        {children ? <div className="px-5 py-4 text-sm leading-relaxed text-ink-soft">{children}</div> : null}
        {(onConfirm || cancelLabel) && (
          <div className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-4">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose} disabled={busy}>
              {cancelLabel}
            </button>
            {onConfirm ? (
              <button type="button" className="btn btn-primary btn-sm" onClick={onConfirm} disabled={busy}>
                {busy ? "…" : confirmLabel}
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
