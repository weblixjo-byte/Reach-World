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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
      {/* 1. Total Cards */}
      <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
            Total Cards
          </span>
          <div className="w-9 h-9 rounded-xl bg-[#F1F5F9] text-[#0F172A] flex items-center justify-center">
            <CreditCard className="w-4 h-4 stroke-[2]" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-extrabold tracking-tight text-[#0F172A]">
            {analytics.totalCards}
          </span>
          <span className="text-xs text-[#64748B] font-medium">Cards</span>
        </div>
        <p className="text-xs text-[#64748B] font-medium">
          {analytics.totalActive} Active Cards
        </p>
      </div>

      {/* 2. Total Taps */}
      <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
            Total Taps
          </span>
          <div className="w-9 h-9 rounded-xl bg-[#F1F5F9] text-[#0F172A] flex items-center justify-center">
            <Eye className="w-4 h-4 stroke-[2]" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-extrabold tracking-tight text-[#0F172A]">
            {analytics.totalTaps.toLocaleString()}
          </span>
          <span className="text-xs text-[#64748B] font-medium">Views</span>
        </div>
        <p className="text-xs text-[#64748B] font-medium">
          Total Public Views
        </p>
      </div>

      {/* 3. Top Performer Card */}
      <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
            Top Visited Card
          </span>
          <div className="w-9 h-9 rounded-xl bg-[#F1F5F9] text-[#0F172A] flex items-center justify-center">
            <Users className="w-4 h-4 stroke-[2]" />
          </div>
        </div>
        {topPerformer ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F172A] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
              {topPerformer.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-[#0F172A] truncate">
                {topPerformer.name}
              </h4>
              <p className="text-xs text-[#64748B] truncate font-medium">
                {topPerformer.views.toLocaleString()} taps
              </p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-[#64748B] py-2">
            No visitor taps recorded yet
          </p>
        )}
      </div>

      {/* 4. Tap-Through Rate */}
      <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
            Engagement Rate
          </span>
          <div className="w-9 h-9 rounded-xl bg-[#F1F5F9] text-[#0F172A] flex items-center justify-center">
            <Activity className="w-4 h-4 stroke-[2]" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-3xl font-extrabold tracking-tight text-[#0F172A]">
            {analytics.tapThroughRate}%
          </span>
          <span className="text-xs text-[#64748B] font-medium">CTR</span>
        </div>
        <div className="w-full bg-[#F1F5F9] h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#0F172A] h-full rounded-full transition-all duration-700"
            style={{ width: `${Math.min(100, analytics.tapThroughRate)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
