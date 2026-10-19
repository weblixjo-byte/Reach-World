"use client";

import React, { useEffect, useState } from "react";
import {
  Globe,
  Share2,
  Download,
  Building2,
  Check,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { getLinkIcon } from "@/components/dashboard/LivePhonePreview";
import confetti from "canvas-confetti";

interface BioCardViewProps {
  card: {
    _id: string;
    name: string;
    slug: string;
    jobTitle: string;
    department: string;
    headline: string;
    location: string;
    avatarUrl: string;
    themeColor: string;
    isActive: boolean;
    views: number;
    links: {
      _id?: string;
      title: string;
      url: string;
      icon: any;
      isActive: boolean;
      clicks: number;
    }[];
  };
}

export default function BioCardView({ card }: BioCardViewProps) {
  const [copied, setCopied] = useState(false);
  const theme = card.themeColor || "#2594a3";
  const activeLinks = (card.links || []).filter((l) => l.isActive);

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
          title: `${card.name} — Reach World Bio`,
          text: `Reach World Corporate Digital Card: ${card.name} (${card.jobTitle})`,
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
    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {}

    const vCardData = `BEGIN:VCARD
VERSION:3.0
FN:${card.name || "Reach World Team"}
TITLE:${card.jobTitle || ""}
ORG:Reach World;${card.department || ""}
NOTE:${card.headline || ""}
ADR:;;;${card.location || "Dubai"};;;
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

  return (
    <main className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-start p-3 sm:p-6 selection:bg-[#0071E3]/20">
      {/* Container max-width 440px strictly mobile-first */}
      <div className="w-full max-w-[420px] bg-white rounded-3xl sm:rounded-[36px] shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-black/[0.06] overflow-hidden flex flex-col pb-6 my-auto">
        {/* Banner with smooth dynamic gradient */}
        <div
          className="w-full h-36 relative transition-all duration-300"
          style={{
            background: `linear-gradient(135deg, ${theme} 0%, #0F172A 100%)`,
          }}
        >
          <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]" />
          
          {/* Top floating utility controls */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-black/30 backdrop-blur-md text-white border border-white/10">
              <ShieldCheck className="w-3 h-3 text-[#34C759]" />
              Verified Employee
            </span>

            <button
              onClick={handleShare}
              className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/40 border border-white/10 transition-colors"
              title="Share Card"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#34C759]" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Content Profile Section */}
        <div className="px-6 flex flex-col items-center -mt-14 z-10">
          {/* High-res Avatar Squircle */}
          <div className="relative w-26 h-26 rounded-3xl bg-white p-1.5 shadow-xl ring-1 ring-black/5 mb-3">
            {card.avatarUrl ? (
              <img
                src={card.avatarUrl}
                alt={card.name}
                className="w-full h-full object-cover rounded-[22px]"
              />
            ) : (
              <div
                className="w-full h-full rounded-[22px] flex items-center justify-center font-bold text-white text-2xl shadow-inner"
                style={{ backgroundColor: theme }}
              >
                {card.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span
              className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-[#34C759] border-2 border-white shadow-xs"
              title="Active Profile"
            />
          </div>

          {/* Name & Title */}
          <h1 className="text-xl font-bold tracking-tight text-[#1D1D1F] text-center">
            {card.name}
          </h1>
          <p className="text-xs font-semibold text-[#0071E3] text-center mt-0.5">
            {card.jobTitle || "Executive"}
          </p>

          {/* Department & Organization */}
          <div className="flex items-center gap-1.5 mt-2.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-black/[0.04] text-[#1D1D1F]">
              <Building2 className="w-3 h-3" />
              Reach World
            </span>
            {card.department && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#0071E3]/10 text-[#0071E3]">
                {card.department}
              </span>
            )}
          </div>

          {/* Headline / Bio Tagline */}
          {card.headline && (
            <p className="text-xs text-[#86868B] text-center mt-3 leading-relaxed max-w-sm">
              "{card.headline}"
            </p>
          )}

          {/* Save Contact Primary CTA */}
          <button
            onClick={handleDownloadVCard}
            className="w-full mt-5 py-3 px-5 rounded-2xl text-xs font-semibold text-white shadow-sm flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all"
            style={{ backgroundColor: theme }}
          >
            <Download className="w-4 h-4" />
            Add to Phone Contacts
          </button>

          {/* Interactive Links */}
          <div className="w-full mt-5 space-y-2.5">
            {activeLinks.map((link, idx) => (
              <a
                key={link._id || idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleLinkClick(link._id)}
                className="w-full flex items-center justify-between p-3.5 bg-[#FBFBFD] hover:bg-white rounded-2xl border border-black/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)] hover:border-[#0071E3]/30 transition-all text-xs text-[#1D1D1F] group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs"
                    style={{ backgroundColor: theme }}
                  >
                    {getLinkIcon(link.icon, "w-4 h-4")}
                  </div>
                  <span className="font-semibold text-sm text-[#1D1D1F] group-hover:text-[#0071E3] transition-colors truncate max-w-[240px]">
                    {link.title}
                  </span>
                </div>
                <ExternalLink className="w-4 h-4 text-[#86868B] group-hover:text-[#0071E3] transition-colors" />
              </a>
            ))}
          </div>

          {/* Footer Branding */}
          <div className="mt-8 pt-4 border-t border-black/[0.05] w-full flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1D1D1F]">
              <Sparkles className="w-3.5 h-3.5 text-[#0071E3]" />
              Reach World Smart NFC Cards
            </span>
            <p className="text-[11px] text-[#86868B] mt-0.5">
              Powered by Apple-Grade Digital Identity
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
