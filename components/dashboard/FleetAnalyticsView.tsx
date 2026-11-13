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
      <div className="rounded-2xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <button
                onClick={onBackToRegistry}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>50 Cards Registry</span>
              </button>

              <span className="text-slate-300">•</span>

              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-sky-50 border border-sky-200 text-sky-800">
                {selectedCard ? `Slot #${selectedCard.cardNumber}` : "Fleet Intelligence"}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight pt-1">
              {selectedCard
                ? `Card #${selectedCard.cardNumber} Engagement & Clicks`
                : "Fleet Clicks & Engagement Intelligence"}
            </h1>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
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
                className="appearance-none px-4 py-2.5 pr-9 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-sky-500 transition-all cursor-pointer shadow-xs"
              >
                <option value="all">
                  All 50 Cards (Fleet Aggregate)
                </option>
                {cards.map((c) => {
                  const padded = c.cardNumber < 10 ? `0${c.cardNumber}` : `${c.cardNumber}`;
                  return (
                    <option
                      key={c._id}
                      value={c._id}
                    >
                      Card #{padded} — {c.name}
                    </option>
                  );
                })}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                ▼
              </div>
            </div>

            {selectedCard && (
              <button
                onClick={() => onEditCard(selectedCard)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5 text-sky-400" />
                <span>Edit Links</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Highlight Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Verified Scans */}
        <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              VERIFIED NFC SCANS
            </span>
            <Eye className="w-4 h-4 text-sky-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats.totalTaps.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-medium">Physical Taps</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Bot-filtered hardware tap telemetry
          </p>
        </div>

        {/* Metric 2: Total Action Clicks */}
        <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              TOTAL ICON CLICKS
            </span>
            <MousePointerClick className="w-4 h-4 text-[#0071E3]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#0071E3] tracking-tight">
              {stats.totalClicks.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-medium">Actions Taken</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            WhatsApp, Call, Web & Social clicks
          </p>
        </div>

        {/* Metric 3: Tap-Through Rate */}
        <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              INTERACTION RATE (CTR)
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats.ctr}%
            </span>
            <span className="text-xs text-emerald-600 font-semibold">Conversion</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Percentage of scans that triggered action
          </p>
        </div>

        {/* Metric 4: Top Performing Channel */}
        <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              TOP PERFORMING CHANNEL
            </span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight truncate">
              {stats.topChannel?.name || "None yet"}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {stats.topChannel
              ? `${stats.topChannel.clicks} clicks (${stats.topChannel.percentage}% of all actions)`
              : "Awaiting first card interaction"}
          </p>
        </div>
      </div>

      {/* Main Visual Intelligence Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Channel Click Distribution Chart */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200/80 p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Channel Engagement Distribution
                </h3>
                <p className="text-[11px] text-slate-500">
                  Proportional click volume across all direct contact methods
                </p>
              </div>
            </div>

            <span className="text-[11px] font-mono text-slate-500">
              {stats.totalClicks} Total Actions
            </span>
          </div>

          {/* Visual Channel Progress Bars */}
          {stats.channels.length > 0 ? (
            <div className="space-y-3.5">
              {stats.channels.map((channel) => {
                const isTop = channel === stats.topChannel && channel.clicks > 0;
                return (
                  <div
                    key={channel.key}
                    className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 hover:border-slate-300 transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-2 shadow-xs">
                          <SocialIcon type={channel.icon} className="w-full h-full" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-900">
                              {channel.name}
                            </span>
                            {isTop && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 border border-amber-200 text-amber-700">
                                Top Channel
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500">
                            {channel.targetCount > 0
                              ? `Active on ${channel.targetCount} cards`
                              : "Direct Interaction"}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-bold text-slate-900 font-mono">
                          {channel.clicks}
                        </span>
                        <span className="text-[10px] text-slate-500 ml-1.5 font-medium">
                          ({channel.percentage}%)
                        </span>
                      </div>
                    </div>

                    {/* Proportional Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-200/80 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isTop
                            ? "bg-[#0071E3]"
                            : "bg-slate-400"
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
            <div className="py-12 text-center text-xs text-slate-500">
              No link clicks recorded yet. When a visitor taps any contact button on a card, click distributions appear here.
            </div>
          )}
        </div>

        {/* Right Column (1 span): Funnel & Scope Summary */}
        <div className="rounded-2xl bg-white border border-slate-200/80 p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-[#0071E3]">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Engagement Funnel
                </h3>
                <p className="text-[11px] text-slate-500">NFC Tap to Conversion Journey</p>
              </div>
            </div>

            {/* Funnel Steps */}
            <div className="space-y-2.5 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-sky-500" />
                  <span className="text-xs text-slate-700 font-medium">1. Physical NFC Tap</span>
                </div>
                <span className="text-xs font-bold text-slate-900 font-mono">
                  {stats.totalTaps} (100%)
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span className="text-xs text-slate-700 font-medium">2. Profile Impression</span>
                </div>
                <span className="text-xs font-bold text-slate-900 font-mono">
                  {stats.totalTaps} ({stats.totalTaps > 0 ? "100%" : "0%"})
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs text-slate-700 font-medium">3. Contact Action Click</span>
                </div>
                <span className="text-xs font-bold text-emerald-600 font-mono">
                  {stats.totalClicks} ({stats.ctr}%)
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-xs text-slate-700 font-medium">4. Contact Saved (vCard)</span>
                </div>
                <span className="text-xs font-bold text-amber-600 font-mono">
                  {stats.vcardClicks}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Context Card */}
          <div className="p-4 rounded-xl bg-sky-50 border border-sky-200/70 text-xs space-y-1">
            <span className="font-bold text-sky-900 block">Fleet Hardware Scope:</span>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              50 NFC smart business cards with customizable URLs. Each tap accurately triggers cloud-level analytics and link interaction tracking.
            </p>
          </div>
        </div>
      </div>

      {/* Detail Section: Individual Card Links OR Top Engaged Fleet Members */}
      {selectedCard ? (
        /* Detailed Breakdown of this Selected Card's specific links */
        <div className="rounded-2xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Card #{selectedCard.cardNumber} Links & Performance Matrix
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Exact click counts for each active button configured on this card.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200">
              {(selectedCard.links || []).length} Active Buttons
            </span>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Channel & Button Title</th>
                  <th className="py-3 px-4">Destination Target</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Total Clicks</th>
                  <th className="py-3 px-4 text-right">Click Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* Save Contact vCard Entry */}
                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700">
                        <Download className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900 block">Save Contact</span>
                        <span className="text-[10px] text-slate-500">Direct .vcf Download</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                    Phone Address Book Sync
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700">
                      Active
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-900 font-mono">
                    {selectedCard.vcardClicks || 0}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-600">
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
                    <tr key={link._id || idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-1.5 shadow-xs">
                            <SocialIcon type={link.icon} className="w-full h-full" />
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block">
                              {link.title}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {link.subtitle || link.icon}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px] truncate max-w-xs" title={link.url}>
                        {link.url}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            link.isActive
                              ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                              : "bg-slate-100 border border-slate-200 text-slate-500"
                          }`}
                        >
                          {link.isActive ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-900 font-mono">
                        {link.clicks || 0}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-600">
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
        <div className="rounded-2xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Top Engaged Cards in Fleet
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Highest interaction volume across the 50 registered NFC slots.
              </p>
            </div>
            <span className="text-xs text-slate-500">Slots 01 – 50</span>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4 w-16">Slot</th>
                  <th className="py-3 px-4">Cardholder / Assignment</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4 text-center">NFC Taps</th>
                  <th className="py-3 px-4 text-center">Action Clicks</th>
                  <th className="py-3 px-4 text-center">CTR %</th>
                  <th className="py-3 px-4 text-right">View Breakdown</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topEngagedCards.map((c, rank) => {
                  const padded = c.cardNumber < 10 ? `0${c.cardNumber}` : `${c.cardNumber}`;
                  return (
                    <tr
                      key={c._id}
                      onClick={() => onSelectCard(c._id)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-sky-800">
                        #{padded}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900 group-hover:text-sky-700 transition-colors">
                        {c.name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {c.department || "General"}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-slate-600">
                        {c.views.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-[#0071E3]">
                        {c.totalActionClicks}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-semibold text-emerald-600">
                        {c.ctr}%
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="text-xs font-semibold text-sky-700 group-hover:text-sky-800 underline underline-offset-2">
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
