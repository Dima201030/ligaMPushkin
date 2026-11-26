"use client";

import { Code2 } from "lucide-react";
import { CountUp } from "@/components/motion/CountUp";
import { MiniLabel, Panel } from "@/components/organizer/OrganizerUI";
import {
  PROJECT_STATS_AS_OF,
  PROJECT_STATS_TOTAL,
  PROJECT_STAT_ROWS,
} from "@/lib/project-stats";
import { formatNumber } from "@/lib/utils";

function ApproxCount({ value }: { value: number }) {
  return (
    <span className="inline-flex items-baseline gap-0.5 tabular-nums">
      <span className="text-ink-faint" aria-hidden="true">
        ~
      </span>
      <CountUp value={value} />
    </span>
  );
}

/** Organizer-only “about this project” LOC snapshot. */
export function ProjectAboutStats() {
  const asOfLabel = new Date(`${PROJECT_STATS_AS_OF}T12:00:00`).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Panel
      title="О проекте"
      description="Оценка объёма исходников Pairly. Без node_modules, vendor, .next и dist."
    >
      <div className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="border-t border-line pt-4">
            <MiniLabel>Всего отслеживается</MiniLabel>
            <p className="display mt-3 text-[2.1rem] leading-none">
              <ApproxCount value={PROJECT_STATS_TOTAL.trackedLines} />
            </p>
            <p className="mt-2 text-[0.66rem] text-ink-faint">строк во всех репозиториях</p>
          </div>
          <div className="border-t border-line pt-4">
            <MiniLabel>Код (основные языки)</MiniLabel>
            <p className="display mt-3 text-[2.1rem] leading-none">
              <ApproxCount value={PROJECT_STATS_TOTAL.codeLines} />
            </p>
            <p className="mt-2 text-[0.66rem] text-ink-faint">Go, SQL, TypeScript</p>
          </div>
        </div>

        <div className="border-t border-line pt-4">
          <div className="mb-3 flex items-center gap-2">
            <Code2 className="size-3.5 text-ink-muted" aria-hidden="true" />
            <MiniLabel>По репозиториям</MiniLabel>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left text-[0.72rem]">
              <thead>
                <tr className="border-b border-line text-[0.58rem] uppercase tracking-[0.12em] text-ink-muted">
                  <th scope="col" className="pb-2 pr-3 font-normal">
                    Часть
                  </th>
                  <th scope="col" className="pb-2 pr-3 font-normal">
                    Языки
                  </th>
                  <th scope="col" className="pb-2 pr-3 text-right font-normal">
                    Отслеживается
                  </th>
                  <th scope="col" className="pb-2 text-right font-normal">
                    Код
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {PROJECT_STAT_ROWS.map((row) => (
                  <tr key={row.id}>
                    <th scope="row" className="py-3 pr-3 font-medium text-ink">
                      <span className="block">{row.label}</span>
                      <span className="mt-0.5 block text-[0.62rem] font-normal text-ink-faint">
                        {row.repo}
                      </span>
                    </th>
                    <td className="py-3 pr-3 text-ink-muted">{row.languages}</td>
                    <td className="py-3 pr-3 text-right tabular-nums text-ink">
                      ~{formatNumber(row.trackedLines)}
                    </td>
                    <td className="py-3 text-right tabular-nums text-ink">
                      ~{formatNumber(row.codeLines)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-line">
                  <th scope="row" className="pt-3 pr-3 font-medium text-ink" colSpan={2}>
                    Итого
                  </th>
                  <td className="pt-3 pr-3 text-right font-medium tabular-nums text-ink">
                    ~{formatNumber(PROJECT_STATS_TOTAL.trackedLines)}
                  </td>
                  <td className="pt-3 text-right font-medium tabular-nums text-ink">
                    ~{formatNumber(PROJECT_STATS_TOTAL.codeLines)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <p className="text-[0.62rem] leading-relaxed text-ink-faint">
          Снимок от {asOfLabel}. Цифры округлены; это ориентир для организаторов, не CI-метрика.
        </p>
      </div>
    </Panel>
  );
}
