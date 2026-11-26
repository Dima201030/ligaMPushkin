import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ProjectAboutStats } from "@/components/organizer/ProjectAboutStats";
import { OrganizerHeader } from "@/components/organizer/OrganizerUI";
import { CLUB } from "@/lib/domain";
import { requireOrganizerSession } from "@/lib/organizer-access";

export const metadata: Metadata = {
  title: "О проекте",
  description: `Объём кодовой базы платформы ${CLUB.productName}.`,
};

export default async function OrganizerAboutPage() {
  await requireOrganizerSession();

  return (
    <>
      <OrganizerHeader
        eyebrow={CLUB.productName}
        title="О проекте"
        description="Сколько кода за платформой турниров: API, клубный UI и публичный сайт."
        actions={
          <Link href="/organizer" className="btn btn-secondary btn-sm">
            К обзору
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </Link>
        }
      />

      <div className="space-y-10 px-4 py-7 md:px-8 lg:px-10">
        <ProjectAboutStats />
      </div>
    </>
  );
}
