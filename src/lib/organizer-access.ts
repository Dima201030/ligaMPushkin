import { redirect } from "next/navigation";
import {
  canAccessOrganizer,
  fetchSession,
  hasFullOrganizerAccess,
  type MeSession,
  type OrganizerAccess,
} from "@/lib/api/auth";

export type OrganizerScope = "tournament" | "full";

const FULL_ONLY_PREFIXES = [
  "/organizer/applications",
  "/organizer/clubs",
  "/organizer/members",
  "/organizer/settings",
  "/organizer/ratings",
  "/organizer/content",
];

export function isFullOnlyOrganizerPath(pathname: string): boolean {
  return FULL_ONLY_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export async function requireOrganizerSession(): Promise<MeSession> {
  const session = await fetchSession();
  if (!session) {
    redirect("/login?next=/organizer");
  }
  if (!canAccessOrganizer(session)) {
    redirect("/cabinet");
  }
  return session;
}

export async function requireFullOrganizerSession(): Promise<MeSession> {
  const session = await requireOrganizerSession();
  if (!hasFullOrganizerAccess(session)) {
    redirect("/organizer");
  }
  return session;
}

export function organizerAccessLabel(access: OrganizerAccess): string {
  switch (access) {
    case "full":
      return "Владелец клуба";
    case "tournament":
      return "Организатор турниров";
    default:
      return "Без доступа";
  }
}
