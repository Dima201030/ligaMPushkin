import { ApiError, apiRequest, type ApiErrorBody } from "./client";

export interface AnalyticsMonthPoint {
  month: string;
  count: number;
}

export interface OrganizerAnalyticsSummary {
  clubId: string;
  clubSlug: string;
  clubName: string;
  players: {
    approvedActive: number;
    pendingApplications: number;
    placeholders: number;
    membersActive: number;
  };
  tournaments: {
    total: number;
    byStatus: Record<string, number>;
    activeNonTerminal: number;
  };
  registrations: {
    byStatus: Record<string, number>;
    pending: number;
    confirmed: number;
    waitlist: number;
    cancelled: number;
    rejected: number;
  };
  matches: {
    byStatus: Record<string, number>;
    scheduled: number;
    live: number;
    completed: number;
    openPlayable: number;
  };
  growth: {
    since: string;
    players: AnalyticsMonthPoint[];
    registrations: AnalyticsMonthPoint[];
    matches: AnalyticsMonthPoint[];
  };
}

interface ApiMonthPoint {
  month: string;
  count: number;
}

interface ApiSummary {
  club_id: string;
  club_slug: string;
  club_name: string;
  players: {
    approved_active: number;
    pending_applications: number;
    placeholders: number;
    members_active: number;
  };
  tournaments: {
    total: number;
    by_status?: Record<string, number>;
    active_non_terminal: number;
  };
  registrations: {
    by_status?: Record<string, number>;
    pending?: number;
    confirmed?: number;
    waitlist?: number;
    cancelled?: number;
    rejected?: number;
  };
  matches: {
    by_status?: Record<string, number>;
    scheduled?: number;
    live?: number;
    completed?: number;
    open_playable?: number;
  };
  growth: {
    since: string;
    players?: ApiMonthPoint[];
    registrations?: ApiMonthPoint[];
    matches?: ApiMonthPoint[];
  };
}

function mapMonth(points: ApiMonthPoint[] | undefined): AnalyticsMonthPoint[] {
  return (points ?? []).map((point) => ({
    month: point.month,
    count: Number(point.count) || 0,
  }));
}

function mapCounts(raw: Record<string, number> | undefined): Record<string, number> {
  const out: Record<string, number> = {};
  if (!raw) return out;
  for (const [key, value] of Object.entries(raw)) {
    out[key] = Number(value) || 0;
  }
  return out;
}

function mapSummary(raw: ApiSummary): OrganizerAnalyticsSummary {
  const registrationsByStatus = mapCounts(raw.registrations?.by_status);
  const matchesByStatus = mapCounts(raw.matches?.by_status);
  return {
    clubId: raw.club_id,
    clubSlug: raw.club_slug,
    clubName: raw.club_name,
    players: {
      approvedActive: Number(raw.players?.approved_active) || 0,
      pendingApplications: Number(raw.players?.pending_applications) || 0,
      placeholders: Number(raw.players?.placeholders) || 0,
      membersActive: Number(raw.players?.members_active) || 0,
    },
    tournaments: {
      total: Number(raw.tournaments?.total) || 0,
      byStatus: mapCounts(raw.tournaments?.by_status),
      activeNonTerminal: Number(raw.tournaments?.active_non_terminal) || 0,
    },
    registrations: {
      byStatus: registrationsByStatus,
      pending: Number(raw.registrations?.pending ?? registrationsByStatus.pending) || 0,
      confirmed: Number(raw.registrations?.confirmed ?? registrationsByStatus.confirmed) || 0,
      waitlist: Number(raw.registrations?.waitlist ?? registrationsByStatus.waitlist) || 0,
      cancelled: Number(raw.registrations?.cancelled ?? registrationsByStatus.cancelled) || 0,
      rejected: Number(raw.registrations?.rejected ?? registrationsByStatus.rejected) || 0,
    },
    matches: {
      byStatus: matchesByStatus,
      scheduled: Number(raw.matches?.scheduled ?? matchesByStatus.scheduled) || 0,
      live: Number(raw.matches?.live ?? matchesByStatus.live) || 0,
      completed: Number(raw.matches?.completed) || 0,
      openPlayable: Number(raw.matches?.open_playable) || 0,
    },
    growth: {
      since: raw.growth?.since ?? "",
      players: mapMonth(raw.growth?.players),
      registrations: mapMonth(raw.growth?.registrations),
      matches: mapMonth(raw.growth?.matches),
    },
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

export async function fetchOrganizerAnalyticsSummary(opts?: {
  clubSlug?: string;
}): Promise<OrganizerAnalyticsSummary> {
  const cookieHeader = await serverCookieHeader();
  const { response, data } = await apiRequest<ApiSummary & ApiErrorBody>(
    "/organizer/analytics/summary",
    {
      absolute: typeof window === "undefined",
      clubSlug: opts?.clubSlug,
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    },
  );
  if (!response.ok || !data) {
    throw new ApiError(
      response.status,
      data?.code,
      data?.message || "Не удалось загрузить аналитику",
    );
  }
  return mapSummary(data);
}
