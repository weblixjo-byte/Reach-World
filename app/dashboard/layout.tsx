"use client";

import React, { createContext, useContext, useState } from "react";
import DesktopOnlyGuard from "@/components/dashboard/DesktopOnlyGuard";
import {
  CreditCard,
  BarChart3,
  Users,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

export type DashboardViewType = "cards" | "analytics" | "departments";

interface DashboardNavContextType {
  currentView: DashboardViewType;
  setCurrentView: (view: DashboardViewType) => void;
}

export const DashboardNavContext = createContext<DashboardNavContextType>({
  currentView: "cards",
  setCurrentView: () => {},
});

export const useDashboardNav = () => useContext(DashboardNavContext);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentView, setCurrentView] = useState<DashboardViewType>("cards");

  return (
    <DesktopOnlyGuard>
      <DashboardNavContext.Provider value={{ currentView, setCurrentView }}>
        <div className="min-h-screen bg-[#F5F5F7] flex flex-col font-sans">
          {/* macOS Top Control Glass Bar */}
          <header className="h-12 bg-white/80 backdrop-blur-xl border-b border-black/[0.06] px-6 flex items-center justify-between select-none sticky top-0 z-40 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-4">
              {/* Traffic Lights */}
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] shadow-2xs" />
                <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] shadow-2xs" />
                <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] shadow-2xs" />
              </div>

              <div className="h-4 w-px bg-black/10 mx-1" />

              <div className="flex items-center gap-2.5">
                <img
                  src="/reach-world-logo.png"
                  alt="Reach World"
                  className="h-5 w-auto object-contain brightness-0"
                />
                <span className="text-xs font-semibold tracking-tight text-[#1D1D1F]">
                  NFC Cloud Console
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#34C759]/10 text-[#34C759]">
                <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse" />
                Live Active
              </span>
            </div>
          </header>

          {/* Main Dashboard Layout */}
          <div className="flex-1 flex overflow-hidden">
            {/* Ultra-Clean Apple Left Sidebar */}
            <aside className="w-64 bg-white/70 backdrop-blur-xl border-r border-black/[0.06] p-5 flex flex-col justify-between select-none shadow-[2px_0_12px_rgba(0,0,0,0.015)]">
              <div className="space-y-6">
                {/* Brand Title Pill */}
                <div className="px-3 py-2 bg-[#F5F5F7] rounded-2xl border border-black/[0.04]">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-[#86868B]">
                    Organization
                  </p>
                  <h3 className="text-sm font-bold text-[#1D1D1F] tracking-tight mt-0.5">
                    Reach World
                  </h3>
                </div>

                {/* Navigation Pill Links */}
                <nav className="space-y-1.5">
                  <button
                    onClick={() => setCurrentView("cards")}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      currentView === "cards"
                        ? "bg-[#0071E3] text-white shadow-sm font-semibold"
                        : "text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.04]"
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Cards Registry</span>
                  </button>

                  <button
                    onClick={() => setCurrentView("analytics")}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      currentView === "analytics"
                        ? "bg-[#0071E3] text-white shadow-sm font-semibold"
                        : "text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.04]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-4 h-4" />
                      <span>Analytics</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setCurrentView("departments")}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      currentView === "departments"
                        ? "bg-[#0071E3] text-white shadow-sm font-semibold"
                        : "text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.04]"
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Departments</span>
                  </button>
                </nav>
              </div>

              {/* Bottom Card Summary Pill */}
              <div className="p-4 bg-gradient-to-br from-[#0d274c] to-[#040e1c] rounded-2xl text-white shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#38bdf8]">
                    Reach Smart Cards
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#34C759]" />
                </div>
                <p className="text-xs text-white/80 leading-relaxed font-medium">
                  Instant NFC & Digital Bio Identity for Reach World team.
                </p>
              </div>
            </aside>

            {/* Content Area */}
            <main className="flex-1 overflow-y-auto p-8">{children}</main>
          </div>
        </div>
      </DashboardNavContext.Provider>
    </DesktopOnlyGuard>
  );
}
