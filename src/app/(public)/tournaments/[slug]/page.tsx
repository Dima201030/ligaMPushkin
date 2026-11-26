import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { TournamentDetailView } from "@/components/domain/TournamentDetailView";
import { DEFAULT_CLUB_SLUG, tournamentPath } from "@/lib/club/tenant";
import { getTournamentPage, listTournaments } from "@/lib/data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const catalog = await listTournaments({ status: "all" }).catch(() => []);
  const hit = catalog.find((item) => item.slug === slug);
  if (hit) {
    return {
      title: hit.title,
      description: hit.description.slice(0, 160),
    };
  }
  const page = await getTournamentPage(slug);
  if (!page) return { title: "Турнир не найден" };
  return {
    title: page.tournament.title,
    description: page.tournament.description.slice(0, 160),
  };
}

/** Legacy URL: resolve club from platform catalog, then canonical club-scoped path. */
export default async function TournamentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const catalog = await listTournaments({ status: "all" }).catch(() => []);
  const matches = catalog.filter((item) => item.slug === slug && item.clubSlug);
  if (matches.length > 0) {
    const preferred =
      matches.find((item) => item.clubSlug === DEFAULT_CLUB_SLUG) ?? matches[0];
    if (preferred.clubSlug) {
      redirect(tournamentPath(preferred.clubSlug, slug));
    }
  }
  return <TournamentDetailView slug={slug} />;
}
