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
  BarChart3,
  Smartphone,
  MousePointerClick,
  Sparkles,
  TrendingUp,
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
  views?: number;
  vcardClicks?: number;
  links?: {
    _id?: string;
    title: string;
    subtitle?: string;
    url: string;
    icon: LinkIconType;
    isActive: boolean;
    clicks?: number;
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
  const [activeTab, setActiveTab] = useState<"preview" | "analytics">("preview");

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

  // Telemetry Calculations
  const linkClicksSum = (card.links || []).reduce(
    (acc, l) => acc + (l.clicks || 0),
    0
  );
  const vcardClicksCount = card.vcardClicks || 0;
  const totalIconClicks = linkClicksSum + vcardClicksCount;
  const cardViews = card.views || 0;
  const engagementRate =
    cardViews > 0 ? Math.min(100, Math.round((totalIconClicks / cardViews) * 100)) : 0;

  // Find top clicked item
  let topClickCount = 0;
  let topItemTitle = "";

  allActiveLinks.forEach((l) => {
    if ((l.clicks || 0) > topClickCount) {
      topClickCount = l.clicks || 0;
      topItemTitle = l.title;
    }
  });

  if (vcardClicksCount > topClickCount) {
    topClickCount = vcardClicksCount;
    topItemTitle = "Save Contact (vCard)";
  }

  return (
    <div className="flex flex-col items-center select-none sticky top-8 w-full max-w-[360px] mx-auto text-white">
      {/* Top Header Bar */}
      <div className="w-full flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/15 border border-sky-400/25 text-sky-300">
            Card #{slotPadded}
          </span>
          <span className="text-xs font-semibold text-slate-300 truncate max-w-[150px]">
            {card.name || "Preview"}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="text-xs text-sky-400 hover:text-white px-3 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 flex items-center gap-1 font-semibold cursor-pointer transition-all active:scale-95 shrink-0"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-white" /> Copied
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" /> /{card.slug || slotPadded}
            </>
          )}
        </button>
      </div>

      {/* REALISTIC IPHONE MOBILE VIEW */}
      <div className="flex flex-col items-center w-full animate-in fade-in duration-200">
          <div className="relative w-[340px] h-[670px] bg-black rounded-[54px] p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] ring-1 ring-black/20 border-4 border-[#2A2B2E]">
            {/* Dynamic Island Pill */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-40 flex items-center justify-between px-2.5">
              <div className="w-2 h-2 rounded-full bg-[#1A1A1A]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#0b2447] border border-[#1d1d1f]" />
            </div>

            {/* Screen Frame */}
            <div
              className="relative w-full h-full rounded-[44px] overflow-hidden flex flex-col text-white bg-[#020b18]"
            >
              {/* Background Feather Image */}
              <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <picture className="w-full h-full">
                  <source srcSet="/card-bg.webp" type="image/webp" />
                  <img
                    src="/card-bg.jpg"
                    alt="Background"
                    className="w-full h-full object-cover object-center"
                  />
                </picture>
                <div className="absolute inset-0 bg-gradient-to-b from-[#020b18]/60 via-black/25 to-[#020b18]/80" />
              </div>

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

              {/* CARD CONTENT */}
              {isCustomLink ? (
                /* Custom Web Link View */
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
                  <div className="w-16 h-16 rounded-3xl bg-[#0071E3]/20 border border-[#0071E3]/40 flex items-center justify-center text-[#38bdf8] mb-4 shadow-lg">
                    <Globe className="w-8 h-8 animate-pulse" />
                  </div>

                  <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-[#0071E3]/20 border border-[#0071E3]/30 text-[#38bdf8] mb-3">
                    Card #{slotPadded} • Custom Web Link
                  </span>

                  <h3 className="text-lg font-bold text-white tracking-tight mb-1">
                    {card.name || "Custom Web Link"}
                  </h3>
                  <p className="text-xs text-white/60 mb-6">
                    Tapping this physical card instantly opens:
                  </p>

                  <div className="w-full p-4 rounded-2xl bg-[#07172e]/80 border border-white/10 backdrop-blur-md mb-6 max-w-[260px]">
                    <span className="text-[10px] font-mono font-medium text-white/40 block mb-1">
                      ASSIGNED URL
                    </span>
                    <p className="text-xs font-mono font-bold text-[#38bdf8] truncate" title={card.redirectUrl}>
                      {card.redirectUrl || "https://reachworld.com"}
                    </p>
                  </div>

                  <a
                    href={card.redirectUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-xl text-xs font-semibold text-white bg-[#0071E3] hover:bg-[#0077ED] flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
                  >
                    <span>Open Web Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              ) : (
                /* Digital Bio Profile View */
                <div className="relative z-10 flex-1 overflow-y-auto px-5 py-2 flex flex-col items-center text-center no-scrollbar">
                  <ReachWorldLogo className="w-36 my-2 drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]" />

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#0071E3]/20 border border-[#0071E3]/30 text-[#38bdf8] mt-1">
                    Card #{slotPadded}
                  </span>

                  <h3 className="text-base font-bold text-white tracking-tight text-center mt-2 leading-tight">
                    {card.name || "Mohammad Alseidi"}
                  </h3>

                  <p className="text-[10px] font-bold tracking-[0.2em] text-[#38bdf8] uppercase text-center mt-1">
                    {card.jobTitle || "REACH WORLD"}
                  </p>

                  {/* Contact Action List - Glassmorphic Style */}
                  <div className="w-full space-y-2 mt-4">
                    {mainListLinks.length > 0 ? (
                      mainListLinks.map((link, idx) => (
                        <div
                          key={link._id || idx}
                          className="relative overflow-hidden w-full flex items-center justify-between p-2.5 rounded-xl bg-white/[0.05] border border-white/[0.12] shadow-sm backdrop-blur-md"
                        >
                          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-white/12 to-white/[0.03] border border-white/20 flex items-center justify-center flex-shrink-0 shadow-inner p-1.5">
                              <SocialIcon type={link.icon} className="w-full h-full" />
                            </div>
                            <div className="min-w-0 flex flex-col text-left">
                              <span className="font-semibold text-xs text-white truncate max-w-[170px]">
                                {link.title}
                              </span>
                              {link.subtitle ? (
                                <span className="text-[10px] text-slate-300/75 truncate max-w-[170px]">
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
                          className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.12] flex items-center justify-center shadow-sm p-1.5 backdrop-blur-md"
                        >
                          <SocialIcon type={sLink.icon} className="w-full h-full" />
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={handleDownloadVCard}
                    className="w-full mt-4 py-2 px-3 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#0062E0] via-[#0077F2] to-[#0091FF] flex items-center justify-center gap-1.5 shadow-[0_0_16px_rgba(0,119,242,0.4)] border border-sky-300/30 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Save Contact to Phone
                  </button>

                  <div className="mt-5 pt-3 border-t border-white/10 w-full text-center text-[10px] text-white/40">
                    powered by{" "}
                    <a
                      href="https://weblix-jo.com/en"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/70 hover:text-[#38bdf8] font-semibold underline decoration-white/30 transition-colors"
                    >
                      weblix-jo
                    </a>
                  </div>
                </div>
              )}

              {/* iPhone Home Indicator bar */}
              <div className="w-24 h-1 bg-white/30 rounded-full mx-auto my-2 shrink-0" />
            </div>
          </div>

          {/* Compact Telemetry Footer Pill */}
          <div className="mt-4 w-[340px] bg-white/[0.04] rounded-2xl p-3 border border-white/[0.10] shadow-sm flex items-center justify-between text-xs backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-300" />
              <span className="font-semibold text-slate-200">
                {cardViews} Scans • {totalIconClicks} Clicks
              </span>
            </div>
            <span className="text-[11px] text-sky-400 font-mono font-bold">
              Slot #{slotPadded}
            </span>
          </div>
        </div>
      </div>
  );
}
