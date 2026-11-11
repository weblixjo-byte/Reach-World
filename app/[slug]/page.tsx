import React from "react";
import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import Image from "next/image";
import { getCardBySlug, recordCardTap } from "@/actions/card-actions";
import BioCardView from "@/components/public/BioCardView";
import { Pause, ArrowRight, Radio } from "lucide-react";
import { normalizeRedirectUrl } from "@/lib/url-utils";

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
    return (
      <main className="relative min-h-[100dvh] w-full flex flex-col items-center justify-between bg-[#020b18] text-white selection:bg-[#00d2ff]/30 px-4 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] font-sans overflow-hidden">
        {/* Authentic Reach World Feather Texture Background */}
        <div
          className="fixed inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity pointer-events-none scale-105"
          style={{ backgroundImage: `url('/branding/card-bg-feathers.jpg')` }}
        />
        <div className="fixed inset-0 bg-gradient-to-b from-[#020b18]/85 via-[#03132b]/90 to-[#020b18] pointer-events-none" />

        {/* Top Reach World Official Logo */}
        <div className="relative z-10 pt-4 pb-2">
          <div className="p-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg shadow-black/40">
            <Image
              src="/branding/reach-world-white.jpg"
              alt="Reach World"
              width={180}
              height={55}
              className="h-11 w-auto object-contain brightness-110"
              priority
            />
          </div>
        </div>

        {/* Center Minimalist Status Notice */}
        <div className="relative z-10 max-w-sm w-full text-center flex flex-col items-center my-auto px-4 animate-in fade-in duration-300">
          <div className="w-14 h-14 rounded-2xl bg-[#061730]/90 border border-white/15 flex items-center justify-center text-slate-300 mb-5 shadow-xl backdrop-blur-md">
            <Pause className="w-6 h-6 stroke-[1.75] text-amber-400" />
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2.5">
            Card Temporarily Inactive
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xs mx-auto mb-7 font-normal">
            This digital card is currently paused by Reach World corporate management. Please visit our official corporate website for assistance.
          </p>

          <a
            href="https://reachworld.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 border border-white/15 transition-all inline-flex items-center gap-2 active:scale-95 shadow-lg shadow-blue-500/25 cursor-pointer"
          >
            <span>Visit reachworld.com</span>
            <ArrowRight className="w-4 h-4 text-white/80" />
          </a>
        </div>

        {/* Official Card Back Branding & Weblix-jo Footer */}
        <footer className="relative z-10 w-full max-w-[420px] pt-6 pb-2 flex flex-col items-center space-y-2">
          <div className="flex items-center gap-2 text-[11px] tracking-wider text-slate-400 uppercase font-medium">
            <Radio className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            <span>Tap To Connect • reachworld.com</span>
          </div>
          <p className="text-center text-[10px] text-slate-500 font-medium tracking-wide">
            powered by{" "}
            <a
              href="https://weblix-jo.com/en"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white underline decoration-slate-600 transition-colors font-semibold"
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
