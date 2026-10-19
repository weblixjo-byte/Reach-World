"use client";

import React, { useState } from "react";
import {
  Share2,
  ExternalLink,
  Download,
  Check,
  Building2,
} from "lucide-react";
import { LinkIconType } from "@/models/Card";
import { SocialIcon } from "@/components/icons/SocialIcons";

export interface PhoneCardData {
  name: string;
  jobTitle: string;
  department: string;
  headline?: string;
  location?: string;
  avatarUrl?: string;
  themeColor?: string;
  isActive?: boolean;
  slug?: string;
  links?: {
    _id?: string;
    title: string;
    url: string;
    icon: LinkIconType;
    isActive: boolean;
  }[];
}

interface LivePhonePreviewProps {
  card: PhoneCardData;
  onPreviewClick?: () => void;
}

export function getLinkIcon(iconType: LinkIconType, className = "w-4 h-4") {
  return <SocialIcon type={iconType} className={className} />;
}

export default function LivePhonePreview({ card }: LivePhonePreviewProps) {
  const [copied, setCopied] = useState(false);
  const theme = card.themeColor || "#2594a3";
  const activeLinks = (card.links || []).filter((l) => l.isActive);

  const handleCopy = () => {
    const url = typeof window !== "undefined"
      ? `${window.location.origin}/${card.slug || "demo"}`
      : `https://reachworld.com/${card.slug || "demo"}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadVCard = () => {
    const vCardData = `BEGIN:VCARD
VERSION:3.0
FN:${card.name || "Reach World Team"}
TITLE:${card.jobTitle || ""}
ORG:Reach World;${card.department || ""}
NOTE:${card.headline || ""}
ADR:;;;${card.location || "Dubai"};;;
END:VCARD`;

    const blob = new Blob([vCardData], { type: "text/vcard;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${card.name ? card.name.replace(/\s+/g, "_") : "card"}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col items-center select-none sticky top-8">
      {/* Label & Status */}
      <div className="flex items-center justify-between w-[320px] mb-3 px-1 text-xs text-[#86868B]">
        <span className="font-medium text-[#1D1D1F] flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse" />
          Live iPhone 16 Pro View
        </span>
        <button
          onClick={handleCopy}
          className="text-xs text-[#0071E3] hover:underline flex items-center gap-1 font-medium"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#34C759]" /> Copied
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" /> Copy URL
            </>
          )}
        </button>
      </div>

      {/* Realistic iPhone 16 Pro Enclosure */}
      <div className="relative w-[320px] h-[640px] bg-black rounded-[52px] p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] ring-1 ring-black/20 border-4 border-[#2A2B2E]">
        {/* Dynamic Island Pill */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-40 flex items-center justify-between px-2.5">
          <div className="w-2 h-2 rounded-full bg-[#1A1A1A]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#0b2447] border border-[#1d1d1f]" />
        </div>

        {/* Screen Frame */}
        <div className="relative w-full h-full bg-[#FAFAFC] rounded-[42px] overflow-hidden flex flex-col">
          {/* Header Graphic Gradient */}
          <div
            className="w-full h-32 relative transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, ${theme} 0%, #111827 100%)`,
            }}
          >
            <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]" />
            <div className="absolute top-7 left-5 right-5 flex justify-between items-center text-white/80 text-[10px]">
              <span className="font-semibold">9:41</span>
              <div className="flex items-center gap-1">
                <span>5G</span>
                <span className="w-4 h-2 border border-white/60 rounded-xs inline-block relative">
                  <span className="absolute left-0.5 top-0.5 bottom-0.5 right-1 bg-white/80 rounded-2xs" />
                </span>
              </div>
            </div>
          </div>

          {/* Card Body with Scrollable Area */}
          <div className="flex-1 overflow-y-auto px-5 pb-6 -mt-12 z-10 flex flex-col items-center">
            {/* Avatar Squircle */}
            <div className="relative w-22 h-22 rounded-2xl bg-white p-1 shadow-lg ring-1 ring-black/5 mb-3">
              {card.avatarUrl ? (
                <img
                  src={card.avatarUrl}
                  alt={card.name || "Employee"}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div
                  className="w-full h-full rounded-xl flex items-center justify-center font-bold text-white text-xl"
                  style={{ backgroundColor: theme }}
                >
                  {(card.name || "RW").slice(0, 2).toUpperCase()}
                </div>
              )}
              {card.isActive !== false ? (
                <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#34C759] border-2 border-white" />
              ) : (
                <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#86868B] border-2 border-white" />
              )}
            </div>

            {/* Profile Info */}
            <h3 className="text-base font-bold text-[#1D1D1F] text-center tracking-tight leading-snug">
              {card.name || "Reach World Member"}
            </h3>
            <p className="text-xs font-medium text-[#0071E3] text-center mt-0.5">
              {card.jobTitle || "Corporate Team"}
            </p>

            {/* Department & Company Badge */}
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/[0.04] text-[#1D1D1F]">
                <Building2 className="w-2.5 h-2.5" />
                Reach World
              </span>
              {card.department && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#0071E3]/10 text-[#0071E3]">
                  {card.department}
                </span>
              )}
            </div>

            {/* Headline / Bio */}
            {card.headline && (
              <p className="text-[11px] text-[#86868B] text-center mt-2.5 leading-relaxed px-1">
                {card.headline}
              </p>
            )}

            {/* Primary Action Button: Save Contact */}
            <button
              onClick={handleDownloadVCard}
              className="w-full mt-4 py-2.5 px-4 rounded-xl text-xs font-semibold text-white shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              style={{ backgroundColor: theme }}
            >
              <Download className="w-3.5 h-3.5" />
              Save Contact to Phone
            </button>

            {/* Social & Corporate Action Links */}
            <div className="w-full mt-4 space-y-2">
              {activeLinks.length > 0 ? (
                activeLinks.map((link, idx) => (
                  <a
                    key={link._id || idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-between p-2.5 bg-white rounded-xl border border-black/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-[#0071E3]/30 transition-all text-xs text-[#1D1D1F] group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
                        style={{ backgroundColor: theme }}
                      >
                        {getLinkIcon(link.icon, "w-3.5 h-3.5")}
                      </div>
                      <span className="font-medium truncate max-w-[170px]">
                        {link.title}
                      </span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-[#86868B] group-hover:text-[#0071E3] transition-colors" />
                  </a>
                ))
              ) : (
                <div className="p-4 bg-white/60 rounded-xl border border-dashed border-black/10 text-center text-[11px] text-[#86868B]">
                  No links added yet. Add links using the editor.
                </div>
              )}
            </div>

            {/* Footer NFC Branding */}
            <div className="mt-6 pt-3 border-t border-black/[0.05] w-full flex items-center justify-center gap-1.5 text-[10px] text-[#86868B]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
              Tap to Share • Reach World NFC
            </div>
          </div>

          {/* iPhone Home Indicator bar */}
          <div className="w-28 h-1 bg-black/30 rounded-full mx-auto my-2" />
        </div>
      </div>
    </div>
  );
}
