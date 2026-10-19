import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCardBySlug } from "@/actions/card-actions";
import BioCardView from "@/components/public/BioCardView";
import { ShieldAlert, PauseCircle } from "lucide-react";

// ISR: revalidate every 60 seconds on Vercel Edge Cache with zero database overhead
export const revalidate = 60;

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

  return {
    title: `${card.name} | Reach World NFC`,
    description: `${card.jobTitle || "Executive"} — Reach World (${card.department || "Corporate"})`,
    openGraph: {
      title: `${card.name} — Reach World`,
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

  // If card is paused by admin/HR
  if (!card.isActive) {
    return (
      <main className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-6 text-[#1D1D1F]">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-black/[0.06] text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 mb-4">
            <PauseCircle className="w-7 h-7 stroke-[1.75]" />
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F5F5F7] text-[#86868B] mb-2">
            Status: Paused
          </span>
          <h1 className="text-lg font-bold text-[#1D1D1F] mb-2">
            Card Temporarily Inactive
          </h1>
          <p className="text-xs text-[#86868B] leading-relaxed mb-6">
            This card for <span className="font-semibold text-[#1D1D1F]">{card.name}</span> has been paused by Reach World corporate management.
          </p>
          <div className="text-[11px] text-[#86868B] pt-4 border-t border-black/5 w-full">
            Reach World • Enterprise NFC Infrastructure
          </div>
        </div>
      </main>
    );
  }

  return <BioCardView card={card as any} />;
}
