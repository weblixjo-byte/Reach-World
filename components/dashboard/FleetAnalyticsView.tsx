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
  Trophy,
  Smartphone,
  X,
  CreditCard,
} from "lucide-react";
import { CardListItem, AnalyticsSummary } from "@/actions/card-actions";
import { SocialIcon } from "@/components/icons/SocialIcons";
import ModernDropdown from "@/components/dashboard/ModernDropdown";

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

  const cardDropdownOptions = useMemo(() => {
    return [
      { value: "all", label: "All 50 Cards (Fleet Aggregate)" },
      ...cards.map((c) => {
        const padded = c.cardNumber < 10 ? `0${c.cardNumber}` : `${c.cardNumber}`;
        return {
          value: c._id,
          label: `Card #${padded} — ${c.name}`,
          badge: `${c.views} taps`,
        };
      }),
    ];
  }, [cards]);

  return (
    <div className="space-y-6 animate-in fade-in duration-150 font-sans">
      {/* Top Header & Navigation Bar */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <button
                onClick={onBackToRegistry}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-[#0F172A] flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#0A192F]" />
                <span>Back to 50 Cards Registry</span>
              </button>

              <span className="text-slate-300">•</span>

              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 border border-slate-200 text-[#0F172A]">
                {selectedCard ? `Slot #${selectedCard.cardNumber}` : "Fleet Aggregate"}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight pt-1">
              {selectedCard
                ? `Analytics: ${selectedCard.name}`
                : "Fleet Clicks & Engagement Intelligence"}
            </h1>
          </div>

          {/* Modern Card Scope Selector Filter */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
            <ModernDropdown
              value={selectedCardId || "all"}
              onChange={(val) => onSelectCard(val === "all" ? null : val)}
              options={cardDropdownOptions}
              searchable
              className="min-w-[260px]"
            />

            {selectedCard && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onSelectCard(null)}
                  className="h-9 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1 transition-all cursor-pointer"
                  title="Clear card filter"
                >
                  <X className="w-3.5 h-3.5 text-slate-500" />
                  <span>Show All</span>
                </button>

                <button
                  onClick={() => onEditCard(selectedCard)}
                  className="h-9 px-3.5 rounded-xl bg-[#0A192F] hover:bg-[#071324] text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <Pencil className="w-3 h-3 text-slate-300" />
                  <span>Edit Card</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Selected Card Focus Ribbon */}
        {selectedCard && (
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[#0F172A]">
                Slot #{selectedCard.cardNumber < 10 ? `0${selectedCard.cardNumber}` : selectedCard.cardNumber}
              </span>
              <span className="font-semibold text-slate-800">
                {selectedCard.name}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500">
                {selectedCard.jobTitle || "Executive"} {selectedCard.department ? `(${selectedCard.department})` : ""}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-slate-500 text-[11px]">
                reachworld.com/{selectedCard.slug}
              </span>
              <a
                href={`/${selectedCard.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                title="Open live link"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* KPI Highlight Matrix - Navy Background with Crisp White Typography */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Verified Scans */}
        <div className="rounded-2xl bg-[#0A192F] text-white border border-slate-800/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-wider text-slate-300 uppercase">
              VERIFIED NFC SCANS
            </span>
            <Eye className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {stats.totalTaps.toLocaleString()}
            </span>
            <span className="text-xs text-slate-300 font-medium">Physical Taps</span>
          </div>
        </div>

        {/* Metric 2: Total Action Clicks */}
        <div className="rounded-2xl bg-[#0A192F] text-white border border-slate-800/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-wider text-slate-300 uppercase">
              TOTAL ICON CLICKS
            </span>
            <MousePointerClick className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {stats.totalClicks.toLocaleString()}
            </span>
            <span className="text-xs text-slate-300 font-medium">Actions Taken</span>
          </div>
        </div>

        {/* Metric 3: Tap-Through Rate */}
        <div className="rounded-2xl bg-[#0A192F] text-white border border-slate-800/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-wider text-slate-300 uppercase">
              INTERACTION RATE (CTR)
            </span>
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {stats.ctr}%
            </span>
            <span className="text-xs text-slate-300 font-semibold">Conversion</span>
          </div>
        </div>

        {/* Metric 4: Top Performing Channel */}
        <div className="rounded-2xl bg-[#0A192F] text-white border border-slate-800/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-wider text-slate-300 uppercase">
              TOP PERFORMING CHANNEL
            </span>
            <Trophy className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight truncate">
              {stats.topChannel?.name || "None yet"}
            </span>
          </div>
        </div>
      </div>

      {/* If specific card is selected, show its direct link breakdown IMMEDIATELY at the top */}
      {selectedCard && (
        <div className="rounded-2xl bg-white border border-slate-200/80 p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-[#0F172A] tracking-tight">
                Card #{selectedCard.cardNumber} Link Clicks & Actions
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200">
              {(selectedCard.links || []).length} Active Buttons
            </span>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
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
                      <div className="w-8 h-8 rounded-xl bg-[#0A192F] flex items-center justify-center p-1.5 shadow-2xs">
                        <Download className="w-4 h-4 text-white" />
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
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 border border-slate-200 text-slate-800">
                      Active
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-[#0F172A] font-mono">
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
                          <div className="w-8 h-8 rounded-xl bg-[#0A192F] flex items-center justify-center p-1.5 shadow-2xs">
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
                              ? "bg-slate-100 border border-slate-200 text-slate-800"
                              : "bg-slate-100 border border-slate-200 text-slate-400"
                          }`}
                        >
                          {link.isActive ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-[#0F172A] font-mono">
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
      )}

      {/* Main Visual Intelligence Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Channel Click Distribution Chart */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200/80 p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#0A192F] flex items-center justify-center text-white shadow-2xs">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0F172A] tracking-tight">
                  Channel Engagement Distribution
                </h3>
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
                        <div className="w-9 h-9 rounded-xl bg-[#0A192F] flex items-center justify-center p-2 shadow-2xs">
                          <SocialIcon type={channel.icon} className="w-full h-full" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-900">
                              {channel.name}
                            </span>
                            {isTop && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
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
                        <span className="text-sm font-bold text-[#0F172A] font-mono">
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
                            ? "bg-[#0066CC]"
                            : "bg-slate-300"
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

        {/* Right Column (1 span): Funnel & Scope Summary - Dark Navy with Crisp White Typography */}
        <div className="rounded-2xl bg-[#0A192F] text-white border border-slate-800/80 p-6 sm:p-7 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
              <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white shadow-2xs">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Engagement Funnel
                </h3>
              </div>
            </div>

            {/* Funnel Steps */}
            <div className="space-y-2.5 pt-1">
              <div className="p-3.5 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-sky-400" />
                  <span className="text-xs text-slate-200 font-medium">1. Physical NFC Tap</span>
                </div>
                <span className="text-xs font-bold text-white font-mono">
                  {stats.totalTaps} (100%)
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-sky-300" />
                  <span className="text-xs text-slate-200 font-medium">2. Profile Impression</span>
                </div>
                <span className="text-xs font-bold text-white font-mono">
                  {stats.totalTaps} ({stats.totalTaps > 0 ? "100%" : "0%"})
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs text-slate-200 font-medium">3. Contact Action Click</span>
                </div>
                <span className="text-xs font-bold text-white font-mono">
                  {stats.totalClicks} ({stats.ctr}%)
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-teal-300" />
                  <span className="text-xs text-slate-200 font-medium">4. Contact Saved (vCard)</span>
                </div>
                <span className="text-xs font-bold text-white font-mono">
                  {stats.vcardClicks}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top 5 Most Engaged Cards in the Fleet (shown when viewing fleet aggregate) */}
      {!selectedCard && (
        <div className="rounded-2xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-[#0F172A] tracking-tight">
                Top Engaged Cards in Fleet
              </h3>
            </div>
            <span className="text-xs text-slate-500">Slots 01 – 50</span>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
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
                {topEngagedCards.map((c) => {
                  const padded = c.cardNumber < 10 ? `0${c.cardNumber}` : `${c.cardNumber}`;
                  return (
                    <tr
                      key={c._id}
                      onClick={() => onSelectCard(c._id)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-[#0F172A]">
                        #{padded}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#0F172A] group-hover:underline transition-colors">
                        {c.name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {c.department || "General"}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-slate-600">
                        {c.views.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-[#0F172A]">
                        {c.totalActionClicks}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-800">
                        {c.ctr}%
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="text-xs font-semibold text-[#0A192F] underline underline-offset-2">
                          View Card Analytics →
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
