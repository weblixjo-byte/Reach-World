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
        particleCount: 45,
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

  // Group main action items from social icons (linkedin, instagram, facebook, twitter)
  const socialPillTypes = ["linkedin", "instagram", "facebook", "twitter"];
  const allActiveLinks = (card.links || []).filter((l) => l.isActive);

  // If card has default items, use them or fallback
  const mainListLinks = allActiveLinks.filter(
    (l) => !socialPillTypes.includes(l.icon)
  );
  const bottomSocialLinks = allActiveLinks.filter((l) =>
    socialPillTypes.includes(l.icon)
  );

  return (
    <main
      className="min-h-screen w-full flex flex-col items-center justify-start p-3 sm:p-6 text-white selection:bg-[#38bdf8]/30 selection:text-white"
      style={{
        background: "radial-gradient(circle at 50% 15%, #0d274c 0%, #061528 50%, #030a14 100%)",
      }}
    >
      {/* Floating Action Button (Top Right Share & Save Contact) */}
      <div className="w-full max-w-[420px] flex items-center justify-between py-2 px-1 mb-2">
        <button
          onClick={handleShare}
          className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-white/80 hover:text-white text-xs flex items-center gap-1.5 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#34C759]" /> Copied Link
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" /> Share Card
            </>
          )}
        </button>

        <button
          onClick={handleDownloadVCard}
          className="px-3.5 py-1.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
        >
          <Download className="w-3.5 h-3.5" /> Save Contact
        </button>
      </div>

      {/* Main Glassmorphism Dark Card Container */}
      <div className="w-full max-w-[420px] flex flex-col items-center px-4 py-8">
        {/* Reach World Brand Logo */}
        <ReachWorldLogo className="w-56 mb-6" />

        {/* Employee Full Name */}
        <h1 className="text-2xl font-bold text-white tracking-tight text-center">
          {card.name}
        </h1>

        {/* Company Subtitle */}
        <p className="text-xs font-bold tracking-[0.22em] text-[#38bdf8] uppercase text-center mt-1">
          {card.jobTitle || "REACH WORLD"}
        </p>

        {card.headline && (
          <p className="text-xs text-white/60 text-center mt-2 max-w-xs leading-relaxed">
            {card.headline}
          </p>
        )}

        {/* Section Heading: Direct Contact */}
        <div className="w-full flex items-center gap-2 mt-8 mb-4 px-1 text-[#38bdf8] text-xs font-bold tracking-wider uppercase">
          <PhoneCall className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>DIRECT CONTACT</span>
        </div>

        {/* Main Contact Action Cards */}
        <div className="w-full space-y-3">
          {mainListLinks.length > 0 ? (
            mainListLinks.map((link, idx) => (
              <a
                key={link._id || idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleLinkClick(link._id)}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#091b33]/90 hover:bg-[#0c2444] border border-[#1e3a63]/60 hover:border-[#38bdf8]/50 shadow-[0_4px_20px_rgba(0,0,0,0.25)] transition-all group active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Circular Icon Container */}
                  <div className="w-10 h-10 rounded-xl bg-[#0e2c54] border border-[#1e467d] flex items-center justify-center text-[#38bdf8] flex-shrink-0 group-hover:scale-105 transition-transform">
                    <SocialIcon type={link.icon} className="w-5 h-5 stroke-[1.8]" />
                  </div>

                  {/* Title & Subtitle */}
                  <div className="min-w-0 flex flex-col">
                    <span className="font-semibold text-sm text-white group-hover:text-[#38bdf8] transition-colors truncate">
                      {link.title}
                    </span>
                    {link.subtitle ? (
                      <span className="text-xs text-white/60 truncate">
                        {link.subtitle}
                      </span>
                    ) : (
                      <span className="text-xs text-white/40 truncate">
                        {link.url.replace(/^https?:\/\//, "")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Chevron */}
                <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-[#38bdf8] group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2" />
              </a>
            ))
          ) : (
            /* Fallback demo item */
            <div className="p-4 rounded-2xl bg-[#091b33]/50 border border-white/5 text-center text-xs text-white/50">
              No direct contact links configured yet.
            </div>
          )}
        </div>

        {/* Bottom Social Media Squircle Pills (LinkedIn, Instagram, Facebook, X) */}
        {bottomSocialLinks.length > 0 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            {bottomSocialLinks.map((sLink, sIdx) => (
              <a
                key={sLink._id || sIdx}
                href={sLink.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleLinkClick(sLink._id)}
                className="w-12 h-12 rounded-2xl bg-[#091b33] hover:bg-[#0f2e57] border border-[#1e3a63]/80 hover:border-[#38bdf8] flex items-center justify-center text-[#38bdf8] hover:text-white transition-all shadow-md active:scale-95"
                title={sLink.title}
              >
                <SocialIcon type={sLink.icon} className="w-5 h-5 stroke-[2]" />
              </a>
            ))}
          </div>
        )}

        {/* Divider */}
        <div className="w-full h-px bg-white/10 mt-10 mb-4" />

        {/* Powered by weblix-jo Footer */}
        <div className="text-center text-[11px] text-white/40 font-medium tracking-wide">
          Powered by{" "}
          <a
            href="https://weblix.jo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/80 hover:text-[#38bdf8] underline decoration-white/30 transition-colors font-semibold"
          >
            weblix-jo
          </a>
        </div>
      </div>
    </main>
  );
}
