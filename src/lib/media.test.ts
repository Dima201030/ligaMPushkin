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

  it("keeps local club and news photos under /images/", async () => {
    const { resolveCoverUrl, COVER_PLACEHOLDER } = await loadMedia();
    expect(resolveCoverUrl("/images/hero.jpg")).toBe("/images/hero.jpg");
    expect(resolveCoverUrl("/images/club/courts-aerial.webp")).toBe(
      "/images/club/courts-aerial.webp",
    );
    expect(resolveCoverUrl("/images/cover-placeholder.svg")).toBe(
      COVER_PLACEHOLDER,
    );
  });

  it("prefixes local and API URLs with the app base path", async () => {
    process.env.NEXT_PUBLIC_BASE_PATH = BASE;
    const { resolveCoverUrl, COVER_PLACEHOLDER } = await loadMedia();
    expect(COVER_PLACEHOLDER).toBe(`${BASE}/images/cover-placeholder.svg`);
    expect(resolveCoverUrl()).toBe(`${BASE}/images/cover-placeholder.svg`);
    expect(resolveCoverUrl("/images/cover-placeholder.svg")).toBe(
      `${BASE}/images/cover-placeholder.svg`,
    );
    expect(resolveCoverUrl("/images/hero.jpg")).toBe(`${BASE}/images/hero.jpg`);
    expect(resolveCoverUrl("/api/files/abc")).toBe(`${BASE}/api/files/abc`);
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

  it("does not double-prefix already absolute API URLs", async () => {
    process.env.NEXT_PUBLIC_BASE_PATH = `${BASE}/`;
    const { resolveCoverUrl } = await loadMedia();
    expect(resolveCoverUrl("/api/tournaments")).toBe(`${BASE}/api/tournaments`);
  });
});
