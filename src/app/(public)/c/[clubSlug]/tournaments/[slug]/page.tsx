import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TournamentDetailView } from "@/components/domain/TournamentDetailView";
import { isPlatformClubSlug, normalizeClubSlug } from "@/lib/club/tenant";
import { getTournamentPage } from "@/lib/data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ clubSlug: string; slug: string }>;
}): Promise<Metadata> {
  const { clubSlug: rawClub, slug } = await params;
  const clubSlug = normalizeClubSlug(rawClub);
  if (!clubSlug || isPlatformClubSlug(clubSlug)) return { title: "Турнир не найден" };
  const page = await getTournamentPage(slug, { clubSlug });
  if (!page) return { title: "Турнир не найден" };
  return {
    title: page.tournament.title,
    description: page.tournament.description.slice(0, 160),
  };
}

export default async function ClubTournamentPage({
  params,
}: {
  params: Promise<{ clubSlug: string; slug: string }>;
}) {
  const { clubSlug: rawClub, slug } = await params;
  const clubSlug = normalizeClubSlug(rawClub);
  if (!clubSlug || isPlatformClubSlug(clubSlug)) notFound();
  return <TournamentDetailView slug={slug} clubSlug={clubSlug} />;
}
