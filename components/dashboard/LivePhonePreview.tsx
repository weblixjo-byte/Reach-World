"use client";

import React, { useState } from "react";
import {
  Share2,
  ChevronRight,
  Download,
  Check,
  Globe,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { LinkIconType, CardModeType } from "@/models/Card";
import { SocialIcon, ReachWorldLogo } from "@/components/icons/SocialIcons";

export interface PhoneCardData {
  cardNumber?: number;
  name: string;
  jobTitle: string;
  department: string;
  headline?: string;
  location?: string;
  avatarUrl?: string;
  themeColor?: string;
  phone?: string;
  email?: string;
  mode?: CardModeType;
  redirectUrl?: string;
  isActive?: boolean;
  slug?: string;
  links?: {
    _id?: string;
    title: string;
    subtitle?: string;
    url: string;
    icon: LinkIconType;
    isActive: boolean;
  }[];
}

interface LivePhonePreviewProps {
  card: PhoneCardData;
}

export function getLinkIcon(iconType: LinkIconType, className = "w-4 h-4") {
  return <SocialIcon type={iconType} className={className} />;
}

export default function LivePhonePreview({ card }: LivePhonePreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/${card.slug || "1"}`
        : `https://reachworld.com/${card.slug || "1"}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadVCard = () => {
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

  const isCustomLink = card.mode === "redirect";
  const socialPillTypes = ["linkedin", "instagram", "facebook", "twitter"];
  const allActiveLinks = (card.links || []).filter((l) => l.isActive);

  const mainListLinks = allActiveLinks.filter(
    (l) => !socialPillTypes.includes(l.icon)
  );
  const bottomSocialLinks = allActiveLinks.filter((l) =>
    socialPillTypes.includes(l.icon)
  );

  const slotPadded = card.cardNumber
    ? card.cardNumber < 10
      ? `0${card.cardNumber}`
      : `${card.cardNumber}`
    : "01";

  return (
    <div className="flex flex-col items-center select-none sticky top-8">
      {/* Label & Status */}
      <div className="flex items-center justify-between w-[340px] mb-3 px-1 text-xs text-[#86868B]">
        <span className="font-medium text-[#1D1D1F] flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse" />
          Live Mobile Preview
        </span>
        <button
          onClick={handleCopy}
          className="text-xs text-[#0071E3] hover:underline flex items-center gap-1 font-medium cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#34C759]" /> Copied
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" /> Copy /{card.slug || slotPadded}
            </>
          )}
        </button>
      </div>

      {/* Realistic iPhone 16 Pro Enclosure */}
      <div className="relative w-[340px] h-[670px] bg-black rounded-[54px] p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] ring-1 ring-black/20 border-4 border-[#2A2B2E]">
        {/* Dynamic Island Pill */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-40 flex items-center justify-between px-2.5">
          <div className="w-2 h-2 rounded-full bg-[#1A1A1A]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#0b2447] border border-[#1d1d1f]" />
        </div>

        {/* Screen Frame */}
        <div
          className="relative w-full h-full rounded-[44px] overflow-hidden flex flex-col text-white"
          style={{
            background:
              "radial-gradient(circle at 50% 15%, #0d274c 0%, #061528 50%, #030a14 100%)",
          }}
        >
          {/* iOS Top Status Bar */}
          <div className="pt-3 px-6 pb-2 flex justify-between items-center text-white/70 text-[10px] z-30">
            <span className="font-semibold">9:41</span>
            <div className="flex items-center gap-1">
              <span>5G</span>
              <span className="w-4 h-2 border border-white/60 rounded-xs inline-block relative">
                <span className="absolute left-0.5 top-0.5 bottom-0.5 right-1 bg-white/80 rounded-2xs" />
              </span>
            </div>
          </div>

          {/* SCREEN CONTENT */}
          {isCustomLink ? (
            /* Custom Web Link View */
            <div className="flex-1 px-5 py-6 flex flex-col justify-between items-center text-center">
              <div className="w-full flex flex-col items-center">
                <ReachWorldLogo className="w-36 my-2" />

                <div className="mt-8 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-3xl bg-[#0071E3]/20 border border-[#0071E3]/40 flex items-center justify-center text-[#38bdf8] mb-3 shadow-[0_0_30px_rgba(0,113,227,0.3)]">
                    <Globe className="w-8 h-8 stroke-[1.75]" />
                  </div>

                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#0071E3] text-white tracking-wider uppercase mb-2 shadow-sm">
                    Custom Web Link
                  </span>

                  <h3 className="text-base font-bold text-white tracking-tight">
                    Card #{slotPadded}
                  </h3>
                  <p className="text-[11px] text-white/70 mt-1">
                    {card.name || "Reach World Card"}
                  </p>
                </div>

                {/* Target URL Box */}
                <div className="w-full bg-[#0a1f3a]/90 border border-white/10 rounded-2xl p-4 mt-6 text-left shadow-lg">
                  <div className="text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-[#38bdf8]" /> Opening Link:
                  </div>
                  <div className="font-mono text-xs text-[#38bdf8] break-all font-semibold">
                    {card.redirectUrl || "https://reachworld.com"}
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-white/50">
                    <span>Card Path: /{card.slug || slotPadded}</span>
                    <span className="text-emerald-400 font-semibold">Connected</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="w-full space-y-2">
                <a
                  href={card.redirectUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <span>Open Website Link</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <p className="text-[9px] text-white/40">
                  Tapping this physical card will open the assigned link
                </p>
              </div>
            </div>
          ) : (
            /* Digital Bio Card View */
            <div className="flex-1 overflow-y-auto px-4 pb-6 pt-2 flex flex-col items-center">
              <ReachWorldLogo className="w-40 my-2" />

              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#0071E3]/20 border border-[#0071E3]/30 text-[#38bdf8] mt-1">
                Card #{slotPadded}
              </span>

              <h3 className="text-base font-bold text-white tracking-tight text-center mt-2 leading-tight">
                {card.name || "Mohammad Alseidi"}
              </h3>

              <p className="text-[10px] font-bold tracking-[0.2em] text-[#38bdf8] uppercase text-center mt-1">
                {card.jobTitle || "REACH WORLD"}
              </p>

              {/* Contact Action List */}
              <div className="w-full space-y-2 mt-4">
                {mainListLinks.length > 0 ? (
                  mainListLinks.map((link, idx) => (
                    <div
                      key={link._id || idx}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#0a1f3a]/80 border border-white/10 shadow-sm"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[#0f284b] border border-white/10 flex items-center justify-center flex-shrink-0 shadow-xs p-1.5">
                          <SocialIcon type={link.icon} className="w-full h-full" />
                        </div>
                        <div className="min-w-0 flex flex-col">
                          <span className="font-semibold text-xs text-white truncate max-w-[170px]">
                            {link.title}
                          </span>
                          {link.subtitle ? (
                            <span className="text-[10px] text-white/60 truncate max-w-[170px]">
                              {link.subtitle}
                            </span>
                          ) : (
                            <span className="text-[10px] text-white/40 truncate max-w-[170px]">
                              {link.url.replace(/^https?:\/\//, "")}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
                    </div>
                  ))
                ) : (
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center text-[10px] text-white/40">
                    No links added yet.
                  </div>
                )}
              </div>

              {bottomSocialLinks.length > 0 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  {bottomSocialLinks.map((sLink, sIdx) => (
                    <div
                      key={sLink._id || sIdx}
                      className="w-8 h-8 rounded-lg bg-[#0f284b] border border-white/10 flex items-center justify-center shadow-sm p-2"
                    >
                      <SocialIcon type={sLink.icon} className="w-full h-full" />
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={handleDownloadVCard}
                className="w-full mt-4 py-2 px-3 rounded-xl text-xs font-semibold text-white bg-[#0071E3] hover:bg-[#0077ED] flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Save Contact to Phone
              </button>

              <div className="mt-5 pt-3 border-t border-white/10 w-full text-center text-[9px] text-white/40">
                Powered by <span className="text-white/70 font-semibold underline">weblix-jo</span>
              </div>
            </div>
          )}

          {/* iPhone Home Indicator bar */}
          <div className="w-24 h-1 bg-white/30 rounded-full mx-auto my-2 shrink-0" />
        </div>
      </div>
    </div>
  );
}
