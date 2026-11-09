"use client";

import React from "react";
import { CreditCard, Eye, Users, ArrowUpRight, Globe, Layers } from "lucide-react";
import { AnalyticsSummary } from "@/actions/card-actions";

interface KPICardsProps {
  analytics: AnalyticsSummary;
}

export default function KPICards({ analytics }: KPICardsProps) {
  const topPerformer = analytics.topPerformer;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* 1. 50 Hardware Cards */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-black/[0.06] shadow-[0_2px_14px_rgba(0,0,0,0.02)] hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider">
            NFC Physical Cards
          </span>
          <div className="w-8 h-8 rounded-xl bg-[#0a192f] text-white flex items-center justify-center shadow-xs">
            <CreditCard className="w-4 h-4 stroke-[2]" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-1.5">
          <span className="text-3xl font-extrabold tracking-tight text-[#1D1D1F]">
            50
          </span>
          <span className="text-xs text-[#86868B] font-semibold">Cards (Slots 01 - 50)</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 font-semibold text-[#34C759]">
            <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse" />
            {analytics.totalActive} Active
          </span>
          <span className="text-[#86868B]">•</span>
          <span className="text-[#86868B] font-medium">
            {analytics.totalCards - analytics.totalActive} Paused
          </span>
        </div>
      </div>

      {/* 2. Total Taps */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-black/[0.06] shadow-[0_2px_14px_rgba(0,0,0,0.02)] hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider">
            Verified Card Taps
          </span>
          <div className="w-8 h-8 rounded-xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center">
            <Eye className="w-4 h-4 stroke-[2]" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-1.5">
          <span className="text-3xl font-extrabold tracking-tight text-[#1D1D1F]">
            {analytics.totalTaps.toLocaleString()}
          </span>
          <span className="text-xs text-[#86868B] font-semibold">Total Scans</span>
        </div>
        <p className="text-xs text-[#86868B] font-medium flex items-center gap-1">
          <ArrowUpRight className="w-3.5 h-3.5 text-[#34C759]" />
          Real-time verified tap metrics
        </p>
      </div>

      {/* 3. Card Link Types */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-black/[0.06] shadow-[0_2px_14px_rgba(0,0,0,0.02)] hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider">
            Card Link Types
          </span>
          <div className="w-8 h-8 rounded-xl bg-[#F5F5F7] text-[#1D1D1F] flex items-center justify-center">
            <Layers className="w-4 h-4 stroke-[2]" />
          </div>
        </div>
        <div className="flex items-baseline gap-3 mb-1.5">
          <div>
            <span className="text-2xl font-extrabold tracking-tight text-[#1D1D1F]">
              {analytics.totalProfiles}
            </span>
            <span className="text-[11px] text-[#86868B] ml-1 font-medium">Digital Bio</span>
          </div>
          <span className="text-[#86868B]">/</span>
          <div>
            <span className="text-2xl font-extrabold tracking-tight text-[#0071E3]">
              {analytics.totalCustomLinks}
            </span>
            <span className="text-[11px] text-[#0071E3] ml-1 font-medium">Custom Links</span>
          </div>
        </div>
        <p className="text-xs text-[#86868B] font-medium">
          Instant link customization supported
        </p>
      </div>

      {/* 4. Top Performer Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-black/[0.06] shadow-[0_2px_14px_rgba(0,0,0,0.02)] hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider">
            Most Visited Card
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Users className="w-4 h-4 stroke-[2]" />
          </div>
        </div>
        {topPerformer ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0a192f] flex flex-col items-center justify-center text-white shrink-0 shadow-xs">
              <span className="text-[9px] text-amber-400">#</span>
              <span className="text-xs font-extrabold leading-none">
                {topPerformer.cardNumber < 10 ? `0${topPerformer.cardNumber}` : topPerformer.cardNumber}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-[#1D1D1F] truncate">
                {topPerformer.name}
              </h4>
              <p className="text-xs text-[#86868B] truncate font-medium">
                <span className="text-[#0071E3] font-bold">{topPerformer.views.toLocaleString()} taps</span> •{" "}
                {topPerformer.mode === "redirect" ? "Custom Link" : "Digital Profile"}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-[#86868B] py-2 font-medium">
            Tap cards to generate activity
          </p>
        )}
      </div>
    </div>
  );
}
