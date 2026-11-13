import React from "react";
import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { getCardBySlug, recordCardTap } from "@/actions/card-actions";
import BioCardView from "@/components/public/BioCardView";
import { Pause, ArrowRight } from "lucide-react";
import { normalizeRedirectUrl } from "@/lib/url-utils";
import { ReachWorldLogo } from "@/components/icons/SocialIcons";

// Make dynamic to ensure taps are counted and redirects happen instantly in real time
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const card = await getCardBySlug(resolvedParams.slug);

  if (!card) {
    return {
      title: "Card Not Found — Reach World",
      description: "Reach World Digital Card",
    };
  }

  const cardTitle = card.cardNumber
    ? `Card #${card.cardNumber < 10 ? '0' + card.cardNumber : card.cardNumber} — ${card.name}`
    : card.name;

  return {
    title: `${cardTitle} | Reach World NFC`,
    description: `${card.jobTitle || "Executive"} — Reach World (${card.department || "Corporate"})`,
    openGraph: {
      title: `${cardTitle} — Reach World`,
      description: card.headline || `${card.jobTitle} at Reach World`,
      images: card.avatarUrl ? [{ url: card.avatarUrl }] : [],
    },
  };
}

export default async function PublicCardPage({ params }: PageProps) {
  const resolvedParams = await params;
  const card = await getCardBySlug(resolvedParams.slug);

  if (!card) {
    notFound();
  }

  // 1. Record the NFC tap in analytics
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "";

  // Background non-blocking tap record
  await recordCardTap(card._id, userAgent);

  // 2. If card is paused by admin/HR
  if (!card.isActive) {
    return (
      <main className="relative min-h-[100dvh] w-full flex flex-col items-center justify-between bg-[#020b18] text-white selection:bg-[#0071E3]/30 px-4 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(1.75rem,env(safe-area-inset-bottom))] font-sans overflow-hidden">
        {/* Ultra-Fast Optimized Background (46KB WebP with dark base fallback) */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#020b18]">
          <picture>
            <source srcSet="/card-bg.webp" type="image/webp" />
            <img
              src="/card-bg.jpg"
              alt="Reach World Background"
              className="w-full h-full object-cover object-center"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-b from-[#020b18]/60 via-black/25 to-[#020b18]/80" />
        </div>

        {/* Top Reach World Official Logo */}
        <div className="relative z-10 pt-4 pb-2">
          <ReachWorldLogo className="w-36 sm:w-40 opacity-90 drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]" />
        </div>

        {/* Center Minimalist Status Notice */}
        <div className="relative z-10 max-w-sm w-full text-center flex flex-col items-center my-auto px-4 animate-in fade-in duration-300">
          <div className="w-14 h-14 rounded-2xl bg-[#07172e]/80 border border-white/10 flex items-center justify-center text-white/70 mb-5 shadow-lg backdrop-blur-md">
            <Pause className="w-6 h-6 stroke-[1.5] text-amber-400/90" />
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2.5">
            Card Temporarily Inactive
          </h1>

          <p className="text-xs sm:text-sm text-white/60 leading-relaxed max-w-xs mx-auto mb-7 font-normal">
            This digital card is currently inactive. Please visit our official corporate website for assistance.
          </p>

          <a
            href="https://reachworld.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2.5 rounded-full text-xs font-semibold text-white/90 hover:text-white bg-white/10 hover:bg-white/15 border border-white/15 transition-all inline-flex items-center gap-2 active:scale-95 shadow-sm cursor-pointer backdrop-blur-sm"
          >
            <span>reachworld.com</span>
            <ArrowRight className="w-3.5 h-3.5 text-white/50" />
          </a>
        </div>

        {/* Official Clean Footer */}
        <footer className="relative z-10 w-full max-w-[420px] pt-6 pb-2 flex flex-col items-center">
          <div className="w-full h-px bg-white/10 mb-4" />
          <p className="text-center text-[10px] text-white/40 font-medium tracking-wide">
            powered by{" "}
            <a
              href="https://weblix-jo.com/en"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 hover:text-white underline decoration-white/30 transition-colors font-semibold"
            >
              weblix-jo
            </a>
          </p>
        </footer>
      </main>
    );
  }

  // 3. If in Direct Redirect mode and a destination URL is configured -> Redirect immediately!
  if (card.mode === "redirect" && card.redirectUrl && card.redirectUrl.trim()) {
    const destination = normalizeRedirectUrl(card.redirectUrl);
    if (destination) {
      redirect(destination);
    }
  }

  // 4. Otherwise, display the full Reach World Digital Bio Card Profile
  return <BioCardView card={card as any} />;
}
