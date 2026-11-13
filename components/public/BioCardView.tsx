"use client";

import React, { useState } from "react";
import {
  ChevronRight,
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
    cardNumber?: number;
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

export default function BioCardView({ card }: BioCardViewProps) {
  const [copied, setCopied] = useState(false);

  // Link click tracking (views are accurately counted on the server)
  const handleLinkClick = (linkId?: string, icon?: string) => {
    try {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: card.slug, type: "click", linkId, icon }),
        keepalive: true,
      }).catch(() => {});
    } catch {}
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      if (navigator.share) {
        navigator.share({
          title: `${card.name} — Reach World`,
          text: `Reach World Digital Card: ${card.name}`,
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
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: card.slug, type: "vcard" }),
        keepalive: true,
      }).catch(() => {});
    } catch {}

    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {}

    const rawName = (card.name || "Reach World Team").trim();
    const parts = rawName.split(/\s+/);
    const firstName = parts[0] || "";
    const lastName = parts.length > 1 ? parts.slice(1).join(" ") : "";

    const vCardLines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `N:${lastName};${firstName};;;`,
      `FN:${rawName}`,
      card.jobTitle ? `TITLE:${card.jobTitle}` : "",
      `ORG:Reach World${card.department ? `;${card.department}` : ""}`,
      card.phone ? `TEL;TYPE=CELL,VOICE:${card.phone}` : "",
      card.email ? `EMAIL;TYPE=INTERNET,WORK:${card.email}` : "",
      `ADR;TYPE=WORK:;;;${card.location || "Amman"};;;Jordan`,
      typeof window !== "undefined" ? `URL:${window.location.href}` : "",
      "END:VCARD",
    ]
      .filter((line) => line.length > 0)
      .join("\r\n");

    const blob = new Blob([vCardLines], { type: "text/vcard;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${rawName.replace(/\s+/g, "_")}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const socialPillTypes = ["linkedin", "instagram", "facebook", "twitter"];
  const allActiveLinks = (card.links || []).filter((l) => l.isActive);

  const mainListLinks = allActiveLinks.filter(
    (l) => !socialPillTypes.includes(l.icon)
  );
  const bottomSocialLinks = allActiveLinks.filter((l) =>
    socialPillTypes.includes(l.icon)
  );

  return (
    <main className="relative min-h-[100dvh] w-full flex flex-col items-center justify-between bg-[#020b18] text-white selection:bg-[#0071E3]/30 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.75rem,env(safe-area-inset-bottom))] font-sans overflow-x-hidden">
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
        {/* Soft elegant vignette so feathers are clearly visible while text remains crisp */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#020b18]/60 via-black/25 to-[#020b18]/80" />
      </div>

      {/* Top Floating Action Bar */}
      <div className="relative z-10 w-full max-w-[420px] flex items-center justify-between pt-2 pb-6">
        <button
          onClick={handleShare}
          className="px-4 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.14] active:scale-95 backdrop-blur-2xl border border-white/[0.14] text-white/90 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)] cursor-pointer"
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
          className="px-4 py-2 rounded-full bg-gradient-to-r from-[#0062E0] via-[#0077F2] to-[#0091FF] hover:brightness-110 active:scale-95 text-white text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_24px_rgba(0,119,242,0.45)] border border-sky-300/35 transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Save Contact</span>
        </button>
      </div>

      {/* Main Content Body */}
      <div className="relative z-10 w-full max-w-[420px] flex-1 flex flex-col items-center justify-start space-y-6">
        {/* Subtle Ambient Radial Backlight behind identity */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Reach World Brand Logo */}
        <div className="pt-1 pb-2 flex flex-col items-center">
          <ReachWorldLogo className="w-40 sm:w-44 drop-shadow-[0_6px_24px_rgba(0,0,0,0.8)]" />
        </div>

        {/* Employee Identity Header */}
        <div className="text-center space-y-2 px-2">
          <h1 className="text-2xl sm:text-[28px] font-extrabold text-white tracking-tight leading-snug drop-shadow-md">
            {card.name}
          </h1>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-md shadow-sm">
            <span className="text-[11px] font-bold tracking-[0.2em] text-[#38bdf8] uppercase">
              {card.jobTitle || "REACH WORLD"}
            </span>
            {card.department && (
              <>
                <span className="w-1 h-1 rounded-full bg-white/40" />
                <span className="text-[11px] font-medium tracking-wider text-white/70 uppercase">
                  {card.department}
                </span>
              </>
            )}
          </div>

          {card.headline && (
            <p className="text-xs text-slate-300/85 max-w-xs mx-auto leading-relaxed pt-1 font-normal">
              {card.headline}
            </p>
          )}
        </div>

        {/* Direct Contact Links List - Premium Glassmorphism */}
        <div className="w-full space-y-2.5 pt-2">
          {mainListLinks.length > 0 ? (
            mainListLinks.map((link, idx) => {
              return (
                <a
                  key={link._id || idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleLinkClick(link._id, link.icon)}
                  className="relative overflow-hidden w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.09] active:scale-[0.98] border border-white/[0.12] hover:border-sky-400/40 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:shadow-[0_12px_40px_0_rgba(0,113,227,0.22)] transition-all group backdrop-blur-2xl"
                >
                  {/* Glass Top Rim Reflection */}
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Glass Icon Container */}
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-white/12 to-white/[0.03] border border-white/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 group-hover:border-sky-400/50 transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] p-2.5">
                      <SocialIcon type={link.icon} className="w-full h-full" />
                    </div>

                    {/* Labels */}
                    <div className="min-w-0 flex flex-col justify-center">
                      <span className="font-semibold text-[14px] text-white group-hover:text-[#38bdf8] transition-colors truncate">
                        {link.title}
                      </span>
                      {link.subtitle ? (
                        <span className="text-[11px] text-slate-300/75 truncate mt-0.5 font-normal">
                          {link.subtitle}
                        </span>
                      ) : (
                        <span className="text-[11px] text-white/40 truncate mt-0.5 font-mono">
                          {link.url.replace(/^https?:\/\//, "")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Glass Chevron Indicator */}
                  <div className="w-7 h-7 rounded-full bg-white/[0.06] border border-white/10 group-hover:bg-sky-500/20 group-hover:border-sky-400/40 flex items-center justify-center flex-shrink-0 ml-2 transition-all">
                    <ChevronRight className="w-4 h-4 text-white/50 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </div>
                </a>
              );
            })
          ) : (
            <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/10 text-center text-xs text-white/50 backdrop-blur-xl">
              No direct contact details registered yet.
            </div>
          )}
        </div>

        {/* Bottom Social Media Pills - Glassmorphism */}
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
                    onClick={() => handleLinkClick(sLink._id, sLink.icon)}
                    className="relative overflow-hidden w-12 h-12 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] hover:border-sky-400/40 hover:scale-105 active:scale-95 flex items-center justify-center transition-all shadow-[0_8px_24px_rgba(0,0,0,0.3)] p-3 backdrop-blur-2xl"
                    title={sLink.title}
                  >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
                    <SocialIcon type={sLink.icon} className="w-full h-full" />
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modern Clean Footer with Safe Area */}
      <footer className="relative z-10 w-full max-w-[420px] pt-8 pb-2 flex flex-col items-center">
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
