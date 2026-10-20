"use client";

import React from "react";
import { CreditCard, Eye, Users, Activity } from "lucide-react";
import { AnalyticsSummary } from "@/actions/card-actions";

interface KPICardsProps {
  analytics: AnalyticsSummary;
}

export default function KPICards({ analytics }: KPICardsProps) {
  const topPerformer = analytics.topPerformer;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6 sm:mb-8">
      {/* 1. Total Cards */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#E2E8F0] shadow-xs hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <span className="text-[11px] sm:text-xs font-bold text-[#64748B] uppercase tracking-wider">
            Total Cards
          </span>
          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-[#F1F5F9] text-[#0F172A] flex items-center justify-center">
            <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5 sm:gap-2 mb-1 sm:mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">
            {analytics.totalCards}
          </span>
          <span className="text-[11px] sm:text-xs text-[#64748B] font-medium">Cards</span>
        </div>
        <p className="text-[11px] sm:text-xs text-[#64748B] font-medium">
          {analytics.totalActive} Active
        </p>
      </div>

      {/* 2. Total Taps */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#E2E8F0] shadow-xs hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <span className="text-[11px] sm:text-xs font-bold text-[#64748B] uppercase tracking-wider">
            Total Taps
          </span>
          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-[#F1F5F9] text-[#0F172A] flex items-center justify-center">
            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5 sm:gap-2 mb-1 sm:mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">
            {analytics.totalTaps.toLocaleString()}
          </span>
          <span className="text-[11px] sm:text-xs text-[#64748B] font-medium">Views</span>
        </div>
        <p className="text-[11px] sm:text-xs text-[#64748B] font-medium">
          Total Views
        </p>
      </div>

      {/* 3. Top Performer Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#E2E8F0] shadow-xs hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <span className="text-[11px] sm:text-xs font-bold text-[#64748B] uppercase tracking-wider">
            Top Visited
          </span>
          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-[#F1F5F9] text-[#0F172A] flex items-center justify-center">
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
          </div>
        </div>
        {topPerformer ? (
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#0F172A] flex items-center justify-center text-white font-bold text-[11px] sm:text-xs flex-shrink-0">
              {topPerformer.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs sm:text-sm font-bold text-[#0F172A] truncate">
                {topPerformer.name}
              </h4>
              <p className="text-[10px] sm:text-xs text-[#64748B] truncate font-medium">
                {topPerformer.views.toLocaleString()} taps
              </p>
            </div>
          </div>
        ) : (
          <p className="text-[11px] sm:text-xs text-[#64748B] py-1 sm:py-2">
            No taps recorded
          </p>
        )}
      </div>

      {/* 4. Tap-Through Rate */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#E2E8F0] shadow-xs hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <span className="text-[11px] sm:text-xs font-bold text-[#64748B] uppercase tracking-wider">
            Engagement
          </span>
          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-[#F1F5F9] text-[#0F172A] flex items-center justify-center">
            <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5 sm:gap-2 mb-2 sm:mb-3">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">
            {analytics.tapThroughRate}%
          </span>
          <span className="text-[11px] sm:text-xs text-[#64748B] font-medium">CTR</span>
        </div>
        <div className="w-full bg-[#F1F5F9] h-1.5 sm:h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#0F172A] h-full rounded-full transition-all duration-700"
            style={{ width: `${Math.min(100, analytics.tapThroughRate)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
