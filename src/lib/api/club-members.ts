import { normalizeUuid } from "@/lib/uuid";
import { ApiError, apiRequest, type ApiErrorBody } from "./client";

export type ClubMemberRole = "owner" | "organizer" | "player";
export type ClubMemberStatus = "active" | "invited" | "blocked" | "left";

export interface ClubMember {
  id: string;
  clubId: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: ClubMemberRole;
  status: ClubMemberStatus;
  userStatus: string;
  createdAt?: string;
}

interface ApiMember {
  id: string;
  club_id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  user_status: string;
  created_at?: string;
}

function mapMember(raw: ApiMember): ClubMember {
  return {
    id: normalizeUuid(raw.id),
    clubId: normalizeUuid(raw.club_id),
    userId: normalizeUuid(raw.user_id),
    email: raw.email,
    firstName: raw.first_name,
    lastName: raw.last_name,
    role: raw.role as ClubMemberRole,
    status: raw.status as ClubMemberStatus,
    userStatus: raw.user_status,
    createdAt: raw.created_at,
  };
}

async function serverCookieHeader(): Promise<string | undefined> {
  if (typeof window !== "undefined") return undefined;
  try {
    const { cookies } = await import("next/headers");
    const jar = await cookies();
    const header = jar.getAll().map((item) => `${item.name}=${item.value}`).join("; ");
    return header || undefined;
  } catch {
    return undefined;
  }
}

export async function fetchClubMembers(opts?: {
  status?: string;
  clubSlug?: string;
}): Promise<ClubMember[]> {
  const cookieHeader = await serverCookieHeader();
  const query = opts?.status ? `?status=${encodeURIComponent(opts.status)}` : "";
  const { response, data } = await apiRequest<{ members: ApiMember[] } & ApiErrorBody>(
    `/organizer/members${query}`,
    {
      absolute: typeof window === "undefined",
      clubSlug: opts?.clubSlug,
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    },
  );
  if (!response.ok) {
    throw new ApiError(response.status, data?.code, data?.message || "Не удалось загрузить участников");
  }
  return (data?.members ?? []).map(mapMember);
}

export async function addClubMember(input: {
  email: string;
  role: ClubMemberRole;
  status?: ClubMemberStatus;
  clubSlug?: string;
}): Promise<{ ok: true; member: ClubMember; created: boolean } | { ok: false; error: string; code?: string }> {
  const { response, data } = await apiRequest<{ member: ApiMember } & ApiErrorBody>("/organizer/members", {
    method: "POST",
    clubSlug: input.clubSlug,
    body: JSON.stringify({
      email: input.email,
      role: input.role,
      status: input.status ?? "active",
    }),
  });
  if ((response.status === 201 || response.status === 200) && data?.member) {
    return { ok: true, member: mapMember(data.member), created: response.status === 201 };
  }
  return {
    ok: false,
    error: data?.message ?? "Не удалось добавить участника",
    code: data?.code,
  };
}

export async function patchClubMember(
  id: string,
  input: { role?: ClubMemberRole; status?: ClubMemberStatus; clubSlug?: string },
): Promise<{ ok: true; member: ClubMember } | { ok: false; error: string }> {
  const body: Record<string, string> = {};
  if (input.role) body.role = input.role;
  if (input.status) body.status = input.status;
  const { response, data } = await apiRequest<{ member: ApiMember } & ApiErrorBody>(
    `/organizer/members/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      clubSlug: input.clubSlug,
      body: JSON.stringify(body),
    },
  );
  if (response.ok && data?.member) {
    return { ok: true, member: mapMember(data.member) };
  }
  return { ok: false, error: data?.message ?? "Не удалось обновить участника" };
}

/** Soft-remove membership (status=left). API may return last_owner / forbidden. */
export async function deleteClubMember(
  id: string,
  opts?: { clubSlug?: string },
): Promise<{ ok: true; member: ClubMember } | { ok: false; error: string; code?: string }> {
  const { response, data } = await apiRequest<{ member: ApiMember } & ApiErrorBody>(
    `/organizer/members/${encodeURIComponent(id)}`,
    { method: "DELETE", clubSlug: opts?.clubSlug },
  );
  if (response.ok && data?.member) {
    return { ok: true, member: mapMember(data.member) };
  }
  return {
    ok: false,
    error: data?.message ?? "Не удалось удалить участника",
    code: data?.code,
  };
}
