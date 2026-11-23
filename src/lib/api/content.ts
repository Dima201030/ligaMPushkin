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
  status?: string;
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
  status?: string;
}

export interface CmsPage {
  slug: string;
  title: string;
  bodyMarkdown: string;
  updatedAt: string;
}

async function throwIfNotOk(response: Response, data: ApiErrorBody | undefined, fallback: string) {
  if (response.ok) return;
  throw new ApiError(response.status, data?.code, data?.message ?? fallback);
}

function mapNews(raw: ApiNews): NewsPost {
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
  };
}

function mapEvent(raw: ApiEvent): ClubEvent {
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
  };
}

export async function fetchNews(
  filters: { tag?: string; limit?: number } = {},
  opts?: { cookie?: string },
): Promise<NewsPost[]> {
  const params = new URLSearchParams();
  if (filters.tag) params.set("tag", filters.tag);
  if (filters.limit) params.set("limit", String(filters.limit));
  const qs = params.toString();
  const { response, data } = await apiRequest<{ news: ApiNews[] }>(
    `/news${qs ? `?${qs}` : ""}`,
    {
      absolute: typeof window === "undefined",
      headers: opts?.cookie ? { Cookie: opts.cookie } : undefined,
    },
  );
  await throwIfNotOk(response, data as ApiErrorBody | undefined, "Не удалось загрузить новости");
  return (data?.news ?? []).map(mapNews);
}

export async function fetchNewsBySlug(
  slug: string,
  opts?: { cookie?: string },
): Promise<NewsPost | null> {
  const { response, data } = await apiRequest<{ news: ApiNews }>(
    `/news/${encodeURIComponent(slug)}`,
    {
      absolute: typeof window === "undefined",
      headers: opts?.cookie ? { Cookie: opts.cookie } : undefined,
    },
  );
  if (response.status === 404) return null;
  await throwIfNotOk(response, data as ApiErrorBody | undefined, "Не удалось загрузить новость");
  return data?.news ? mapNews(data.news) : null;
}

export async function fetchEvents(
  filters: { kind?: string; limit?: number } = {},
  opts?: { cookie?: string },
): Promise<ClubEvent[]> {
  const params = new URLSearchParams();
  if (filters.kind) params.set("kind", filters.kind);
  if (filters.limit) params.set("limit", String(filters.limit));
  const qs = params.toString();
  const { response, data } = await apiRequest<{ events: ApiEvent[] }>(
    `/events${qs ? `?${qs}` : ""}`,
    {
      absolute: typeof window === "undefined",
      headers: opts?.cookie ? { Cookie: opts.cookie } : undefined,
    },
  );
  await throwIfNotOk(response, data as ApiErrorBody | undefined, "Не удалось загрузить события");
  return (data?.events ?? []).map(mapEvent);
}

export async function fetchEventBySlug(
  slug: string,
  opts?: { cookie?: string },
): Promise<ClubEvent | null> {
  const { response, data } = await apiRequest<{ event: ApiEvent }>(
    `/events/${encodeURIComponent(slug)}`,
    {
      absolute: typeof window === "undefined",
      headers: opts?.cookie ? { Cookie: opts.cookie } : undefined,
    },
  );
  if (response.status === 404) return null;
  await throwIfNotOk(response, data as ApiErrorBody | undefined, "Не удалось загрузить событие");
  return data?.event ? mapEvent(data.event) : null;
}

export async function fetchPage(
  slug: string,
  opts?: { cookie?: string },
): Promise<CmsPage | null> {
  const { response, data } = await apiRequest<{
    page: { slug: string; title: string; body_markdown: string; updated_at: string };
  }>(`/pages/${encodeURIComponent(slug)}`, {
    absolute: typeof window === "undefined",
    headers: opts?.cookie ? { Cookie: opts.cookie } : undefined,
  });
  if (response.status === 404) return null;
  await throwIfNotOk(response, data as ApiErrorBody | undefined, "Не удалось загрузить страницу");
  if (!data?.page) return null;
  return {
    slug: data.page.slug,
    title: data.page.title,
    bodyMarkdown: data.page.body_markdown,
    updatedAt: data.page.updated_at,
  };
}
