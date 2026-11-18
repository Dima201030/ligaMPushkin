const API_BASE =
  (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");

export interface ApiErrorBody {
  code?: string;
  message?: string;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string | undefined,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function apiPath(path: string): string {
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}/api${suffix}`;
}

/** Absolute API URL for server components (bypass Next relative fetch). */
export function serverApiURL(path: string): string {
  const base = (process.env.API_PROXY_TARGET ?? "http://127.0.0.1:3020").replace(/\/$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}/api${suffix}`;
}

export async function parseJson<T>(response: Response): Promise<T | undefined> {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text) as T;
  } catch {
    return undefined;
  }
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit & { absolute?: boolean },
): Promise<{ response: Response; data: T | undefined }> {
  const { absolute, ...rest } = init ?? {};
  const url = absolute ? serverApiURL(path) : apiPath(path);
  const response = await fetch(url, {
    credentials: "include",
    cache: "no-store",
    ...rest,
    headers: {
      Accept: "application/json",
      ...(rest.body ? { "Content-Type": "application/json" } : {}),
      ...rest.headers,
    },
  });
  const data = await parseJson<T>(response);
  return { response, data };
}
