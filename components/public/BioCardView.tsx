"use client";

import React, { useEffect, useState } from "react";
import {
  ChevronRight,
  PhoneCall,
  Download,
  Share2,
  Check,
} from "lucide-react";
import { SocialIcon, ReachWorldLogo } from "@/components/icons/SocialIcons";
import { LinkIconType } from "@/models/Card";
import confetti from "canvas-confetti";

interface BioCardViewProps {
  card: {
    _id: string;
    name: string;
    slug: string;
    jobTitle?: string;
    department?: string;
    headline?: string;
    location?: string;
    avatarUrl?: string;
    themeColor?: string;
    phone?: string;
    email?: string;
    isActive: boolean;
    views: number;
    links: {
      _id?: string;
      title: string;
      subtitle?: string;
      url: string;
      icon: LinkIconType;
      isActive: boolean;
      clicks: number;
    }[];
  };
}

// Brand color palette per icon type for high-end aesthetic
const iconColorMap: Record<string, { bg: string; text: string; border: string }> = {
  phone: { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/25" },
  whatsapp: { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/25" },
  email: { bg: "bg-sky-500/15", text: "text-sky-400", border: "border-sky-500/25" },
  website: { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/25" },
  maps: { bg: "bg-rose-500/15", text: "text-rose-400", border: "border-rose-500/25" },
  linkedin: { bg: "bg-blue-600/15", text: "text-blue-400", border: "border-blue-600/25" },
  instagram: { bg: "bg-pink-500/15", text: "text-pink-400", border: "border-pink-500/25" },
  facebook: { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/25" },
  twitter: { bg: "bg-slate-400/15", text: "text-slate-200", border: "border-slate-400/25" },
  custom: { bg: "bg-indigo-500/15", text: "text-indigo-400", border: "border-indigo-500/25" },
};

export default function BioCardView({ card }: BioCardViewProps) {
  const [copied, setCopied] = useState(false);

  // Background non-blocking edge view tracking
  useEffect(() => {
    try {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: card.slug, type: "view" }),
      }).catch(() => {});
    } catch {}
  }, [card.slug]);

  const handleLinkClick = (linkId?: string) => {
    if (!linkId) return;
    try {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: card.slug, type: "click", linkId }),
      }).catch(() => {});
    } catch {}
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      if (navigator.share) {
        navigator.share({
          title: `${card.name} — Reach World`,
          text: `Reach World Corporate Digital Card: ${card.name}`,
          url: window.location.href,
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handleDownloadVCard = () => {
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {}

    const vCardData = `BEGIN:VCARD
VERSION:3.0
FN:${card.name || "Reach World Team"}
TITLE:${card.jobTitle || ""}
ORG:Reach World;${card.department || ""}
TEL;TYPE=CELL:${card.phone || ""}
EMAIL:${card.email || ""}
ADR:;;;${card.location || "Amman, Jordan"};;;
URL:${typeof window !== "undefined" ? window.location.href : ""}
END:VCARD`;

    const blob = new Blob([vCardData], { type: "text/vcard;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(card.name || "reach-contact").replace(/\s+/g, "_")}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Separate social media pills from standard vertical link cards
  const socialPillTypes = ["linkedin", "instagram", "facebook", "twitter"];
  const allActiveLinks = (card.links || []).filter((l) => l.isActive);

  const mainListLinks = allActiveLinks.filter(
    (l) => !socialPillTypes.includes(l.icon)
  );
  const bottomSocialLinks = allActiveLinks.filter((l) =>
    socialPillTypes.includes(l.icon)
  );

  return (
    <main className="min-h-[100dvh] w-full flex flex-col items-center justify-between bg-[#061528] text-white selection:bg-[#0284c7]/30 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
      {/* Top Floating Action Bar */}
      <div className="w-full max-w-[420px] flex items-center justify-between pt-2 pb-6">
        <button
          onClick={handleShare}
          className="px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/15 active:scale-95 backdrop-blur-xl border border-white/15 text-white/90 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-white/80" />
              <span>Share</span>
            </>
          )}
        </button>

        <button
          onClick={handleDownloadVCard}
          className="px-4 py-2 rounded-full bg-[#0071E3] hover:bg-[#0077ED] active:scale-95 text-white text-xs font-semibold flex items-center gap-1.5 shadow-[0_4px_16px_rgba(0,113,227,0.4)] transition-all"
        >
          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Save Contact</span>
        </button>
      </div>

      {/* Main Content Body */}
      <div className="w-full max-w-[420px] flex-1 flex flex-col items-center justify-start space-y-6">
        {/* Reach World Brand Logo - Resized and balanced */}
        <div className="pt-1 pb-2">
          <ReachWorldLogo className="w-40 sm:w-44" />
        </div>

        {/* Employee Identity Header */}
        <div className="text-center space-y-1.5 px-2">
          <h1 className="text-2xl sm:text-[26px] font-extrabold text-white tracking-tight leading-snug">
            {card.name}
          </h1>

          <div className="inline-flex items-center gap-2">
            <span className="text-[11px] font-bold tracking-[0.2em] text-[#38bdf8] uppercase">
              {card.jobTitle || "REACH WORLD"}
            </span>
            {card.department && (
              <>
                <span className="w-1 h-1 rounded-full bg-white/30" />
                <span className="text-[11px] font-medium tracking-wider text-white/50 uppercase">
                  {card.department}
                </span>
              </>
            )}
          </div>

          {card.headline && (
            <p className="text-xs text-white/70 max-w-xs mx-auto leading-relaxed pt-1 font-normal">
              {card.headline}
            </p>
          )}
        </div>

        {/* Direct Contact Links */}
        <div className="w-full space-y-3 pt-2">
          <div className="flex items-center gap-2 px-1 text-[#38bdf8] text-[11px] font-bold tracking-widest uppercase">
            <PhoneCall className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>DIRECT CONTACT</span>
          </div>

          <div className="w-full space-y-2.5">
            {mainListLinks.length > 0 ? (
              mainListLinks.map((link, idx) => {
                return (
                  <a
                    key={link._id || idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleLinkClick(link._id)}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#0a1f3a]/80 hover:bg-[#0d274c] active:scale-[0.98] border border-white/10 hover:border-white/20 shadow-[0_4px_24px_rgba(0,0,0,0.3)] transition-all group backdrop-blur-md"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Official Logo / Badge */}
                      <div className="w-11 h-11 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-md">
                        <SocialIcon type={link.icon} className="w-11 h-11" />
                      </div>

                      {/* Labels */}
                      <div className="min-w-0 flex flex-col justify-center">
                        <span className="font-semibold text-sm text-white group-hover:text-[#38bdf8] transition-colors truncate">
                          {link.title}
                        </span>
                        {link.subtitle ? (
                          <span className="text-[11px] text-white/60 truncate mt-0.5 font-medium">
                            {link.subtitle}
                          </span>
                        ) : (
                          <span className="text-[11px] text-white/40 truncate mt-0.5 font-mono">
                            {link.url.replace(/^https?:\/\//, "")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Chevron Indicator */}
                    <div className="w-7 h-7 rounded-full bg-white/5 group-hover:bg-white/10 flex items-center justify-center flex-shrink-0 ml-2 transition-colors">
                      <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </a>
                );
              })
            ) : (
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center text-xs text-white/50">
                No direct contact details registered yet.
              </div>
            )}
          </div>
        </div>

        {/* Bottom Social Media Squircle Pills */}
        {bottomSocialLinks.length > 0 && (
          <div className="w-full pt-3">
            <div className="flex items-center justify-center gap-3.5">
              {bottomSocialLinks.map((sLink, sIdx) => {
                return (
                  <a
                    key={sLink._id || sIdx}
                    href={sLink.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleLinkClick(sLink._id)}
                    className="w-12 h-12 rounded-2xl overflow-hidden hover:scale-110 active:scale-95 flex items-center justify-center transition-all shadow-lg"
                    title={sLink.title}
                  >
                    <SocialIcon type={sLink.icon} className="w-12 h-12" />
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modern Clean Footer with Safe Area */}
      <footer className="w-full max-w-[420px] pt-8 pb-2 flex flex-col items-center">
        <div className="w-full h-px bg-white/10 mb-4" />
        <p className="text-center text-[11px] text-white/40 font-medium tracking-wide">
          Powered by{" "}
          <a
            href="https://weblix.jo"
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
