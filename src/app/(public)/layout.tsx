import { EmailConfirmBanner } from "@/components/layout/EmailConfirmBanner";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { RevealObserver } from "@/components/ui/Reveal";
import { ToastProvider } from "@/components/motion/Toast";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { PullToRefreshHint } from "@/components/motion/PullToRefreshHint";
import { BrandPolish } from "@/components/polish/BrandPolish";
import { HeroParallax } from "@/components/motion/HeroParallax";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <SiteHeader />
      <EmailConfirmBanner />
      <PullToRefreshHint />
      <main className="page-shell-transition flex-1">{children}</main>
      <SiteFooter />
      <RevealObserver />
      <SmoothScroll />
      <HeroParallax />
      <BrandPolish />
    </ToastProvider>
  );
}
