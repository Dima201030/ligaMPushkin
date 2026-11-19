import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { CursorBall } from "@/components/ui/CursorBall";
import { RevealObserver } from "@/components/ui/Reveal";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <RevealObserver />
      <CursorBall />
    </>
  );
}
