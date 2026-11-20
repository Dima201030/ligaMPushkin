"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Trash2, UserPlus } from "lucide-react";
import {
  addClubMember,
  deleteClubMember,
  patchClubMember,
  type ClubMember,
  type ClubMemberRole,
} from "@/lib/api/club-members";
import { cn } from "@/lib/utils";
import { MiniLabel, Panel } from "./OrganizerUI";

const ROLE_LABEL: Record<ClubMemberRole, string> = {
  owner: "Владелец",
  organizer: "Организатор",
  player: "Игрок",
};

const STATUS_LABEL: Record<string, string> = {
  active: "активен",
  invited: "приглашён",
  blocked: "заблокирован",
  left: "вышел",
};

function isLastActiveOwner(member: ClubMember, members: ClubMember[]): boolean {
  if (member.role !== "owner" || member.status !== "active") return false;
  const owners = members.filter((item) => item.role === "owner" && item.status === "active");
  return owners.length <= 1;
}

export function InviteMemberForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<ClubMemberRole>("organizer");
  const [attempted, setAttempted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [okMessage, setOkMessage] = useState<string | null>(null);

  const emailError = useMemo(() => {
    const value = email.trim();
    if (!value.includes("@")) return "Укажите email";
    return null;
  }, [email]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setAttempted(true);
    setSubmitError(null);
    setOkMessage(null);
    if (emailError) return;

    setBusy(true);
    const result = await addClubMember({
      email: email.trim().toLowerCase(),
      role,
      status: "active",
    });
    setBusy(false);

    if (!result.ok) {
      setSubmitError(result.error);
      return;
    }

    setOkMessage(
      result.created
        ? `${result.member.email} добавлен как ${ROLE_LABEL[result.member.role]}`
        : `${result.member.email}: роль обновлена на ${ROLE_LABEL[result.member.role]}`,
    );
    setEmail("");
    setAttempted(false);
    router.refresh();
  }

  return (
    <Panel
      title="Добавить участника"
      description="Пользователь должен уже быть зарегистрирован. Роли клуба: владелец и организатор управляют клубом."
    >
      <form onSubmit={submit} className="max-w-xl space-y-5 py-2" noValidate>
        <label className="block">
          <span className="field-label">Email</span>
          <input
            className={cn("field", attempted && emailError && "border-negative")}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="organizer@example.com"
            autoComplete="email"
            disabled={busy}
            required
          />
          {attempted && emailError ? (
            <p className="mt-1.5 text-[0.7rem] text-negative">{emailError}</p>
          ) : null}
        </label>

        <label className="block">
          <span className="field-label">Роль</span>
          <select
            className="field"
            value={role}
            onChange={(event) => setRole(event.target.value as ClubMemberRole)}
            disabled={busy}
          >
            <option value="organizer">Организатор</option>
            <option value="owner">Владелец</option>
            <option value="player">Игрок</option>
          </select>
        </label>

        {submitError ? (
          <p
            role="alert"
            className="flex items-start gap-2 border border-negative/30 bg-negative/5 px-3 py-2.5 text-[0.78rem] text-negative"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {submitError}
          </p>
        ) : null}
        {okMessage ? (
          <p role="status" className="text-[0.78rem] text-positive">
            {okMessage}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button type="submit" className="btn btn-primary" disabled={busy || (attempted && Boolean(emailError))}>
            {busy ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <UserPlus className="size-4" aria-hidden="true" />
            )}
            Добавить
          </button>
          <MiniLabel>Текущий клуб из cookie pairly_club</MiniLabel>
        </div>
      </form>
    </Panel>
  );
}

export function MembersTable({ members }: { members: ClubMember[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const visible = useMemo(
    () => members.filter((member) => member.status !== "left"),
    [members],
  );

  async function changeRole(member: ClubMember, role: ClubMemberRole) {
    if (role === member.role) return;
    if (member.role === "owner" && role !== "owner" && isLastActiveOwner(member, members)) {
      setError("Нельзя снять роль с последнего владельца клуба");
      return;
    }
    setError(null);
    setBusyId(member.id);
    const result = await patchClubMember(member.id, { role });
    setBusyId(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function removeMember(member: ClubMember) {
    if (isLastActiveOwner(member, members)) {
      setError("Нельзя удалить последнего владельца клуба");
      return;
    }
    const label = `${member.firstName} ${member.lastName}`.trim() || member.email;
    if (!window.confirm(`Удалить ${label} из клуба?`)) return;

    setError(null);
    setBusyId(member.id);
    const result = await deleteClubMember(member.id);
    setBusyId(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <Panel
      title="Участники клуба"
      description="Участники текущего клуба. Смена роли сразу сохраняется. Удаление — soft (status left); последнего владельца убрать нельзя."
    >
      {error ? (
        <p role="alert" className="mb-3 text-[0.78rem] text-negative">
          {error}
        </p>
      ) : null}
      {visible.length === 0 ? (
        <p className="py-6 text-sm text-ink-muted">Пока нет участников в этом клубе.</p>
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {visible.map((member) => {
            const busy = busyId === member.id;
            const lastOwner = isLastActiveOwner(member, members);
            return (
              <li
                key={member.id}
                className="flex flex-wrap items-center justify-between gap-4 py-4"
              >
                <div className="min-w-0">
                  <p className="text-[0.95rem] font-medium text-ink">
                    {member.firstName} {member.lastName}
                  </p>
                  <p className="mt-1 text-[0.72rem] text-ink-muted">{member.email}</p>
                  <p className="mt-1 text-[0.62rem] uppercase tracking-[0.14em] text-ink-faint">
                    {STATUS_LABEL[member.status] ?? member.status}
                    {lastOwner ? " · единственный владелец" : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex items-center gap-2 text-[0.72rem] text-ink-muted">
                    <span className="uppercase tracking-[0.12em]">Роль</span>
                    <select
                      className="field py-1.5 text-[0.78rem]"
                      value={member.role}
                      disabled={busy || lastOwner}
                      onChange={(event) => changeRole(member, event.target.value as ClubMemberRole)}
                    >
                      <option value="owner">Владелец</option>
                      <option value="organizer">Организатор</option>
                      <option value="player">Игрок</option>
                    </select>
                  </label>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    disabled={busy || lastOwner}
                    title={lastOwner ? "Нельзя удалить последнего владельца" : "Удалить из клуба"}
                    onClick={() => removeMember(member)}
                  >
                    {busy ? (
                      <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                    ) : (
                      <Trash2 className="size-3.5" aria-hidden="true" />
                    )}
                    Удалить
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
