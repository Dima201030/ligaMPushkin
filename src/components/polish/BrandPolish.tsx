"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Volume2, VolumeX, X } from "lucide-react";
import {
  DEFAULT_POLISH_PREFS,
  readPolishPrefs,
  writePolishPrefs,
  type PolishPrefs,
} from "@/lib/polish/prefs";
import { playUiTick } from "@/lib/polish/sounds";
import { useToast } from "@/components/motion/Toast";
import { cn } from "@/lib/utils";

/** Sounds (off by default), seasonal theme, onboarding tips, offline toast. */
export function BrandPolish() {
  const [prefs, setPrefs] = useState<PolishPrefs>(DEFAULT_POLISH_PREFS);
  const [ready, setReady] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const toast = useToast();
  const pathname = usePathname();

  useEffect(() => {
    const next = readPolishPrefs();
    setPrefs(next);
    setShowTips(!next.onboardingSeen);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.toggleAttribute("data-seasonal", prefs.seasonal);
    document.documentElement.toggleAttribute("data-ball-cursor", prefs.ballCursor);
  }, [prefs.seasonal, prefs.ballCursor, ready]);

  useEffect(() => {
    const onOffline = () => toast.push("Нет сети — изменения сохранятся при восстановлении связи", "warning");
    const onOnline = () => toast.push("Связь восстановлена", "positive");
    const onSlow = () => {
      if (typeof navigator !== "undefined" && "connection" in navigator) {
        const conn = (navigator as Navigator & { connection?: { effectiveType?: string } }).connection;
        if (conn?.effectiveType === "2g" || conn?.effectiveType === "slow-2g") {
          toast.push("Медленное соединение", "warning");
        }
      }
    };
    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    onSlow();
    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, [toast]);

  useEffect(() => {
    if (!prefs.sounds) return;
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("button, a.btn, .btn")) playUiTick("tap");
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [prefs.sounds]);

  function patch(next: Partial<PolishPrefs>) {
    setPrefs(writePolishPrefs(next));
  }

  function dismissTips() {
    patch({ onboardingSeen: true });
    setShowTips(false);
  }

  if (!ready) return null;

  return (
    <>
      <div className="polish-controls" aria-label="Настройки оформления">
        <button
          type="button"
          className="polish-control-btn"
          title={prefs.sounds ? "Звуки: вкл" : "Звуки: выкл"}
          aria-pressed={prefs.sounds}
          onClick={() => {
            const next = !prefs.sounds;
            patch({ sounds: next });
            if (next) playUiTick("ok");
          }}
        >
          {prefs.sounds ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
          <span className="sr-only">Звуки интерфейса</span>
        </button>
        <button
          type="button"
          className={cn("polish-control-btn", prefs.seasonal && "is-active")}
          title="Сезонный акцент"
          aria-pressed={prefs.seasonal}
          onClick={() => patch({ seasonal: !prefs.seasonal })}
        >
          Сез.
        </button>
      </div>

      {showTips && pathname === "/" ? (
        <aside className="onboarding-tips" role="dialog" aria-label="Подсказки">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow eyebrow-plain text-[0.6rem]">Первый визит</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Смотрите календарь турниров, рейтинг игроков и записывайтесь одним нажатием. Кабинет — после входа.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/tournaments" className="btn btn-primary btn-sm" onClick={dismissTips}>
                  К турнирам
                </Link>
                <button type="button" className="btn btn-secondary btn-sm" onClick={dismissTips}>
                  Понятно
                </button>
              </div>
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={dismissTips} aria-label="Закрыть">
              <X className="size-4" />
            </button>
          </div>
        </aside>
      ) : null}
    </>
  );
}
