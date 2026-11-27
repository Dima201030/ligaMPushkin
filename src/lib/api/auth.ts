import type { CategorySlug } from "@/lib/types";
import { normalizeUuid } from "@/lib/uuid";
import { ApiError, apiRequest, parseJson, serverApiURL } from "./client";
// apiRequest used for /auth/me/* cabinet helpers

export { ApiError };

export type AccountStatus = "pending" | "approved" | "rejected";

export interface LeagueUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: AccountStatus;
  emailVerified: boolean;
  level: CategorySlug;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ProfileVerificationStatus = "pending" | "approved" | "rejected";

export interface LeagueProfile {
  slug: string;
  city: string;
  bio: string;
  avatarUrl?: string;
  status: string;
  birthDate?: string;
  verificationStatus: ProfileVerificationStatus;
  verifiedAt?: string;
  rating: number;
  points: number;
  singlesPoints: number;
  doublesPoints: number;
  matchesPlayed: number;
  wins: number;
  losses: number;
  memberSince?: string;
}

export interface NotificationPrefs {
  tournaments: boolean;
  reminders: boolean;
  results: boolean;
  news: boolean;
}

export type ClubMemberRoleName = "owner" | "organizer" | "player";
export type OrganizerAccess = "none" | "tournament" | "full";

export interface MeSession {
  user: LeagueUser;
  profile: LeagueProfile | null;
  notifications: NotificationPrefs | null;
  clubRole: ClubMemberRoleName | null;
  organizerAccess: OrganizerAccess;
}

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  tournaments: true,
  reminders: true,
  results: true,
  news: false,
};

export interface MyRegistration {
  id: string;
  tournamentId: string;
  tournamentSlug: string;
  tournamentTitle: string;
  tournamentStartsAt: string;
  tournamentEntryFee: number;
  tournamentStatus: string;
  status: "pending" | "confirmed" | "waitlist" | "cancelled" | "rejected";
  lookingForPartner: boolean;
  partnerId?: string;
  partnerName?: string;
  seed?: number;
  registeredAt: string;
}

export interface LeagueApplication {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: AccountStatus;
  level: CategorySlug;
  phone?: string;
  emailVerified: boolean;
  submittedAt: string;
  reviewedAt?: string;
}

interface ApiUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  email_verified: boolean;
  level: string;
  phone?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface ApiApplication {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  status: string;
  level: string;
  phone?: string | null;
  email_verified: boolean;
  submitted_at: string;
  reviewed_at?: string | null;
}

interface ApiErrorBody {
  code?: string;
  message?: string;
}

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<{ response: Response; data: T | undefined }> {
  return apiRequest<T>(path, init);
}

function mapUser(raw: ApiUser): LeagueUser {
  return {
    id: normalizeUuid(raw.id),
    email: raw.email,
    firstName: raw.first_name,
    lastName: raw.last_name,
    role: raw.role,
    status: raw.status as AccountStatus,
    emailVerified: raw.email_verified,
    level: raw.level as CategorySlug,
    phone: raw.phone ?? undefined,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

function mapApplication(raw: ApiApplication): LeagueApplication {
  return {
    id: normalizeUuid(raw.id),
    email: raw.email,
    firstName: raw.first_name,
    lastName: raw.last_name,
    status: raw.status as AccountStatus,
    level: raw.level as CategorySlug,
    phone: raw.phone ?? undefined,
    emailVerified: raw.email_verified,
    submittedAt: raw.submitted_at,
    reviewedAt: raw.reviewed_at ?? undefined,
  };
}

function nameFromForbiddenMessage(message: string, code: string): string {
  if (code === "pending") {
    const comma = message.indexOf(",");
    if (comma > 0) return message.slice(0, comma).trim();
  }
  if (code === "rejected") {
    const match = /^Заявка\s+(.+?)\s+отклонена/.exec(message);
    if (match?.[1]) return match[1].trim();
  }
  return "Игрок";
}

export type RegisterInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  level: CategorySlug;
  consentPdn: boolean;
  consentPublicProfile: boolean;
  consentMarketing?: boolean;
};

export async function registerAccount(
  input: RegisterInput,
): Promise<{ ok: true; user: LeagueUser } | { ok: false; error: string }> {
  const { response, data } = await request<{ user: ApiUser }>("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      first_name: input.firstName.trim(),
      last_name: input.lastName.trim(),
      email: input.email.trim().toLowerCase(),
      password: input.password,
      phone: input.phone?.trim() || undefined,
      level: input.level,
      consent_pdn: input.consentPdn,
      consent_public_profile: input.consentPublicProfile,
      consent_marketing: Boolean(input.consentMarketing),
    }),
  });

  if (response.status === 201 && data?.user) {
    return { ok: true, user: mapUser(data.user) };
  }

  const err = data as ApiErrorBody | undefined;
  const message =
    err?.message ??
    (response.status === 409
      ? "Аккаунт с таким email уже зарегистрирован"
      : "Не удалось создать аккаунт");
  return { ok: false, error: message };
}

export type LoginResult =
  | { ok: true; user: LeagueUser }
  | {
      ok: false;
      kind: "invalid_credentials" | "pending" | "rejected" | "email_unverified" | "error";
      message: string;
      name?: string;
    };

export async function loginAccount(email: string, password: string): Promise<LoginResult> {
  const { response, data } = await request<{ user?: ApiUser } & ApiErrorBody>("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      password,
    }),
  });

  if (response.ok && data && "user" in data && data.user) {
    return { ok: true, user: mapUser(data.user) };
  }

  const code = data?.code;
  const message = data?.message ?? "Не удалось выполнить вход";

  if (response.status === 401 && code === "invalid_credentials") {
    return { ok: false, kind: "invalid_credentials", message };
  }

  if (response.status === 403 && code === "pending") {
    return {
      ok: false,
      kind: "pending",
      message,
      name: nameFromForbiddenMessage(message, code),
    };
  }

  if (response.status === 403 && code === "rejected") {
    return {
      ok: false,
      kind: "rejected",
      message,
      name: nameFromForbiddenMessage(message, code),
    };
  }

  if (response.status === 403 && code === "email_unverified") {
    return { ok: false, kind: "email_unverified", message };
  }

  return { ok: false, kind: "error", message };
}

export async function logoutAccount(): Promise<void> {
  await request("/auth/logout", { method: "POST" });
}

/** Confirm email via token from the letter link. */
export async function confirmEmailToken(
  token: string,
): Promise<{ ok: true; email?: string } | { ok: false; error: string }> {
  const { response, data } = await request<{ ok?: boolean; email?: string } & ApiErrorBody>(
    "/auth/confirm-email",
    {
      method: "POST",
      body: JSON.stringify({ token: token.trim() }),
    },
  );
  if (response.ok && data?.ok) {
    return { ok: true, email: data.email };
  }
  return {
    ok: false,
    error: data?.message ?? "Ссылка подтверждения недействительна или устарела",
  };
}

/** Resend confirm letter (anti-enumeration; always ok unless rate-limited). */
export async function resendConfirmEmail(
  email: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { response, data } = await request<{ ok?: boolean } & ApiErrorBody>("/auth/resend-confirm", {
    method: "POST",
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });
  if (response.status === 202 || (response.ok && data?.ok)) {
    return { ok: true };
  }
  if (response.status === 429) {
    return {
      ok: false,
      error: data?.message ?? "Слишком много попыток. Подождите несколько минут.",
    };
  }
  return {
    ok: false,
    error: data?.message ?? "Не удалось отправить письмо",
  };
}

/** Request password reset email (anti-enumeration; 202 even if email unknown). */
export async function requestPasswordReset(
  email: string,
): Promise<{ ok: true; message: string } | { ok: false; error: string }> {
  const { response, data } = await request<{ ok?: boolean; message?: string } & ApiErrorBody>(
    "/auth/forgot-password",
    {
      method: "POST",
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    },
  );
  if (response.status === 202 || (response.ok && data?.ok)) {
    return {
      ok: true,
      message:
        data?.message ??
        "Если аккаунт существует, мы отправили письмо со ссылкой для сброса пароля",
    };
  }
  if (response.status === 429) {
    return {
      ok: false,
      error: data?.message ?? "Слишком много попыток. Подождите несколько минут.",
    };
  }
  return {
    ok: false,
    error: data?.message ?? "Не удалось отправить письмо",
  };
}

/** Set a new password using the token from the reset email. */
export async function resetPasswordWithToken(
  token: string,
  newPassword: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { response, data } = await request<{ ok?: boolean } & ApiErrorBody>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({
      token: token.trim(),
      new_password: newPassword,
    }),
  });
  if (response.ok && data?.ok) {
    return { ok: true };
  }
  if (response.status === 429) {
    return {
      ok: false,
      error: data?.message ?? "Слишком много попыток. Подождите несколько минут.",
    };
  }
  return {
    ok: false,
    error: data?.message ?? "Ссылка сброса недействительна или устарела",
  };
}

/** Right-to-erasure: anonymize account and clear session. */
export async function deleteMyAccount(): Promise<{ ok: true } | { ok: false; error: string }> {
  const { response, data } = await request<{ ok?: boolean; message?: string } & ApiErrorBody>("/auth/me", {
    method: "DELETE",
  });
  if (response.status === 200 && data?.ok) {
    return { ok: true };
  }
  return {
    ok: false,
    error: data?.message || "Не удалось удалить аккаунт",
  };
}

interface ApiProfile {
  slug: string;
  city: string;
  bio: string;
  avatar_url?: string | null;
  status: string;
  birth_date?: string | null;
  verification_status?: string;
  verified_at?: string | null;
  rating: number;
  points: number;
  singles_points: number;
  doubles_points: number;
  matches_played: number;
  wins: number;
  losses: number;
  member_since?: string;
}

function mapProfile(raw: ApiProfile): LeagueProfile {
  const verificationStatus =
    raw.verification_status === "approved" || raw.verification_status === "rejected"
      ? raw.verification_status
      : "pending";
  return {
    slug: raw.slug,
    city: raw.city,
    bio: raw.bio,
    avatarUrl: raw.avatar_url ?? undefined,
    status: raw.status,
    birthDate: raw.birth_date ?? undefined,
    verificationStatus,
    verifiedAt: raw.verified_at ?? undefined,
    rating: raw.rating,
    points: raw.points,
    singlesPoints: raw.singles_points,
    doublesPoints: raw.doubles_points,
    matchesPlayed: raw.matches_played,
    wins: raw.wins,
    losses: raw.losses,
    memberSince: raw.member_since,
  };
}

interface ApiNotifications {
  tournaments?: boolean;
  reminders?: boolean;
  results?: boolean;
  news?: boolean;
}

function mapNotifications(raw?: ApiNotifications | null): NotificationPrefs {
  return {
    tournaments: raw?.tournaments ?? DEFAULT_NOTIFICATION_PREFS.tournaments,
    reminders: raw?.reminders ?? DEFAULT_NOTIFICATION_PREFS.reminders,
    results: raw?.results ?? DEFAULT_NOTIFICATION_PREFS.results,
    news: raw?.news ?? DEFAULT_NOTIFICATION_PREFS.news,
  };
}

type MePayload = {
  user: ApiUser;
  profile?: ApiProfile;
  notifications?: ApiNotifications;
  club_role?: string;
  organizer_access?: string;
};

function mapOrganizerAccess(raw: string | undefined): OrganizerAccess {
  if (raw === "full" || raw === "tournament" || raw === "none") return raw;
  return "none";
}

function mapClubRole(raw: string | undefined): ClubMemberRoleName | null {
  if (raw === "owner" || raw === "organizer" || raw === "player") return raw;
  return null;
}

function mapMeSession(data: MePayload): MeSession {
  return {
    user: mapUser(data.user),
    profile: data.profile ? mapProfile(data.profile) : null,
    notifications: data.profile ? mapNotifications(data.notifications) : null,
    clubRole: mapClubRole(data.club_role),
    organizerAccess: mapOrganizerAccess(data.organizer_access),
  };
}

export async function fetchSession(): Promise<MeSession | null> {
  if (typeof window === "undefined") {
    try {
      const { cookies } = await import("next/headers");
      const jar = await cookies();
      const cookie = jar.getAll().map((item) => `${item.name}=${item.value}`).join("; ");
      const { getRequestClubSlug } = await import("./client");
      const { CLUB_HEADER } = await import("@/lib/club/tenant");
      const clubSlug = await getRequestClubSlug(cookie || undefined);
      const response = await fetch(serverApiURL("/auth/me"), {
        headers: {
          Accept: "application/json",
          [CLUB_HEADER]: clubSlug,
          ...(cookie ? { Cookie: cookie } : {}),
        },
        cache: "no-store",
      });
      const data = await parseJson<MePayload>(response);
      if (!response.ok || !data?.user) return null;
      return mapMeSession(data);
    } catch {
      return null;
    }
  }
  const { response, data } = await request<MePayload>("/auth/me");
  if (!response.ok || !data?.user) return null;
  return mapMeSession(data);
}

export async function updateMyNotifications(
  patch: Partial<NotificationPrefs>,
): Promise<{ ok: true; notifications: NotificationPrefs } | { ok: false; error: string }> {
  try {
    const { response, data } = await request<{ notifications?: ApiNotifications } & ApiErrorBody>(
      "/auth/me/notifications",
      {
        method: "PATCH",
        body: JSON.stringify(patch),
      },
    );
    if (!response.ok || !data?.notifications) {
      return { ok: false, error: data?.message ?? "Не удалось сохранить уведомления" };
    }
    return { ok: true, notifications: mapNotifications(data.notifications) };
  } catch {
    return { ok: false, error: "Не удалось сохранить уведомления. Проверьте соединение." };
  }
}

export async function fetchCurrentUser(): Promise<LeagueUser | null> {
  const session = await fetchSession();
  return session?.user ?? null;
}

export async function fetchMyRegistrations(): Promise<MyRegistration[]> {
  const cookieHeader = await serverCookieHeader();
  const { response, data } = await apiRequest<{
    registrations: Array<{
      id: string;
      tournament_id: string;
      tournament_slug: string;
      tournament_title: string;
      tournament_starts_at: string;
      tournament_entry_fee: number;
      tournament_status: string;
      status: string;
      looking_for_partner: boolean;
      partner_id?: string | null;
      partner_name?: string | null;
      seed?: number | null;
      registered_at: string;
    }>;
  }>("/auth/me/registrations", {
    absolute: typeof window === "undefined",
    headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
  });
  if (!response.ok) return [];
  return (data?.registrations ?? []).map((row) => ({
    id: row.id,
    tournamentId: row.tournament_id,
    tournamentSlug: row.tournament_slug,
    tournamentTitle: row.tournament_title,
    tournamentStartsAt: row.tournament_starts_at,
    tournamentEntryFee: row.tournament_entry_fee,
    tournamentStatus: row.tournament_status,
    status: row.status as MyRegistration["status"],
    lookingForPartner: row.looking_for_partner,
    partnerId: row.partner_id ?? undefined,
    partnerName: row.partner_name ?? undefined,
    seed: row.seed ?? undefined,
    registeredAt: row.registered_at,
  }));
}

async function serverCookieHeader(): Promise<string | undefined> {
  if (typeof window !== "undefined") return undefined;
  try {
    const { cookies } = await import("next/headers");
    const jar = await cookies();
    const all = jar.getAll();
    if (!all.length) return undefined;
    return all.map((item) => `${item.name}=${item.value}`).join("; ");
  } catch {
    return undefined;
  }
}

export function isOrganizerRole(role: string): boolean {
  return role === "organizer" || role === "owner" || role === "superadmin";
}

/** Club-scoped or global access to the organizer cabinet. */
export function canAccessOrganizer(session: MeSession): boolean {
  if (session.user.status !== "approved") return false;
  if (session.organizerAccess === "tournament" || session.organizerAccess === "full") return true;
  return isOrganizerRole(session.user.role);
}

/** Full club admin (members, settings, applications, content). */
export function hasFullOrganizerAccess(session: MeSession): boolean {
  if (session.user.status !== "approved") return false;
  if (session.organizerAccess === "full") return true;
  return session.user.role === "owner" || session.user.role === "superadmin";
}

export async function listOrganizerApplications(): Promise<LeagueApplication[]> {
  const { response, data } = await request<{ applications: ApiApplication[] }>(
    "/organizer/applications",
  );
  if (!response.ok) {
    const err = data as ApiErrorBody | undefined;
    throw new ApiError(
      response.status,
      err?.code,
      err?.message ?? "Не удалось загрузить заявки",
    );
  }
  const list = data?.applications ?? [];
  return list.map(mapApplication);
}

export async function approveOrganizerApplication(
  id: string,
  body: { firstName: string; lastName: string; level: CategorySlug },
): Promise<void> {
  const { response, data } = await request<ApiErrorBody>(
    `/organizer/applications/${encodeURIComponent(id)}/approve`,
    {
      method: "POST",
      body: JSON.stringify({
        first_name: body.firstName.trim(),
        last_name: body.lastName.trim(),
        level: body.level,
      }),
    },
  );
  if (!response.ok) {
    throw new ApiError(
      response.status,
      data?.code,
      data?.message ?? "Не удалось подтвердить заявку",
    );
  }
}

export async function rejectOrganizerApplication(id: string): Promise<void> {
  const { response, data } = await request<ApiErrorBody>(
    `/organizer/applications/${encodeURIComponent(id)}/reject`,
    { method: "POST" },
  );
  if (!response.ok) {
    throw new ApiError(
      response.status,
      data?.code,
      data?.message ?? "Не удалось отклонить заявку",
    );
  }
}