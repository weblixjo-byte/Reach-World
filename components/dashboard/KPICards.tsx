"use client";

import React from "react";
import { CreditCard, Eye, Layers, MousePointerClick } from "lucide-react";
import { AnalyticsSummary } from "@/actions/card-actions";

interface KPICardsProps {
  analytics: AnalyticsSummary;
}

export default function KPICards({ analytics }: KPICardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Hardware Capacity */}
      <div className="relative overflow-hidden rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] p-5 border border-white/[0.10] shadow-[0_8px_32px_rgba(0,0,0,0.37)] backdrop-blur-xl transition-all">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-bold tracking-wider text-slate-300 uppercase">
            FLEET CAPACITY
          </span>
          <CreditCard className="w-4 h-4 text-sky-400 stroke-[1.75]" />
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-3xl font-extrabold tracking-tight text-white">
            50
          </span>
          <span className="text-xs text-slate-400 font-medium">Slots (01 – 50)</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium pt-1">
          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {analytics.totalActive} Active
          </span>
          <span>•</span>
          <span>Permanent Hardware URLs</span>
        </div>
      </div>

      {/* 2. Total Verified Scans */}
      <div className="relative overflow-hidden rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] p-5 border border-white/[0.10] shadow-[0_8px_32px_rgba(0,0,0,0.37)] backdrop-blur-xl transition-all">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-bold tracking-wider text-slate-300 uppercase">
            TOTAL VERIFIED SCANS
          </span>
          <Eye className="w-4 h-4 text-sky-400 stroke-[1.75]" />
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-3xl font-extrabold tracking-tight text-white">
            {analytics.totalTaps.toLocaleString()}
          </span>
          <span className="text-xs text-slate-400 font-medium">Physical Taps</span>
        </div>
        <div className="text-[11px] text-slate-400 font-medium pt-1">
          <span>Real-time bot-filtered NFC telemetry</span>
        </div>
      </div>

      {/* 3. Link & Contact Interactions */}
      <div className="relative overflow-hidden rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] p-5 border border-white/[0.10] shadow-[0_8px_32px_rgba(0,0,0,0.37)] backdrop-blur-xl transition-all">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-bold tracking-wider text-slate-300 uppercase">
            LINK INTERACTIONS
          </span>
          <MousePointerClick className="w-4 h-4 text-[#38bdf8] stroke-[1.75]" />
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-3xl font-extrabold tracking-tight text-[#38bdf8]">
            {analytics.tapThroughRate > 0 ? analytics.tapThroughRate : 0}
          </span>
          <span className="text-xs text-slate-400 font-medium">Total Icon Clicks</span>
        </div>
        <div className="text-[11px] text-slate-400 font-medium pt-1">
          <span>WhatsApp, Call, & vCard saves</span>
        </div>
      </div>

      {/* 4. Link Modes Distribution */}
      <div className="relative overflow-hidden rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] p-5 border border-white/[0.10] shadow-[0_8px_32px_rgba(0,0,0,0.37)] backdrop-blur-xl transition-all">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-bold tracking-wider text-slate-300 uppercase">
            CARD LINK TYPES
          </span>
          <Layers className="w-4 h-4 text-sky-400 stroke-[1.75]" />
        </div>
        <div className="flex items-baseline gap-3 mb-1">
          <div>
            <span className="text-2xl font-extrabold tracking-tight text-white">
              {analytics.totalProfiles}
            </span>
            <span className="text-[11px] text-slate-400 ml-1 font-medium">Bio</span>
          </div>
          <span className="text-white/20">/</span>
          <div>
            <span className="text-2xl font-extrabold tracking-tight text-[#38bdf8]">
              {analytics.totalCustomLinks}
            </span>
            <span className="text-[11px] text-sky-300 ml-1 font-medium">Custom</span>
          </div>
        </div>
        <div className="text-[11px] text-slate-400 font-medium pt-1">
          <span>Configurable per individual card</span>
        </div>
      </div>
    </div>
  );
}
