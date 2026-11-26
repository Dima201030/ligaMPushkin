import { beforeEach, describe, expect, it, vi } from "vitest";

const BASE = "/mp-7f3a9c2e5b8d4106";

async function loadMedia() {
  return import("./media");
}

describe("resolveCoverUrl", () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.NEXT_PUBLIC_BASE_PATH;
  });

  it("falls back to the neutral placeholder", async () => {
    const { resolveCoverUrl, COVER_PLACEHOLDER } = await loadMedia();
    expect(COVER_PLACEHOLDER).toBe("/images/cover-placeholder.svg");
    expect(resolveCoverUrl()).toBe(COVER_PLACEHOLDER);
    expect(resolveCoverUrl(null)).toBe(COVER_PLACEHOLDER);
    expect(resolveCoverUrl("")).toBe(COVER_PLACEHOLDER);
  });

  it("replaces legacy club photos with the placeholder", async () => {
    const { resolveCoverUrl, COVER_PLACEHOLDER } = await loadMedia();
    expect(resolveCoverUrl("/images/courts/old-club.jpg")).toBe(COVER_PLACEHOLDER);
    expect(resolveCoverUrl("/images/cover-placeholder.svg")).toBe(
      "/images/cover-placeholder.svg",
    );
  });

  it("prefixes the placeholder with the app base path", async () => {
    process.env.NEXT_PUBLIC_BASE_PATH = BASE;
    const { resolveCoverUrl, COVER_PLACEHOLDER } = await loadMedia();
    expect(COVER_PLACEHOLDER).toBe(`${BASE}/images/cover-placeholder.svg`);
    expect(resolveCoverUrl()).toBe(`${BASE}/images/cover-placeholder.svg`);
    expect(resolveCoverUrl("/images/cover-placeholder.svg")).toBe(
      `${BASE}/images/cover-placeholder.svg`,
    );
    expect(resolveCoverUrl("/images/courts/old-club.jpg")).toBe(
      `${BASE}/images/cover-placeholder.svg`,
    );
  });

  it("keeps external URLs untouched", async () => {
    const { resolveCoverUrl } = await loadMedia();
    expect(resolveCoverUrl("https://cdn.example.com/photo.png")).toBe(
      "https://cdn.example.com/photo.png",
    );
  });

  it("keeps API URLs as-is without a base path", async () => {
    const { resolveCoverUrl } = await loadMedia();
    expect(resolveCoverUrl("/api/files/abc")).toBe("/api/files/abc");
  });

  it("prefixes API file URLs with the app base path", async () => {
    process.env.NEXT_PUBLIC_BASE_PATH = BASE;
    const { resolveCoverUrl } = await loadMedia();
    expect(resolveCoverUrl("/api/files/abc")).toBe(`${BASE}/api/files/abc`);
  });

  it("does not double-prefix already absolute API URLs", async () => {
    process.env.NEXT_PUBLIC_BASE_PATH = `${BASE}/`;
    const { resolveCoverUrl } = await loadMedia();
    expect(resolveCoverUrl("/api/tournaments")).toBe(`${BASE}/api/tournaments`);
  });
});
