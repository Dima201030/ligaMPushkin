import type { CategorySlug } from "@/lib/types";
import { ApiError, apiRequest, parseJson, serverApiURL } from "./client";

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
    id: raw.id,
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
    id: raw.id,
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

export async function fetchCurrentUser(): Promise<LeagueUser | null> {
  // Browser: same-origin /api. RSC: absolute API + forwarded cookies.
  if (typeof window === "undefined") {
    try {
      const { cookies } = await import("next/headers");
      const jar = await cookies();
      const cookie = jar.getAll().map((item) => `${item.name}=${item.value}`).join("; ");
      const response = await fetch(serverApiURL("/auth/me"), {
        headers: {
          Accept: "application/json",
          ...(cookie ? { Cookie: cookie } : {}),
        },
        cache: "no-store",
      });
      const data = await parseJson<{ user: ApiUser }>(response);
      if (!response.ok || !data?.user) return null;
      return mapUser(data.user);
    } catch {
      return null;
    }
  }
  const { response, data } = await request<{ user: ApiUser }>("/auth/me");
  if (!response.ok || !data?.user) return null;
  return mapUser(data.user);
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