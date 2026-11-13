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
      <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
            FLEET CAPACITY
          </span>
          <CreditCard className="w-4 h-4 text-[#0A192F] stroke-[1.75]" />
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-3xl font-extrabold tracking-tight text-[#0F172A]">
            50
          </span>
          <span className="text-xs text-slate-500 font-medium">Slots (01 – 50)</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium pt-1">
          <span className="inline-flex items-center gap-1.5 text-slate-800 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0A192F]" />
            {analytics.totalActive} Active
          </span>
          <span>•</span>
          <span>Hardware Fleet</span>
        </div>
      </div>

      {/* 2. Total Verified Scans */}
      <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
            TOTAL VERIFIED SCANS
          </span>
          <Eye className="w-4 h-4 text-[#0A192F] stroke-[1.75]" />
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-3xl font-extrabold tracking-tight text-[#0F172A]">
            {analytics.totalTaps.toLocaleString()}
          </span>
          <span className="text-xs text-slate-500 font-medium">Physical Taps</span>
        </div>
        <div className="text-[11px] text-slate-500 font-medium pt-1">
          <span>Bot-filtered NFC telemetry</span>
        </div>
      </div>

      {/* 3. Link & Contact Interactions */}
      <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
            LINK INTERACTIONS
          </span>
          <MousePointerClick className="w-4 h-4 text-[#0A192F] stroke-[1.75]" />
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-3xl font-extrabold tracking-tight text-[#0F172A]">
            {analytics.tapThroughRate > 0 ? analytics.tapThroughRate : 0}
          </span>
          <span className="text-xs text-slate-500 font-medium">Total Icon Clicks</span>
        </div>
        <div className="text-[11px] text-slate-500 font-medium pt-1">
          <span>WhatsApp, Call, & vCard saves</span>
        </div>
      </div>

      {/* 4. Link Modes Distribution */}
      <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
            CARD LINK TYPES
          </span>
          <Layers className="w-4 h-4 text-[#0A192F] stroke-[1.75]" />
        </div>
        <div className="flex items-baseline gap-3 mb-1">
          <div>
            <span className="text-2xl font-extrabold tracking-tight text-[#0F172A]">
              {analytics.totalProfiles}
            </span>
            <span className="text-[11px] text-slate-500 ml-1 font-medium">Bio</span>
          </div>
          <span className="text-slate-300">/</span>
          <div>
            <span className="text-2xl font-extrabold tracking-tight text-[#0F172A]">
              {analytics.totalCustomLinks}
            </span>
            <span className="text-[11px] text-slate-600 ml-1 font-medium">Custom</span>
          </div>
        </div>
        <div className="text-[11px] text-slate-500 font-medium pt-1">
          <span>Configurable per card</span>
        </div>
      </div>
    </div>
  );
}
