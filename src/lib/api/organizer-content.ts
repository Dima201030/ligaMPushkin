import type { ClubEvent, NewsPost } from "@/lib/types";
import { ApiError, apiRequest, type ApiErrorBody } from "./client";

interface ApiNews {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string[];
  cover_url?: string | null;
  tag: string;
  author: string;
  status: string;
  published_at?: string | null;
  reading_time: number;
}

interface ApiEvent {
  id: string;
  slug: string;
  title: string;
  kind: string;
  description: string;
  starts_at: string;
  location: string;
  cover_url?: string | null;
  seats_left?: number | null;
  status: string;
}

function mapNews(raw: ApiNews): NewsPost & { status: string } {
  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.title,
    excerpt: raw.excerpt,
    body: raw.body ?? [],
    coverUrl: raw.cover_url || "/images/hero.jpg",
    publishedAt: raw.published_at || "",
    tag: raw.tag || "Лига",
    author: raw.author || "",
    readingTime: raw.reading_time || 1,
    status: raw.status,
  };
}

function mapEvent(raw: ApiEvent): ClubEvent & { status: string } {
  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.title,
    kind: (raw.kind as ClubEvent["kind"]) || "club",
    description: raw.description,
    startsAt: raw.starts_at,
    location: raw.location,
    coverUrl: raw.cover_url ?? undefined,
    seatsLeft: raw.seats_left ?? undefined,
    status: raw.status,
  };
}

export async function fetchOrganizerNews(opts?: { cookie?: string }) {
  const { response, data } = await apiRequest<{ news: ApiNews[] }>("/organizer/news", {
    absolute: true,
    headers: opts?.cookie ? { Cookie: opts.cookie } : undefined,
  });
  if (!response.ok) {
    throw new ApiError(response.status, (data as ApiErrorBody | undefined)?.code, "Не удалось загрузить новости");
  }
  return (data?.news ?? []).map(mapNews);
}

export async function fetchOrganizerEvents(opts?: { cookie?: string }) {
  const { response, data } = await apiRequest<{ events: ApiEvent[] }>("/organizer/events", {
    absolute: true,
    headers: opts?.cookie ? { Cookie: opts.cookie } : undefined,
  });
  if (!response.ok) {
    throw new ApiError(response.status, (data as ApiErrorBody | undefined)?.code, "Не удалось загрузить события");
  }
  return (data?.events ?? []).map(mapEvent);
}

export async function createNews(input: {
  title: string;
  excerpt: string;
  body: string[];
  tag?: string;
  status?: "draft" | "published";
}): Promise<{ ok: true; news: NewsPost } | { ok: false; error: string }> {
  const { response, data } = await apiRequest<{ news: ApiNews } & ApiErrorBody>("/organizer/news", {
    method: "POST",
    body: JSON.stringify({
      title: input.title,
      excerpt: input.excerpt,
      body: input.body,
      tag: input.tag ?? "Лига",
      status: input.status ?? "published",
    }),
  });
  if (response.status === 201 && data?.news) return { ok: true, news: mapNews(data.news) };
  return { ok: false, error: data?.message ?? "Не удалось создать новость" };
}

export async function updateNewsStatus(
  id: string,
  status: "draft" | "published" | "archived",
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { response, data } = await apiRequest<ApiErrorBody>(`/organizer/news/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  if (response.ok) return { ok: true };
  return { ok: false, error: data?.message ?? "Не удалось обновить новость" };
}

export async function createEvent(input: {
  title: string;
  kind: ClubEvent["kind"];
  description: string;
  startsAt: string;
  location: string;
  seatsLeft?: number;
  status?: "draft" | "published";
}): Promise<{ ok: true; event: ClubEvent } | { ok: false; error: string }> {
  const { response, data } = await apiRequest<{ event: ApiEvent } & ApiErrorBody>("/organizer/events", {
    method: "POST",
    body: JSON.stringify({
      title: input.title,
      kind: input.kind,
      description: input.description,
      starts_at: input.startsAt,
      location: input.location,
      seats_left: input.seatsLeft,
      status: input.status ?? "published",
    }),
  });
  if (response.status === 201 && data?.event) return { ok: true, event: mapEvent(data.event) };
  return { ok: false, error: data?.message ?? "Не удалось создать событие" };
}

export async function updateEventStatus(
  id: string,
  status: "draft" | "published" | "archived",
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { response, data } = await apiRequest<ApiErrorBody>(`/organizer/events/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  if (response.ok) return { ok: true };
  return { ok: false, error: data?.message ?? "Не удалось обновить событие" };
}

export async function upsertPage(slug: string, input: { title: string; bodyMarkdown: string }) {
  const { response, data } = await apiRequest<{ page: { slug: string } } & ApiErrorBody>(
    `/organizer/pages/${encodeURIComponent(slug)}`,
    {
      method: "PUT",
      body: JSON.stringify({
        title: input.title,
        body_markdown: input.bodyMarkdown,
      }),
    },
  );
  if (response.ok) return { ok: true as const };
  return { ok: false as const, error: data?.message ?? "Не удалось сохранить страницу" };
}
