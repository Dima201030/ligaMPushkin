"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { REGISTRATION_STATUS_LABEL } from "@/lib/domain";
import type { RegistrationStatus } from "@/lib/types";
import { cn, timeAgo } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { DemoNote } from "./OrganizerUI";

export interface InboxRegistration {
  id: string;
  playerName: string;
  firstName: string;
  lastName: string;
  tournamentSlug: string;
  tournamentTitle: string;
  status: RegistrationStatus;
  createdAt: string;
}

const TONE: Record<string, string> = {
  confirmed: "badge-positive",
  pending: "badge-warning",
  waitlist: "badge-neutral",
  cancelled: "badge-negative",
  rejected: "badge-negative",
};

export function RegistrationsInbox({ items }: { items: InboxRegistration[] }) {
  const [decisions, setDecisions] = useState<Partial<Record<string, "confirmed" | "rejected">>>({});
  const [notice, setNotice] = useState<string | null>(null);

  function decide(item: InboxRegistration, decision: "confirmed" | "rejected") {
    setDecisions((current) => ({ ...current, [item.id]: decision }));
    setNotice(
      decision === "confirmed"
        ? `Заявка ${item.playerName} подтверждена. Игрок получит письмо со ссылкой на расписание.`
        : `Заявка ${item.playerName} отклонена, место освобождено.`,
    );
  }

  return (
    <div>
      <ul className="divide-y divide-divider">
        {items.map((item) => {
          const status = decisions[item.id] ?? item.status;
          const actionable = status === "pending" || status === "waitlist";
          return (
            <li key={item.id} className="registrant-join flex flex-wrap items-center gap-3 py-3">
              <Avatar firstName={item.firstName} lastName={item.lastName} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.8rem] font-medium text-ink">{item.playerName}</p>
                <p className="mt-0.5 truncate text-[0.66rem] text-ink-muted">
                  <Link href={`/tournaments/${item.tournamentSlug}`} className="transition-colors hover:text-ink">
                    {item.tournamentTitle}
                  </Link>
                  <span className="mx-1.5 text-ink-faint">·</span>
                  {timeAgo(item.createdAt)}
                </p>
              </div>
              <span className={cn("badge shrink-0", TONE[status])}>{REGISTRATION_STATUS_LABEL[status]}</span>
              {actionable && (
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    className="grid size-7 place-items-center border border-line text-positive transition-colors hover:border-positive"
                    title="Подтвердить заявку"
                    aria-label={`Подтвердить заявку ${item.playerName}`}
                    onClick={() => decide(item, "confirmed")}
                  >
                    <Check className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    className="grid size-7 place-items-center border border-line text-negative transition-colors hover:border-negative"
                    title="Отклонить заявку"
                    aria-label={`Отклонить заявку ${item.playerName}`}
                    onClick={() => decide(item, "rejected")}
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {notice && (
        <div className="pb-2 pt-1">
          <DemoNote className="mt-1">{notice} Демо-режим: данные не сохраняются.</DemoNote>
        </div>
      )}
    </div>
  );
}
