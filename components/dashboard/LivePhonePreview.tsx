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
    <div className="flex flex-col items-center select-none sticky top-8 w-full max-w-[360px] mx-auto">
      {/* Top Segmented Control Switcher */}
      <div className="w-full flex items-center justify-between mb-3 px-1">
        <div className="bg-[#EAEAEA] p-1 rounded-2xl flex items-center gap-1 border border-black/5 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "preview"
                ? "bg-white text-[#1D1D1F] shadow-xs"
                : "text-[#64748B] hover:text-[#1D1D1F]"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile View</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("analytics")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "analytics"
                ? "bg-white text-[#0071E3] shadow-xs"
                : "text-[#64748B] hover:text-[#1D1D1F]"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Icon Clicks</span>
            {totalIconClicks > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-[#0071E3]/10 text-[#0071E3] font-mono">
                {totalIconClicks}
              </span>
            )}
          </button>
        </div>

        <button
          onClick={handleCopy}
          className="text-xs text-[#0071E3] hover:underline flex items-center gap-1 font-semibold cursor-pointer shrink-0"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#34C759]" /> Copied
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" /> /{card.slug || slotPadded}
            </>
          )}
        </button>
      </div>

      {/* TAB 1: REALISTIC IPHONE MOBILE VIEW */}
      {activeTab === "preview" && (
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
              {/* Authentic Feather Texture Background */}
              <div
                className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity pointer-events-none"
                style={{ backgroundImage: `url('/branding/card-bg-feathers.jpg')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#020b18]/85 via-[#03132b]/90 to-[#020b18] pointer-events-none" />

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
                  <div className="w-16 h-16 rounded-3xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-sky-400 mb-4 shadow-lg">
                    <Globe className="w-8 h-8 animate-pulse" />
                  </div>

                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-500/20 border border-blue-500/30 text-sky-300 mb-3">
                    Card #{slotPadded} • Custom Web Link
                  </span>

                  <h3 className="text-lg font-bold text-white tracking-tight mb-1">
                    {card.name || "Custom Web Link"}
                  </h3>
                  <p className="text-xs text-white/60 mb-6">
                    Tapping this physical card instantly opens:
                  </p>

                  <div className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md mb-6 max-w-[260px]">
                    <span className="text-[10px] font-medium text-white/40 block mb-1">
                      ASSIGNED URL
                    </span>
                    <p className="text-xs font-bold text-sky-300 truncate" title={card.redirectUrl}>
                      {card.redirectUrl || "https://reachworld.com"}
                    </p>
                  </div>

                  <a
                    href={card.redirectUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
                  >
                    <span>Open Web Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              ) : (
                /* Digital Bio Profile View */
                <div className="relative z-10 flex-1 overflow-y-auto px-5 py-2 flex flex-col items-center text-center no-scrollbar">
                  <div className="p-1.5 rounded-xl bg-white/5 border border-white/10 my-2 shadow-md">
                    <img
                      src="/branding/reach-world-white.jpg"
                      alt="Reach World"
                      className="h-7 w-auto object-contain brightness-110"
                    />
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 border border-blue-500/30 text-sky-300 mt-1">
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
                            <div className="min-w-0 flex flex-col text-left">
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
          {!isCustomLink && (
            <div className="mt-4 w-[340px] bg-white rounded-2xl p-3 border border-black/[0.06] shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#34C759]" />
                <span className="text-xs font-semibold text-[#1D1D1F]">
                  {cardViews} Scans • {totalIconClicks} Clicks
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("analytics")}
                className="text-[11px] font-bold text-[#0071E3] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View Breakdown</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DEDICATED ICON & LINK CLICK TELEMETRY (CLEAN & NON-CLUTTERED) */}
      {activeTab === "analytics" && (
        <div className="w-[340px] bg-white rounded-3xl p-6 border border-black/[0.06] shadow-sm animate-in fade-in duration-200 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between pb-3 border-b border-black/[0.05]">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#0a192f] text-white font-mono font-bold text-[10px] mb-1.5">
                <span>Card #{slotPadded}</span>
              </div>
              <h3 className="text-sm font-bold text-[#1D1D1F] tracking-tight truncate max-w-[200px]">
                {card.name}
              </h3>
              <p className="text-[11px] text-[#86868B]">
                {isCustomLink ? "Custom Destination Link" : "Profile Link Engagement"}
              </p>
            </div>

            <div className="text-right">
              <span className="text-xl font-extrabold text-[#0071E3] font-mono block">
                {isCustomLink ? cardViews : totalIconClicks}
              </span>
              <span className="text-[10px] text-[#86868B] font-medium uppercase tracking-wider">
                Total Clicks
              </span>
            </div>
          </div>

          {/* If Custom Web Link Mode */}
          {isCustomLink ? (
            <div className="space-y-4 py-2 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center mx-auto">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1D1D1F]">
                  100% Direct Forwarding
                </h4>
                <p className="text-[11px] text-[#86868B] mt-1 leading-relaxed">
                  All {cardViews} physical taps immediately opened this card&apos;s assigned web link:
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#F5F5F7] border border-black/5 text-left">
                <span className="text-[10px] text-[#86868B] block font-mono">TARGET URL</span>
                <p className="text-xs font-bold text-[#0071E3] font-mono truncate" title={card.redirectUrl}>
                  {card.redirectUrl || "https://reachworld.com"}
                </p>
              </div>

              <a
                href={card.redirectUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-white bg-[#0071E3] hover:bg-[#0077ED] flex items-center justify-center gap-1.5"
              >
                <span>Test Link Live</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ) : (
            /* Digital Bio Profile: Detailed Icon & Action Breakdown */
            <div className="space-y-4">
              {/* Top Summary KPI Mini Cards */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-black/[0.04]">
                  <span className="text-[10px] text-[#64748B] font-medium block">
                    Card Scans (Visits)
                  </span>
                  <span className="text-base font-bold text-[#0F172A] font-mono mt-0.5 block">
                    {cardViews}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-black/[0.04]">
                  <span className="text-[10px] text-[#64748B] font-medium block">
                    Interaction Rate
                  </span>
                  <span className="text-base font-bold text-[#34C759] font-mono mt-0.5 block">
                    {engagementRate}%
                  </span>
                </div>
              </div>

              {/* Breakdown Title */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider flex items-center gap-1.5">
                  <MousePointerClick className="w-3.5 h-3.5 text-[#0071E3]" />
                  <span>Clicks Per Channel</span>
                </span>
                {topItemTitle && topClickCount > 0 && (
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    ⭐ Top: {topItemTitle}
                  </span>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-2.5">
                {/* 1. All Registered Contact Links */}
                {allActiveLinks.map((link, idx) => {
                  const clicks = link.clicks || 0;
                  const percentage =
                    totalIconClicks > 0
                      ? Math.round((clicks / totalIconClicks) * 100)
                      : 0;

                  return (
                    <div
                      key={link._id || idx}
                      className="p-3 rounded-2xl bg-[#FBFBFD] border border-black/[0.04] space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-[#0a192f] text-white flex items-center justify-center p-1.5 shrink-0 shadow-xs">
                            <SocialIcon type={link.icon} className="w-full h-full" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-[#1D1D1F] block truncate">
                              {link.title}
                            </span>
                            <span className="text-[10px] text-[#86868B] truncate block font-mono">
                              {link.subtitle || link.url.replace(/^https?:\/\//, "")}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold text-[#1D1D1F] font-mono block">
                            {clicks} <span className="text-[10px] font-normal text-[#86868B]">clicks</span>
                          </span>
                          <span className="text-[10px] text-[#0071E3] font-semibold font-mono">
                            {percentage}%
                          </span>
                        </div>
                      </div>

                      {/* Visual progress bar */}
                      <div className="w-full h-1.5 bg-black/[0.04] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#0071E3] rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}

                {/* 2. Save Contact (vCard) Action */}
                {(() => {
                  const percentage =
                    totalIconClicks > 0
                      ? Math.round((vcardClicksCount / totalIconClicks) * 100)
                      : 0;

                  return (
                    <div className="p-3 rounded-2xl bg-[#FBFBFD] border border-black/[0.04] space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-[#0071E3] text-white flex items-center justify-center p-1.5 shrink-0 shadow-xs">
                            <Download className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-[#1D1D1F] block truncate">
                              Save Contact to Phone
                            </span>
                            <span className="text-[10px] text-[#86868B] truncate block font-mono">
                              Direct Address Book VCF Download
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold text-[#1D1D1F] font-mono block">
                            {vcardClicksCount} <span className="text-[10px] font-normal text-[#86868B]">saved</span>
                          </span>
                          <span className="text-[10px] text-[#0071E3] font-semibold font-mono">
                            {percentage}%
                          </span>
                        </div>
                      </div>

                      <div className="w-full h-1.5 bg-black/[0.04] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Informative Note */}
              <div className="pt-2 text-center">
                <p className="text-[10px] text-[#86868B] leading-relaxed">
                  Every click on WhatsApp, Call, Email, Socials, or Contact Download is tracked in real-time.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
