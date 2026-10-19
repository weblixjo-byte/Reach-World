"use client";

import React, { createContext, useContext, useState } from "react";
import DesktopOnlyGuard from "@/components/dashboard/DesktopOnlyGuard";
import {
  CreditCard,
  BarChart3,
  Users,
} from "lucide-react";

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
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
          {/* Top Header Bar */}
          <header className="h-14 bg-white border-b border-[#E2E8F0] px-6 flex items-center justify-between select-none sticky top-0 z-40">
            <div className="flex items-center gap-4">
              {/* Traffic Lights */}
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
                <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                <span className="w-3 h-3 rounded-full bg-[#10B981]" />
              </div>

              <div className="h-4 w-px bg-[#E2E8F0] mx-1" />

              <div className="flex items-center gap-3">
                <img
                  src="/reach-world-logo.png"
                  alt="Reach World"
                  className="h-6 w-auto object-contain brightness-0"
                />
                <span className="text-xs font-semibold tracking-tight text-[#475569]">
                  NFC Cards Console
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#F1F5F9] text-[#0F172A] border border-[#E2E8F0]">
                <span className="w-2 h-2 rounded-full bg-[#0d274c]" />
                Reach World Portal
              </span>
            </div>
          </header>

          {/* Main Dashboard Layout */}
          <div className="flex-1 flex overflow-hidden">
            {/* Dark Refined Sidebar: #0d274c / Slate Dark */}
            <aside className="w-64 bg-[#0a192f] border-r border-[#1e293b] p-5 flex flex-col justify-between select-none text-white shadow-lg">
              <div className="space-y-6">
                {/* Brand Badge */}
                <div className="px-4 py-3 bg-[#112240] rounded-2xl border border-[#233554]">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-[#64748B]">
                    Corporate Workspace
                  </p>
                  <h3 className="text-sm font-bold text-white tracking-tight mt-0.5">
                    Reach World
                  </h3>
                </div>

                {/* Navigation Pill Links */}
                <nav className="space-y-1.5">
                  <button
                    onClick={() => setCurrentView("cards")}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                      currentView === "cards"
                        ? "bg-[#1E3A8A] text-white font-bold shadow-sm"
                        : "text-[#94A3B8] hover:text-white hover:bg-[#112240] font-medium"
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Cards Registry</span>
                  </button>

                  <button
                    onClick={() => setCurrentView("analytics")}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                      currentView === "analytics"
                        ? "bg-[#1E3A8A] text-white font-bold shadow-sm"
                        : "text-[#94A3B8] hover:text-white hover:bg-[#112240] font-medium"
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Analytics</span>
                  </button>

                  <button
                    onClick={() => setCurrentView("departments")}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                      currentView === "departments"
                        ? "bg-[#1E3A8A] text-white font-bold shadow-sm"
                        : "text-[#94A3B8] hover:text-white hover:bg-[#112240] font-medium"
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Departments</span>
                  </button>
                </nav>
              </div>

              {/* Bottom Card Summary Pill */}
              <div className="p-4 bg-[#112240] rounded-2xl border border-[#233554] text-white">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#94A3B8] block mb-1">
                  Card System
                </span>
                <p className="text-xs text-white/90 leading-relaxed font-semibold">
                  Reach World NFC Cards
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
