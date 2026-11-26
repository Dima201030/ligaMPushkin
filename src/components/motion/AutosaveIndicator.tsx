"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type AutosaveState = "idle" | "saving" | "saved" | "error";

/** Autosave «saved ✓» indicator for organizer forms. */
export function AutosaveIndicator({
  state,
  className,
}: {
  state: AutosaveState;
  className?: string;
}) {
  if (state === "idle") return null;
  return (
    <p
      role="status"
      className={cn(
        "inline-flex items-center gap-1.5 text-[0.66rem] uppercase tracking-[0.12em]",
        state === "saving" && "text-ink-muted",
        state === "saved" && "text-positive",
        state === "error" && "text-negative",
        className,
      )}
    >
      {state === "saving" ? "Сохраняем…" : null}
      {state === "saved" ? (
        <>
          <Check className="size-3.5" aria-hidden="true" />
          Сохранено
        </>
      ) : null}
      {state === "error" ? "Не удалось сохранить" : null}
    </p>
  );
}
