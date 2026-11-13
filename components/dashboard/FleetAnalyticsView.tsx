"use client";

import React, { useMemo } from "react";
import {
  ArrowLeft,
  MousePointerClick,
  Eye,
  TrendingUp,
  Download,
  ExternalLink,
  Pencil,
  BarChart3,
  Layers,
  Sparkles,
  Smartphone,
  Share2,
} from "lucide-react";
import { CardListItem, AnalyticsSummary } from "@/actions/card-actions";
import { SocialIcon } from "@/components/icons/SocialIcons";

interface FleetAnalyticsViewProps {
  cards: CardListItem[];
  analytics: AnalyticsSummary;
  selectedCardId: string | null;
  onSelectCard: (id: string | null) => void;
  onBackToRegistry: () => void;
  onEditCard: (card: CardListItem) => void;
}

interface ChannelStat {
  key: string;
  name: string;
  icon: string;
  clicks: number;
  percentage: number;
  targetCount: number;
}

export default function FleetAnalyticsView({
  cards,
  analytics,
  selectedCardId,
  onSelectCard,
  onBackToRegistry,
  onEditCard,
}: FleetAnalyticsViewProps) {
  const selectedCard = useMemo(
    () => cards.find((c) => c._id === selectedCardId) || null,
    [cards, selectedCardId]
  );

  // Calculate Aggregates
  const stats = useMemo(() => {
    const targetCards = selectedCard ? [selectedCard] : cards;

    let totalTaps = 0;
    let totalClicks = 0;
    let vcardClicks = 0;

    const channelMap: Record<
      string,
      { name: string; icon: string; clicks: number; targetCount: number }
    > = {
      whatsapp: { name: "WhatsApp Chat", icon: "whatsapp", clicks: 0, targetCount: 0 },
      phone: { name: "Direct Call", icon: "phone", clicks: 0, targetCount: 0 },
      email: { name: "Email Inquiries", icon: "email", clicks: 0, targetCount: 0 },
      website: { name: "Official Website", icon: "website", clicks: 0, targetCount: 0 },
      vcard: { name: "Save Contact (vCard)", icon: "phone", clicks: 0, targetCount: 0 },
      maps: { name: "Office / Maps", icon: "maps", clicks: 0, targetCount: 0 },
      linkedin: { name: "LinkedIn", icon: "linkedin", clicks: 0, targetCount: 0 },
      instagram: { name: "Instagram", icon: "instagram", clicks: 0, targetCount: 0 },
      facebook: { name: "Facebook", icon: "facebook", clicks: 0, targetCount: 0 },
      twitter: { name: "Twitter / X", icon: "twitter", clicks: 0, targetCount: 0 },
    };

    targetCards.forEach((c) => {
      totalTaps += c.views || 0;
      const vClicks = c.vcardClicks || 0;
      vcardClicks += vClicks;
      totalClicks += vClicks;
      channelMap.vcard.clicks += vClicks;
      if (vClicks > 0) channelMap.vcard.targetCount++;

      (c.links || []).forEach((l) => {
        const clk = l.clicks || 0;
        totalClicks += clk;
        const iconType = l.icon || "website";
        if (!channelMap[iconType]) {
          channelMap[iconType] = {
            name: l.title || iconType,
            icon: iconType,
            clicks: 0,
            targetCount: 0,
          };
        }
        channelMap[iconType].clicks += clk;
        channelMap[iconType].targetCount++;
      });
    });

    const channels: ChannelStat[] = Object.entries(channelMap)
      .map(([key, item]) => ({
        key,
        name: item.name,
        icon: item.icon,
        clicks: item.clicks,
        targetCount: item.targetCount,
        percentage: totalClicks > 0 ? Math.round((item.clicks / totalClicks) * 100) : 0,
      }))
      .filter((ch) => ch.clicks > 0 || (selectedCard && ch.targetCount > 0))
      .sort((a, b) => b.clicks - a.clicks);

    const ctr = totalTaps > 0 ? Math.round((totalClicks / totalTaps) * 100) : 0;
    const topChannel = channels[0] || null;

    return {
      totalTaps,
      totalClicks,
      vcardClicks,
      ctr,
      channels,
      topChannel,
    };
  }, [cards, selectedCard]);

  // Top 5 Engaged Cards across the fleet
  const topEngagedCards = useMemo(() => {
    return [...cards]
      .map((c) => {
        const linkClicks = (c.links || []).reduce((acc, l) => acc + (l.clicks || 0), 0);
        const allClicks = linkClicks + (c.vcardClicks || 0);
        const cardCtr = c.views > 0 ? Math.round((allClicks / c.views) * 100) : 0;
        return {
          ...c,
          totalActionClicks: allClicks,
          ctr: cardCtr,
        };
      })
      .sort((a, b) => b.totalActionClicks - a.totalActionClicks)
      .slice(0, 5);
  }, [cards]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Navigation Bar */}
      <div className="relative overflow-hidden rounded-3xl bg-white/[0.04] border border-white/[0.10] p-6 sm:p-8 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.37)]">
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/30 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <button
                onClick={onBackToRegistry}
                className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-md active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>50 Cards Registry</span>
              </button>

              <span className="text-white/20">•</span>

              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-sky-500/15 border border-sky-400/25 text-sky-300">
                {selectedCard ? `Slot #${selectedCard.cardNumber}` : "Fleet Intelligence"}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight pt-1">
              {selectedCard
                ? `Card #${selectedCard.cardNumber} Engagement & Clicks`
                : "Fleet Clicks & Engagement Intelligence"}
            </h1>
            <p className="text-xs text-slate-300/80 max-w-2xl leading-relaxed">
              {selectedCard
                ? `Detailed link interaction telemetry and action breakdown for ${selectedCard.name} (${selectedCard.jobTitle || "Executive"}).`
                : "Aggregated link interaction metrics, channel share, and real-time NFC conversion rates across all 50 slots."}
            </p>
          </div>

          {/* Card Scope Selector Filter */}
          <div className="flex items-center gap-3 self-start lg:self-auto">
            <div className="relative">
              <select
                value={selectedCardId || "all"}
                onChange={(e) =>
                  onSelectCard(e.target.value === "all" ? null : e.target.value)
                }
                className="appearance-none px-4 py-2.5 pr-9 bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.14] rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-sky-400 transition-all cursor-pointer backdrop-blur-md"
              >
                <option value="all" className="bg-[#041226] text-white">
                  All 50 Cards (Fleet Aggregate)
                </option>
                {cards.map((c) => {
                  const padded = c.cardNumber < 10 ? `0${c.cardNumber}` : `${c.cardNumber}`;
                  return (
                    <option
                      key={c._id}
                      value={c._id}
                      className="bg-[#041226] text-white"
                    >
                      Card #{padded} — {c.name}
                    </option>
                  );
                })}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/50 text-xs">
                ▼
              </div>
            </div>

            {selectedCard && (
              <button
                onClick={() => onEditCard(selectedCard)}
                className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#0062E0] to-[#0084FF] hover:brightness-110 active:scale-95 text-white text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_16px_rgba(0,119,242,0.4)] border border-sky-300/30 transition-all cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Links</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Highlight Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Verified Scans */}
        <div className="relative overflow-hidden rounded-2xl bg-white/[0.04] border border-white/[0.10] p-5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-wider text-slate-300 uppercase">
              VERIFIED NFC SCANS
            </span>
            <Eye className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {stats.totalTaps.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-medium">Physical Taps</span>
          </div>
          <p className="text-[11px] text-slate-400/80 mt-1">
            Bot-filtered hardware tap telemetry
          </p>
        </div>

        {/* Metric 2: Total Action Clicks */}
        <div className="relative overflow-hidden rounded-2xl bg-white/[0.04] border border-white/[0.10] p-5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-wider text-slate-300 uppercase">
              TOTAL ICON CLICKS
            </span>
            <MousePointerClick className="w-4 h-4 text-[#38bdf8]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#38bdf8] tracking-tight">
              {stats.totalClicks.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-medium">Actions Taken</span>
          </div>
          <p className="text-[11px] text-slate-400/80 mt-1">
            WhatsApp, Call, Web & Social clicks
          </p>
        </div>

        {/* Metric 3: Tap-Through Rate */}
        <div className="relative overflow-hidden rounded-2xl bg-white/[0.04] border border-white/[0.10] p-5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-wider text-slate-300 uppercase">
              INTERACTION RATE (CTR)
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {stats.ctr}%
            </span>
            <span className="text-xs text-emerald-400 font-semibold">Conversion</span>
          </div>
          <p className="text-[11px] text-slate-400/80 mt-1">
            Percentage of scans that triggered action
          </p>
        </div>

        {/* Metric 4: Top Performing Channel */}
        <div className="relative overflow-hidden rounded-2xl bg-white/[0.04] border border-white/[0.10] p-5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-wider text-slate-300 uppercase">
              TOP PERFORMING CHANNEL
            </span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight truncate">
              {stats.topChannel?.name || "None yet"}
            </span>
          </div>
          <p className="text-[11px] text-slate-400/80 mt-1">
            {stats.topChannel
              ? `${stats.topChannel.clicks} clicks (${stats.topChannel.percentage}% of all actions)`
              : "Awaiting first card interaction"}
          </p>
        </div>
      </div>

      {/* Main Visual Intelligence Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Channel Click Distribution Chart */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-white/[0.04] border border-white/[0.10] p-6 sm:p-7 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.37)] space-y-6">
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-sky-400">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Channel Engagement Distribution
                </h3>
                <p className="text-[11px] text-slate-400">
                  Proportional click volume across all direct contact methods
                </p>
              </div>
            </div>

            <span className="text-[11px] font-mono text-slate-400">
              {stats.totalClicks} Total Actions
            </span>
          </div>

          {/* Visual Channel Progress Bars */}
          {stats.channels.length > 0 ? (
            <div className="space-y-4">
              {stats.channels.map((channel) => {
                const isTop = channel === stats.topChannel && channel.clicks > 0;
                return (
                  <div
                    key={channel.key}
                    className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.14] transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.12] flex items-center justify-center p-2">
                          <SocialIcon type={channel.icon} className="w-full h-full" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white">
                              {channel.name}
                            </span>
                            {isTop && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/15 border border-amber-400/25 text-amber-300">
                                Top Channel
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {channel.targetCount > 0
                              ? `Active on ${channel.targetCount} cards`
                              : "Direct Interaction"}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-bold text-white font-mono">
                          {channel.clicks}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1.5 font-medium">
                          ({channel.percentage}%)
                        </span>
                      </div>
                    </div>

                    {/* Proportional Bar */}
                    <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isTop
                            ? "bg-gradient-to-r from-sky-500 to-[#38bdf8]"
                            : "bg-gradient-to-r from-slate-600 to-slate-400"
                        }`}
                        style={{
                          width: `${Math.max(channel.percentage, channel.clicks > 0 ? 3 : 0)}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              No link clicks recorded yet. When a visitor taps any contact button on a card, click distributions appear here.
            </div>
          )}
        </div>

        {/* Right Column (1 span): Funnel & Scope Summary */}
        <div className="relative overflow-hidden rounded-3xl bg-white/[0.04] border border-white/[0.10] p-6 sm:p-7 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.37)] flex flex-col justify-between space-y-6">
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-4 border-b border-white/[0.08]">
              <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-[#38bdf8]">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Engagement Funnel
                </h3>
                <p className="text-[11px] text-slate-400">NFC Tap to Conversion Journey</p>
              </div>
            </div>

            {/* Funnel Steps */}
            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-sky-400" />
                  <span className="text-xs text-slate-200 font-medium">1. Physical NFC Tap</span>
                </div>
                <span className="text-xs font-bold text-white font-mono">
                  {stats.totalTaps} (100%)
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span className="text-xs text-slate-200 font-medium">2. Profile Impression</span>
                </div>
                <span className="text-xs font-bold text-white font-mono">
                  {stats.totalTaps} ({stats.totalTaps > 0 ? "100%" : "0%"})
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs text-slate-200 font-medium">3. Contact Action Click</span>
                </div>
                <span className="text-xs font-bold text-emerald-400 font-mono">
                  {stats.totalClicks} ({stats.ctr}%)
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-xs text-slate-200 font-medium">4. Contact Saved (vCard)</span>
                </div>
                <span className="text-xs font-bold text-amber-300 font-mono">
                  {stats.vcardClicks}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Context Card */}
          <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-400/20 text-xs space-y-1">
            <span className="font-bold text-sky-300 block">Fleet Hardware Scope:</span>
            <p className="text-[11px] text-slate-300/80 leading-relaxed">
              50 NFC smart business cards with permanent hardware URLs. Each tap accurately triggers cloud-level analytics and link interaction tracking.
            </p>
          </div>
        </div>
      </div>

      {/* Detail Section: Individual Card Links OR Top Engaged Fleet Members */}
      {selectedCard ? (
        /* Detailed Breakdown of this Selected Card's specific links */
        <div className="relative overflow-hidden rounded-3xl bg-white/[0.04] border border-white/[0.10] p-6 sm:p-8 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.37)] space-y-5">
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Card #{selectedCard.cardNumber} Links & Performance Matrix
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Exact click counts for each active button configured on this card.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-300 bg-white/[0.06] px-3 py-1 rounded-xl border border-white/10">
              {(selectedCard.links || []).length} Active Buttons
            </span>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Channel & Button Title</th>
                  <th className="py-3 px-4">Destination Target</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Total Clicks</th>
                  <th className="py-3 px-4 text-right">Click Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {/* Save Contact vCard Entry */}
                <tr className="hover:bg-white/[0.03] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-sky-400">
                        <Download className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-semibold text-white block">Save Contact</span>
                        <span className="text-[10px] text-slate-400">Direct .vcf Download</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">
                    Phone Address Book Sync
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 border border-emerald-400/25 text-emerald-300">
                      Active
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-white font-mono">
                    {selectedCard.vcardClicks || 0}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                    {stats.totalClicks > 0
                      ? `${Math.round(((selectedCard.vcardClicks || 0) / stats.totalClicks) * 100)}%`
                      : "0%"}
                  </td>
                </tr>

                {/* Individual Configured Links */}
                {(selectedCard.links || []).map((link, idx) => {
                  const share =
                    stats.totalClicks > 0
                      ? Math.round(((link.clicks || 0) / stats.totalClicks) * 100)
                      : 0;
                  return (
                    <tr key={link._id || idx} className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center p-1.5">
                            <SocialIcon type={link.icon} className="w-full h-full" />
                          </div>
                          <div>
                            <span className="font-semibold text-white block">
                              {link.title}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {link.subtitle || link.icon}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px] truncate max-w-xs" title={link.url}>
                        {link.url}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            link.isActive
                              ? "bg-emerald-500/15 border border-emerald-400/25 text-emerald-300"
                              : "bg-slate-500/15 border border-slate-400/25 text-slate-400"
                          }`}
                        >
                          {link.isActive ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-white font-mono">
                        {link.clicks || 0}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                        {share}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Top 5 Most Engaged Cards in the Fleet */
        <div className="relative overflow-hidden rounded-3xl bg-white/[0.04] border border-white/[0.10] p-6 sm:p-8 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.37)] space-y-5">
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Top Engaged Cards in Fleet
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Highest interaction volume across the 50 registered NFC slots.
              </p>
            </div>
            <span className="text-xs text-slate-400">Slots 01 – 50</span>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4 w-16">Slot</th>
                  <th className="py-3 px-4">Cardholder / Assignment</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4 text-center">NFC Taps</th>
                  <th className="py-3 px-4 text-center">Action Clicks</th>
                  <th className="py-3 px-4 text-center">CTR %</th>
                  <th className="py-3 px-4 text-right">View Breakdown</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {topEngagedCards.map((c, rank) => {
                  const padded = c.cardNumber < 10 ? `0${c.cardNumber}` : `${c.cardNumber}`;
                  return (
                    <tr
                      key={c._id}
                      onClick={() => onSelectCard(c._id)}
                      className="hover:bg-white/[0.04] transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-sky-300">
                        #{padded}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white group-hover:text-sky-300 transition-colors">
                        {c.name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {c.department || "General"}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-slate-300">
                        {c.views.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-[#38bdf8]">
                        {c.totalActionClicks}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-semibold text-emerald-400">
                        {c.ctr}%
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="text-xs font-semibold text-sky-400 group-hover:text-sky-300 underline underline-offset-2">
                          Inspect Analytics →
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
