import React from "react";
import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { getCardBySlug, recordCardTap } from "@/actions/card-actions";
import BioCardView from "@/components/public/BioCardView";
import { PauseCircle, ArrowRight, ShieldAlert, Globe } from "lucide-react";
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
  const referrer = headersList.get("referer") || "";

  // Background non-blocking tap record
  await recordCardTap(card._id, { userAgent, referrer });

  // 2. If card is paused by admin/HR
  if (!card.isActive) {
    const slotNumber = card.cardNumber < 10 ? `0${card.cardNumber}` : `${card.cardNumber}`;

    return (
      <main className="min-h-[100dvh] w-full flex flex-col items-center justify-between bg-[#061528] text-white selection:bg-[#0284c7]/30 px-4 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
        {/* Top Reach World Official Logo */}
        <div className="pt-2 pb-4">
          <ReachWorldLogo className="w-40 sm:w-44" />
        </div>

        {/* Center Frosted Glass Luxury Card */}
        <div className="max-w-[420px] w-full bg-[#0a1f3a]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-9 shadow-[0_8px_40px_rgba(0,0,0,0.5)] text-center flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
          {/* Status Badge */}
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400 mb-5 shadow-inner">
            <PauseCircle className="w-7 h-7 stroke-[1.75]" />
          </div>

          <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 border border-amber-500/25 text-amber-300 mb-3 inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Card Currently Inactive
          </span>

          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-2">
            Card Temporarily Paused
          </h1>

          <p className="text-xs sm:text-sm text-white/70 leading-relaxed mb-6 font-normal">
            This card (<span className="font-semibold text-white">{card.name}</span> • Slot #{slotNumber}) is temporarily paused by Reach World corporate management.
          </p>

          <a
            href="https://reachworld.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-xl text-xs font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/15 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
          >
            <span>Visit Reach World Website</span>
            <ArrowRight className="w-3.5 h-3.5 text-white/70" />
          </a>
        </div>

        {/* Clean Official Footer */}
        <footer className="w-full max-w-[420px] pt-8 pb-2 flex flex-col items-center">
          <div className="w-full h-px bg-white/10 mb-4" />
          <p className="text-center text-[10px] text-white/40 font-medium tracking-wide">
            powered by{" "}
            <a
              href="https://weblix-jo.com/en"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/80 hover:text-[#38bdf8] underline decoration-white/30 transition-colors font-semibold"
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
