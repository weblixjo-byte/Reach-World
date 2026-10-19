"use client";

import React from "react";
import { CreditCard, Eye, TrendingUp, Sparkles } from "lucide-react";
import { AnalyticsSummary } from "@/actions/card-actions";

interface KPICardsProps {
  analytics: AnalyticsSummary;
}

export default function KPICards({ analytics }: KPICardsProps) {
  const topPerformer = analytics.topPerformer;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
      {/* 1. Total Cards */}
      <div className="bg-white rounded-3xl p-6 border border-black/[0.05] shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-[#86868B] uppercase tracking-wider">
            Total Cards
          </span>
          <div className="w-10 h-10 rounded-2xl bg-[#0071E3]/10 flex items-center justify-center text-[#0071E3]">
            <CreditCard className="w-5 h-5 stroke-[2]" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-extrabold tracking-tight text-[#1D1D1F]">
            {analytics.totalCards}
          </span>
          <span className="text-xs text-[#86868B] font-medium">Issued</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#34C759] font-medium">
          <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse" />
          <span>{analytics.totalActive} Active Now</span>
        </div>
      </div>

      {/* 2. Total Taps */}
      <div className="bg-white rounded-3xl p-6 border border-black/[0.05] shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-[#86868B] uppercase tracking-wider">
            Total Taps
          </span>
          <div className="w-10 h-10 rounded-2xl bg-[#34C759]/10 flex items-center justify-center text-[#34C759]">
            <Eye className="w-5 h-5 stroke-[2]" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-extrabold tracking-tight text-[#1D1D1F]">
            {analytics.totalTaps.toLocaleString()}
          </span>
          <span className="text-xs text-[#86868B] font-medium">Views</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#34C759] font-medium">
          <span className="px-2 py-0.5 rounded-full bg-[#34C759]/10 font-bold">
            Realtime
          </span>
          <span className="text-[#86868B]">Interactions</span>
        </div>
      </div>

      {/* 3. Top Performer Card */}
      <div className="bg-white rounded-3xl p-6 border border-black/[0.05] shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-[#86868B] uppercase tracking-wider">
            Most Visited Card
          </span>
          <div className="w-10 h-10 rounded-2xl bg-[#FF9500]/10 flex items-center justify-center text-[#FF9500]">
            <Sparkles className="w-5 h-5 stroke-[2]" />
          </div>
        </div>
        {topPerformer ? (
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#0071E3] flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {topPerformer.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-[#1D1D1F] truncate">
                {topPerformer.name}
              </h4>
              <p className="text-xs text-[#86868B] truncate font-medium">
                {topPerformer.views.toLocaleString()} taps • {topPerformer.jobTitle || "Executive"}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-[#86868B] italic py-2">
            Waiting for first card interaction.
          </p>
        )}
      </div>

      {/* 4. Tap-Through Rate */}
      <div className="bg-white rounded-3xl p-6 border border-black/[0.05] shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-[#86868B] uppercase tracking-wider">
            Engagement Rate
          </span>
          <div className="w-10 h-10 rounded-2xl bg-[#AF52DE]/10 flex items-center justify-center text-[#AF52DE]">
            <TrendingUp className="w-5 h-5 stroke-[2]" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-3xl font-extrabold tracking-tight text-[#1D1D1F]">
            {analytics.tapThroughRate}%
          </span>
          <span className="text-xs text-[#86868B] font-medium">Engagement</span>
        </div>
        <div className="w-full bg-[#F5F5F7] h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#AF52DE] h-full rounded-full transition-all duration-700"
            style={{ width: `${Math.min(100, analytics.tapThroughRate)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
