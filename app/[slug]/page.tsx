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

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL && !process.env.NEXT_PUBLIC_BASE_URL.includes("localhost")
      ? process.env.NEXT_PUBLIC_BASE_URL
      : process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://reach-world.vercel.app";

  const ogImageUrl = `${baseUrl}/og-image.jpg`;

  if (!card) {
    return {
      metadataBase: new URL(baseUrl),
      title: "Card Not Found — Reach World",
      description: "Reach World Digital Card",
    };
  }

  // Ultra-clean, prestigious executive title & description (short & elegant)
  const title = `${card.name} — Reach World`;
  const description = card.jobTitle
    ? `${card.jobTitle} • Reach World`
    : "Digital Business Card • Reach World";

  const cardUrl = `${baseUrl}/${resolvedParams.slug}`;

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    openGraph: {
      type: "profile",
      url: cardUrl,
      title,
      description,
      siteName: "Reach World",
      locale: "en_US",
      images: [
        {
          url: ogImageUrl,
          secureUrl: ogImageUrl,
          width: 1024,
          height: 1024,
          type: "image/jpeg",
          alt: `${card.name} — Reach World Digital Card`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
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

        {/* Center Minimalist Status Notice - Frosted Glass Container */}
        <div className="relative z-10 max-w-sm w-full text-center flex flex-col items-center my-auto px-6 py-8 rounded-3xl bg-white/[0.05] border border-white/[0.12] shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent pointer-events-none" />

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/12 to-white/[0.03] border border-white/20 flex items-center justify-center text-white/70 mb-5 shadow-inner backdrop-blur-md">
            <Pause className="w-6 h-6 stroke-[1.5] text-amber-400" />
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2.5">
            Card Temporarily Inactive
          </h1>

          <p className="text-xs sm:text-sm text-slate-300/80 leading-relaxed max-w-xs mx-auto mb-7 font-normal">
            This digital card is currently inactive. Please visit our official website for assistance.
          </p>

          <a
            href="https://reachworld.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2.5 rounded-full text-xs font-semibold text-white bg-white/[0.08] hover:bg-white/[0.15] border border-white/[0.15] hover:border-sky-400/40 transition-all inline-flex items-center gap-2 active:scale-95 shadow-[0_4px_20px_rgba(0,0,0,0.3)] cursor-pointer backdrop-blur-md"
          >
            <span>reachworld.com</span>
            <ArrowRight className="w-3.5 h-3.5 text-white/60" />
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
