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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
      {/* 1. Total Cards */}
      <div className="apple-card rounded-2xl p-5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-[#86868B] uppercase tracking-wider">
            Total Cards
          </span>
          <div className="w-8 h-8 rounded-xl bg-[#0071E3]/10 flex items-center justify-center text-[#0071E3]">
            <CreditCard className="w-4 h-4 stroke-[2]" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl font-bold tracking-tight text-[#1D1D1F]">
            {analytics.totalCards}
          </span>
          <span className="text-xs text-[#86868B]">Registered</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#34C759] font-medium">
          <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse" />
          <span>{analytics.totalActive} Active Now</span>
        </div>
      </div>

      {/* 2. Total Taps / Views */}
      <div className="apple-card rounded-2xl p-5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-[#86868B] uppercase tracking-wider">
            Total Taps & Views
          </span>
          <div className="w-8 h-8 rounded-xl bg-[#34C759]/10 flex items-center justify-center text-[#34C759]">
            <Eye className="w-4 h-4 stroke-[2]" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl font-bold tracking-tight text-[#1D1D1F]">
            {analytics.totalTaps.toLocaleString()}
          </span>
          <span className="text-xs text-[#86868B]">taps</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#34C759] font-medium">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-[#34C759]/10 text-[#34C759]">
            +18%
          </span>
          <span className="text-[#86868B]">vs last month</span>
        </div>
      </div>

      {/* 3. Top Performer Card */}
      <div className="apple-card rounded-2xl p-5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-[#86868B] uppercase tracking-wider">
            Top Visited Card
          </span>
          <div className="w-8 h-8 rounded-xl bg-[#FF9500]/10 flex items-center justify-center text-[#FF9500]">
            <Sparkles className="w-4 h-4 stroke-[2]" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          {topPerformer?.avatarUrl ? (
            <img
              src={topPerformer.avatarUrl}
              alt={topPerformer.name}
              className="w-10 h-10 rounded-xl object-cover border border-black/5"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-[#F5F5F7] border border-black/5 flex items-center justify-center text-xs font-semibold text-[#1D1D1F]">
              {topPerformer?.name?.slice(0, 2).toUpperCase() || "RW"}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-[#1D1D1F] truncate">
              {topPerformer?.name || "No records"}
            </h4>
            <p className="text-xs text-[#86868B] truncate">
              {topPerformer?.views?.toLocaleString() || 0} taps • {topPerformer?.jobTitle || "Executive"}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Tap-Through Rate */}
      <div className="apple-card rounded-2xl p-5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-[#86868B] uppercase tracking-wider">
            Tap-Through Rate (CTR)
          </span>
          <div className="w-8 h-8 rounded-xl bg-[#AF52DE]/10 flex items-center justify-center text-[#AF52DE]">
            <TrendingUp className="w-4 h-4 stroke-[2]" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl font-bold tracking-tight text-[#1D1D1F]">
            {analytics.tapThroughRate}%
          </span>
          <span className="text-xs text-[#86868B]">avg engagement</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#86868B]">
          <span className="w-full bg-[#F5F5F7] h-1.5 rounded-full overflow-hidden">
            <span
              className="block bg-[#AF52DE] h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, analytics.tapThroughRate)}%` }}
            />
          </span>
        </div>
      </div>
    </div>
  );
}
